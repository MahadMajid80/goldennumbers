import mongoose, { Model, Schema } from "mongoose";

export type NumberMaskMode = "none" | "middle3" | "last3" | "last7";

export interface IChooseNumberSettings {
  discountPercentage: number;
  maskMode: NumberMaskMode;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ChooseNumberSettingsSchema = new Schema<IChooseNumberSettings>(
  {
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    maskMode: {
      type: String,
      enum: ["none", "middle3", "last3", "last7"],
      required: true,
      default: "none",
    },
    updatedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const ChooseNumberSettings: Model<IChooseNumberSettings> =
  mongoose.models.ChooseNumberSettings ||
  mongoose.model<IChooseNumberSettings>(
    "ChooseNumberSettings",
    ChooseNumberSettingsSchema,
  );

export default ChooseNumberSettings;
