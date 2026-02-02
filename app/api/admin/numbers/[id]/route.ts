import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Number from "@/models/Number";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const number = await Number.findById(id).populate("categoryId");

    if (!number) {
      return NextResponse.json({ error: "Number not found" }, { status: 404 });
    }
    
    const formattedNumber = {
      ...number.toObject(),
      categoryId: Array.isArray(number.categoryId) ? number.categoryId : [number.categoryId],
    };

    return NextResponse.json(formattedNumber);
  } catch (error) {
    console.error("Error fetching number:", error);
    return NextResponse.json(
      { error: "Failed to fetch number" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    
    if (body.categoryId && !Array.isArray(body.categoryId)) {
      body.categoryId = [body.categoryId];
    }
    
    if (body.categoryId && body.categoryId.length === 0) {
      return NextResponse.json(
        { error: "At least one category is required" },
        { status: 400 }
      );
    }

    const updatedNumber = await Number.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).populate("categoryId");

    if (!updatedNumber) {
      return NextResponse.json({ error: "Number not found" }, { status: 404 });
    }
    
    const formattedNumber = {
      ...updatedNumber.toObject(),
      categoryId: Array.isArray(updatedNumber.categoryId) ? updatedNumber.categoryId : [updatedNumber.categoryId],
    };

    return NextResponse.json(formattedNumber);
  } catch (error) {
    console.error("Error updating number:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update number";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const deletedNumber = await Number.findByIdAndDelete(id);

    if (!deletedNumber) {
      return NextResponse.json({ error: "Number not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Number deleted successfully" });
  } catch (error) {
    console.error("Error deleting number:", error);
    return NextResponse.json(
      { error: "Failed to delete number" },
      { status: 500 }
    );
  }
}

