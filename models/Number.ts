import mongoose, { Schema, Model } from "mongoose";

export interface INumber {
  _id?: string;
  number: string;
  categoryId: mongoose.Types.ObjectId | mongoose.Types.ObjectId[];
  price: string;
  status: "available" | "pre-owned";
  tags: string[];
  description?: string;
  network: "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";
  limitedOffer?: boolean;
  premiumNumber?: boolean;
  featuredNumber?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const NumberSchema = new Schema<INumber>(
  {
    number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    categoryId: {
      type: [Schema.Types.ObjectId],
      ref: "Category",
      required: true,
      validate: {
        validator: function(v: mongoose.Types.ObjectId[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one category is required",
      },
    },
    price: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "pre-owned"],
      default: "available",
    },
    tags: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
    },
    network: {
      type: String,
      enum: ["Jazz", "Ufone", "Telenor", "Warid", "Zong"],
      required: true,
    },
    limitedOffer: {
      type: Boolean,
      default: false,
    },
    premiumNumber: {
      type: Boolean,
      default: false,
    },
    featuredNumber: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Number: Model<INumber> =
  mongoose.models.Number || mongoose.model<INumber>("Number", NumberSchema);

export default Number;

