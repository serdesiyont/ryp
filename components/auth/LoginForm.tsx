"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Mail } from "lucide-react";
import { authClient, getAuthCallbackURL } from "@/lib/auth-client";

import {
  AuthDivider,
  GoogleButton,
  PasswordField,
} from "@/components/auth/shared";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  remember: z.boolean().optional(),
});

export type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    setStatus(null);

    try {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setStatus(error.message || "Failed to sign in. Please try again.");
        setSubmitting(false);
        return;
      }

      setStatus(`Signed in successfully! Redirecting...`);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);
    } catch (err) {
      setStatus("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setSubmitting(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: getAuthCallbackURL(),
      });
    } catch (err) {
      setStatus("Failed to sign in with Google. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full border border-slate-200 bg-white text-slate-900 shadow-xl shadow-slate-200/70">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Access your ratings and saved professors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <GoogleButton
          label="Continue with Google"
          onClick={handleGoogleSignIn}
          disabled={submitting}
        />
        <AuthDivider />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        autoComplete="email"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <PasswordField
                  label="Password"
                  placeholder="••••••••"
                  field={field}
                  description="At least 8 characters"
                />
              )}
            />

            <div className="flex items-center justify-between gap-3 text-sm">
              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(Boolean(checked))
                        }
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Remember me</FormLabel>
                  </FormItem>
                )}
              />
              <Link
                href="/forgot-password"
                className="font-semibold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            {status ? (
              <p className="text-center text-sm text-muted-foreground">
                {status}
              </p>
            ) : null}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        <span>New here?</span>
        <Link
          href="/signup"
          className="ml-1 font-semibold text-primary hover:underline"
        >
          Create an account
        </Link>
      </CardFooter>
    </Card>
  );
}
