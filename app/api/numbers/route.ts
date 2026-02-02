import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Number from "@/models/Number";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const network = searchParams.get("network");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const featuredNumber = searchParams.get("featuredNumber");
    const premiumNumber = searchParams.get("premiumNumber");

    let query: any = { status: "available" };

    if (network && network !== "All Networks") {
      query.network = network;
    }

    if (category && category !== "All") {
      query.categoryId = category;
    }

    if (search) {
      query.number = { $regex: search, $options: "i" };
    }

    if (featuredNumber === "true") {
      query.featuredNumber = true;
    }

    if (premiumNumber === "true") {
      query.premiumNumber = true;
    }

    const numbers = await Number.find(query)
      .populate("categoryId")
      .sort({ createdAt: -1 });

    let filteredNumbers = numbers.map((num) => ({
      _id: num._id,
      number: num.number,
      price: num.price,
      network: num.network,
      categoryId: Array.isArray(num.categoryId)
        ? num.categoryId.map((cat: any) => ({
            _id: cat._id,
            name: cat.name,
          }))
        : num.categoryId
        ? [{ _id: num.categoryId._id, name: num.categoryId.name }]
        : [],
      status: num.status,
      tags: num.tags || [],
      description: num.description,
      premiumNumber: num.premiumNumber || false,
      featuredNumber: num.featuredNumber || false,
      limitedOffer: num.limitedOffer || false,
    }));

    if (minPrice || maxPrice) {
      filteredNumbers = filteredNumbers.filter((num) => {
        const priceStr = num.price.replace(/[^0-9]/g, "");
        const price = parseInt(priceStr);
        if (isNaN(price)) return true;

        if (minPrice && price < parseInt(minPrice)) return false;
        if (maxPrice && price > parseInt(maxPrice)) return false;
        return true;
      });
    }

    return NextResponse.json(filteredNumbers);
  } catch (error) {
    console.error("Error fetching numbers:", error);
    return NextResponse.json(
      { error: "Failed to fetch numbers" },
      { status: 500 }
    );
  }
}

