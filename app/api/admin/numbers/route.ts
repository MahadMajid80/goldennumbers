import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Number from "@/models/Number";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const numbers = await Number.find().populate("categoryId").sort({ createdAt: -1 });
    
    const formattedNumbers = numbers.map((num) => ({
      ...num.toObject(),
      categoryId: Array.isArray(num.categoryId) ? num.categoryId : [num.categoryId],
    }));

    return NextResponse.json(formattedNumbers);
  } catch (error) {
    console.error("Error fetching numbers:", error);
    return NextResponse.json(
      { error: "Failed to fetch numbers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      number,
      categoryId,
      price,
      status,
      tags,
      description,
      network,
      limitedOffer,
      premiumNumber,
      featuredNumber,
    } = body;

    if (!number || !categoryId || (Array.isArray(categoryId) && categoryId.length === 0) || !price || !network) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingNumber = await Number.findOne({ number });
    if (existingNumber) {
      return NextResponse.json(
        { error: "Number already exists" },
        { status: 400 }
      );
    }

    const categoryIds = Array.isArray(categoryId) ? categoryId : [categoryId];
    
    const newNumber = await Number.create({
      number,
      categoryId: categoryIds,
      price,
      status: status || "available",
      tags: tags || [],
      description,
      network,
      limitedOffer: limitedOffer || false,
      premiumNumber: premiumNumber || false,
      featuredNumber: featuredNumber || false,
    });

    return NextResponse.json(newNumber, { status: 201 });
  } catch (error) {
    console.error("Error creating number:", error);
    return NextResponse.json(
      { error: "Failed to create number" },
      { status: 500 }
    );
  }
}

