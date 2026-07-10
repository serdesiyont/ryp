"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createLecturer } from "@/lib/api/lecturers";
import { fetchSchools } from "@/lib/api/schools";

const lecturerSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  university: z.string().trim().min(2, "University is required"),
  department: z.string().trim().min(2, "Department is required"),
  courses: z
    .array(z.string().trim().min(1, "Course name cannot be empty"))
    .min(1, "Add at least one course"),
});

export type LecturerFormValues = z.infer<typeof lecturerSchema>;

const UNIVERSITIES_CACHE_KEY = "universities-cache-v1";
const UNIVERSITIES_CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours

export function LecturerForm() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<LecturerFormValues>({
    resolver: zodResolver(lecturerSchema),
    defaultValues: {
      name: "",
      university: "",
      department: "",
      courses: [],
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [courseInput, setCourseInput] = useState("");
  const [universities, setUniversities] = useState<string[]>([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(false);
  const [showUniversitySuggestions, setShowUniversitySuggestions] =
    useState(false);

  const courses = form.watch("courses");
  const universityValue = form.watch("university");

  useEffect(() => {
    let active = true;
    const loadUniversities = async () => {
      if (typeof window === "undefined") return;

      const cachedRaw = localStorage.getItem(UNIVERSITIES_CACHE_KEY);
      if (cachedRaw) {
        try {
          const cached = JSON.parse(cachedRaw) as {
            data: string[];
            timestamp: number;
          };
          const isFresh =
            Date.now() - cached.timestamp < UNIVERSITIES_CACHE_TTL;
          if (cached.data?.length) {
            setUniversities(cached.data);
            if (isFresh) return;
          }
        } catch {
          // ignore malformed cache
        }
      }

      setUniversitiesLoading(true);
      try {
        const schools = await fetchSchools();
        if (!active) return;
        const unique = Array.from(
          new Set(
            schools
              .map((s) => s.name)
              .filter(Boolean)
              .map((name) => name.trim())
          )
        ).sort((a, b) => a.localeCompare(b));
        setUniversities(unique);
        localStorage.setItem(
          UNIVERSITIES_CACHE_KEY,
          JSON.stringify({ data: unique, timestamp: Date.now() })
        );
      } catch (err) {
        console.error("Failed to load universities", err);
      } finally {
        if (active) setUniversitiesLoading(false);
      }
    };

    loadUniversities();
    return () => {
      active = false;
    };
  }, []);

  const addCourse = () => {
    const value = courseInput.trim();
    if (!value) return;
    if (courses.includes(value)) {
      setCourseInput("");
      return;
    }
    form.setValue("courses", [...courses, value], { shouldValidate: true });
    setCourseInput("");
  };

  const removeCourse = (name: string) => {
    form.setValue(
      "courses",
      courses.filter((c) => c !== name),
      { shouldValidate: true }
    );
  };

  async function onSubmit(values: LecturerFormValues) {
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await createLecturer(values);
      const lecturerId = res?.data?._id;

      toast({
        title: "Lecturer created",
        description: "Redirecting to the lecturer page...",
      });

      form.reset({ name: "", university: "", department: "", courses: [] });

      if (lecturerId) {
        router.push(`/professor/${lecturerId}`);
      }
    } catch (err: any) {
      const message =
        err?.message || "Failed to add lecturer. Please try again.";
      setStatus(message);
      toast({
        variant: "destructive",
        title: "Unable to add lecturer",
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lecturer name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Dr. Samson" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="university"
            render={({ field }) => {
              const filteredUniversities = universities
                .filter((name) =>
                  universityValue
                    ? name.toLowerCase().includes(universityValue.toLowerCase())
                    : true
                )
                .slice(0, 12);

              return (
                <FormItem className="flex h-full flex-col justify-end mt-2">
                  <FormLabel>University</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="e.g., Addis Ababa University"
                        autoComplete="off"
                        {...field}
                        onFocus={(e) => {
                          setShowUniversitySuggestions(true);
                          field.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                          setTimeout(
                            () => setShowUniversitySuggestions(false),
                            120
                          );
                          field.onBlur?.(e);
                        }}
                      />
                      {showUniversitySuggestions &&
                      filteredUniversities.length > 0 ? (
                        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white/80 shadow-lg backdrop-blur">
                          {filteredUniversities.map((name) => (
                            <button
                              type="button"
                              key={name}
                              className="block w-full px-3 py-2 text-left text-sm hover:bg-white/60"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                form.setValue("university", name, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                                setShowUniversitySuggestions(false);
                              }}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </FormControl>
                  <FormDescription>
                    {universitiesLoading ? "Loading universities..." : ""}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem className="flex h-full flex-col justify-end">
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Computer Science" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="courses"
          render={() => (
            <FormItem>
              <FormLabel>Courses</FormLabel>
              <FormDescription>
                Add at least one course taught by this lecturer.
              </FormDescription>
              <div className="flex gap-2">
                <Input
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  placeholder="e.g., Database Systems"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCourse();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addCourse}>
                  <Plus className="size-4" />
                  <span className="ml-1">Add</span>
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {courses.map((course) => (
                  <span
                    key={course}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
                  >
                    {course}
                    <button
                      type="button"
                      onClick={() => removeCourse(course)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={`Remove ${course}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span className="ml-2">Creating...</span>
              </>
            ) : (
              "Add lecturer"
            )}
          </Button>
          {status ? (
            <p className="text-sm text-muted-foreground sm:text-right">
              {status}
            </p>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
