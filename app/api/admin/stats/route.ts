import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Number from "@/models/Number";
import Category from "@/models/Category";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const totalNumbers = await Number.countDocuments();
    const availableNumbers = await Number.countDocuments({ status: "available" });
    const preOwnedNumbers = await Number.countDocuments({ status: "pre-owned" });
    const totalCategories = await Category.countDocuments();

    return NextResponse.json({
      totalNumbers,
      availableNumbers,
      preOwnedNumbers,
      totalCategories,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

