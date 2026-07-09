import { connectToDatabase } from "@/lib/db/connect";
import { LecturerModel } from "@/lib/db/models/lecturer";
import { NotFoundError } from "@/lib/server/http";

export interface CreateLecturerInput {
  name: string;
  university: string;
  department: string;
  courses: string[];
}

export type UpdateLecturerInput = Partial<CreateLecturerInput>;

export async function createLecturer(input: CreateLecturerInput) {
  await connectToDatabase();
  return LecturerModel.create(input);
}

export async function findAllLecturers() {
  await connectToDatabase();
  return LecturerModel.find().exec();
}

export async function findLecturerById(id: string) {
  await connectToDatabase();
  const lecturer = await LecturerModel.findById(id).exec();
  if (!lecturer) {
    throw new NotFoundError(`Lecturer with ID "${id}" not found`);
  }
  return lecturer;
}

export async function updateLecturer(id: string, input: UpdateLecturerInput) {
  await connectToDatabase();
  const lecturer = await LecturerModel.findByIdAndUpdate(id, input, {
    new: true,
  }).exec();
  if (!lecturer) {
    throw new NotFoundError(`Lecturer with ID "${id}" not found`);
  }
  return lecturer;
}

export async function removeLecturer(id: string) {
  await connectToDatabase();
  const lecturer = await LecturerModel.findByIdAndDelete(id).exec();
  if (!lecturer) {
    throw new NotFoundError(`Lecturer with ID "${id}" not found`);
  }
  return lecturer;
}

export async function addCourseToLecturer(id: string, course: string) {
  await connectToDatabase();
  const lecturer = await LecturerModel.findByIdAndUpdate(
    id,
    { $push: { courses: course } },
    { new: true }
  ).exec();
  if (!lecturer) {
    throw new NotFoundError(`Lecturer with ID "${id}" not found`);
  }
  return lecturer;
}

export async function removeCourseFromLecturer(id: string, course: string) {
  await connectToDatabase();
  const lecturer = await LecturerModel.findByIdAndUpdate(
    id,
    { $pull: { courses: course } },
    { new: true }
  ).exec();
  if (!lecturer) {
    throw new NotFoundError(`Lecturer with ID "${id}" not found`);
  }
  return lecturer;
}
