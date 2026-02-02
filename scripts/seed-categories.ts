import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import connectDB from "../lib/mongodb";
import Category from "../models/Category";

const seedCategories = async () => {
  try {
    await connectDB();

    const categories = [
      { name: "Golden Numbers", slug: "golden-numbers" },
      { name: "Silver Numbers", slug: "silver-numbers" },
      { name: "Platinum Numbers", slug: "platinum-numbers" },
      { name: "Diamond Numbers", slug: "diamond-numbers" },
      { name: "Premium", slug: "premium" },
      { name: "Count", slug: "count" },
      { name: "Hepta", slug: "hepta" },
      { name: "Hexa", slug: "hexa" },
      { name: "Penta", slug: "penta" },
      { name: "Tetra", slug: "tetra" },
      { name: "Triple", slug: "triple" },
      { name: "Triplet", slug: "triplet" },
      { name: "Tripple-Tetra", slug: "tripple-tetra" },
      { name: "Octa", slug: "octa" },
      { name: "Master Code", slug: "master-code" },
      { name: "Easy to Remember", slug: "easy-to-remember" },
      { name: "Repeating Pair", slug: "repeating-pair" },
      { name: "Slider", slug: "slider" },
      { name: "Doubl", slug: "doubl" },
      { name: "UAN", slug: "uan" },
      { name: "0300", slug: "0300" },
      { name: "03000", slug: "03000" },
      { name: "0321", slug: "0321" },
      { name: "786", slug: "786" },
    ];

    let created = 0;
    let skipped = 0;

    for (const category of categories) {
      const existing = await Category.findOne({ slug: category.slug });
      if (existing) {
        console.log(`Category "${category.name}" already exists, skipping...`);
        skipped++;
        continue;
      }

      await Category.create({
        name: category.name,
        slug: category.slug,
        status: "active",
      });
      console.log(`✅ Created category: ${category.name}`);
      created++;
    }

    console.log(`\n✅ Categories seeding completed!`);
    console.log(`Created: ${created}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total: ${categories.length}`);
  } catch (error) {
    console.error("Error seeding categories:", error);
  } finally {
    process.exit(0);
  }
};

seedCategories();

