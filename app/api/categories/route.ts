import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  try {
    try {
      await connectDB();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      return NextResponse.json(
        { error: "Database connection failed", details: errorMessage },
        { status: 500 }
      );
    }

    const categories = await Category.find({ status: "active" }).sort({
      createdAt: -1,
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        error: "Failed to fetch categories",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

