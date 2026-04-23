import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import ChooseNumberSettings, {
  type NumberMaskMode,
} from "@/models/ChooseNumberSettings";

type ChooseNumberSettingsPayload = {
  discountPercentage: number;
  maskMode: NumberMaskMode;
};

const DEFAULT_SETTINGS: ChooseNumberSettingsPayload = {
  discountPercentage: 0,
  maskMode: "none",
};

const isValidMaskMode = (value: unknown): value is NumberMaskMode =>
  value === "none" || value === "middle3" || value === "last3";

const sanitizeDiscountPercentage = (value: unknown): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 0 || value > 100) return null;
  return Math.round(value * 100) / 100;
};

const getAdminSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return null;
  }
  return session;
};

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const settings = await ChooseNumberSettings.findOne().sort({ createdAt: -1 });
    if (!settings) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    return NextResponse.json({
      discountPercentage: settings.discountPercentage,
      maskMode: settings.maskMode,
      updatedBy: settings.updatedBy ?? null,
      updatedAt: settings.updatedAt ?? null,
    });
  } catch (error) {
    console.error("Error fetching choose-number settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch choose-number settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await request.json()) as {
      discountPercentage?: unknown;
      maskMode?: unknown;
    };

    const discountPercentage = sanitizeDiscountPercentage(payload.discountPercentage);
    if (discountPercentage === null) {
      return NextResponse.json(
        { error: "Discount must be a number between 0 and 100." },
        { status: 400 },
      );
    }

    if (!isValidMaskMode(payload.maskMode)) {
      return NextResponse.json(
        { error: "Invalid mask mode." },
        { status: 400 },
      );
    }

    await connectDB();

    const updated = await ChooseNumberSettings.findOneAndUpdate(
      {},
      {
        discountPercentage,
        maskMode: payload.maskMode,
        updatedBy: session.user.email ?? session.user.name ?? "admin",
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    return NextResponse.json({
      discountPercentage: updated.discountPercentage,
      maskMode: updated.maskMode,
      updatedBy: updated.updatedBy ?? null,
      updatedAt: updated.updatedAt ?? null,
    });
  } catch (error) {
    console.error("Error updating choose-number settings:", error);
    return NextResponse.json(
      { error: "Failed to update choose-number settings" },
      { status: 500 },
    );
  }
}
