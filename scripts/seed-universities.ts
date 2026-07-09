/**
 * Seed the `campuses` collection from universities.json.
 *
 * Run with Node's native TypeScript support (Node 22.6+):
 *   node --env-file=.env scripts/seed-universities.ts
 * or via the npm script:
 *   npm run seed:universities
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import mongoose, { Schema } from "mongoose";

interface UniversityData {
  name: string;
  address: { city: string; region: string; zone: string };
  description: string;
}

const CampusSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String },
    overallRating: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

async function seedUniversities() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Missing required environment variable: MONGO_URI");
  }

  await mongoose.connect(uri);
  const Campus = mongoose.model("Campus", CampusSchema);

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const universitiesPath = join(__dirname, "../universities.json");
  const universitiesData = JSON.parse(
    readFileSync(universitiesPath, "utf-8")
  ) as UniversityData[];

  console.log(`Found ${universitiesData.length} universities to seed`);

  let successCount = 0;
  let errorCount = 0;

  for (const university of universitiesData) {
    try {
      await Campus.create({
        name: university.name,
        address: university.address.city,
        description: university.description,
      });
      successCount++;
      console.log(`✓ Added: ${university.name}`);
    } catch (error) {
      errorCount++;
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`✗ Failed to add ${university.name}:`, message);
    }
  }

  console.log(`\nSeeding complete. Success: ${successCount}, Errors: ${errorCount}`);
  await mongoose.disconnect();
}

seedUniversities()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
