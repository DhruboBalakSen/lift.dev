import mongoose, { Schema, type InferSchemaType } from "mongoose";

const skipSchema = new Schema(
  {
    date: {
      type: String, // "YYYY-MM-DD" — the date the skip was recorded
      required: true,
    },
    day: {
      type: String, // "monday" | "tuesday" | ... — the skipped day's workout
      required: true,
    },
    rescheduledToDay: {
      type: String, // optional — e.g. "saturday" (which day's slot to add it to)
      default: null,
    },
    rescheduledToDate: {
      type: String, // optional — e.g. "2026-04-19" (the actual calendar date)
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One skip per date+day combo
skipSchema.index({ date: 1, day: 1 }, { unique: true });

export type SkipDoc = InferSchemaType<typeof skipSchema>;

export const Skip =
  mongoose.models.Skip ?? mongoose.model("Skip", skipSchema);
