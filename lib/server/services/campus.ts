import { connectToDatabase } from "@/lib/db/connect";
import { CampusModel } from "@/lib/db/models/campus";
import { NotFoundError } from "@/lib/server/http";

export interface CreateCampusInput {
  name: string;
  address: string;
  description?: string;
}

export type UpdateCampusInput = Partial<CreateCampusInput>;

export async function createCampus(input: CreateCampusInput) {
  await connectToDatabase();
  return CampusModel.create(input);
}

export async function findAllCampuses() {
  await connectToDatabase();
  return CampusModel.find().exec();
}

export async function findCampusById(id: string) {
  await connectToDatabase();
  const campus = await CampusModel.findById(id).exec();
  if (!campus) {
    throw new NotFoundError(`Campus with ID "${id}" not found`);
  }
  return campus;
}

export async function updateCampus(id: string, input: UpdateCampusInput) {
  await connectToDatabase();
  const campus = await CampusModel.findByIdAndUpdate(id, input, {
    new: true,
  }).exec();
  if (!campus) {
    throw new NotFoundError(`Campus with ID "${id}" not found`);
  }
  return campus;
}

export async function removeCampus(id: string) {
  await connectToDatabase();
  const campus = await CampusModel.findByIdAndDelete(id).exec();
  if (!campus) {
    throw new NotFoundError(`Campus with ID "${id}" not found`);
  }
  return campus;
}
