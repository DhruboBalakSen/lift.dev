import mongoose, { Schema, type InferSchemaType } from "mongoose";

const completionSchema = new Schema(
  {
    date: {
      type: String,       // "YYYY-MM-DD"
      required: true,
      index: true,
    },
    day: {
      type: String,       // "monday" | "tuesday" | ...
      required: true,
    },
    exerciseKey: {
      type: String,       // "warmup-0", "workout-3", etc.
      required: true,
    },
    completed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookups and upserts
completionSchema.index({ date: 1, day: 1, exerciseKey: 1 }, { unique: true });

export type CompletionDoc = InferSchemaType<typeof completionSchema>;

// Avoid model re-compilation in dev (HMR)
export const Completion =
  mongoose.models.Completion ?? mongoose.model("Completion", completionSchema);
