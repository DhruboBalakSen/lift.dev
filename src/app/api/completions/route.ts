import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Completion } from "@/lib/models/completion";

// GET /api/completions?from=2026-04-01&to=2026-04-15
// Returns the completion store in the shape the frontend expects
export async function GET(request: NextRequest) {
  await connectDB();

  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const filter: Record<string, unknown> = {};
  if (from || to) {
    filter.date = {};
    if (from) (filter.date as Record<string, string>).$gte = from;
    if (to) (filter.date as Record<string, string>).$lte = to;
  }

  const docs = await Completion.find(filter).lean();

  // Shape: { "2026-04-15": { "monday": { "warmup-0": true } } }
  const store: Record<string, Record<string, Record<string, boolean>>> = {};
  for (const doc of docs) {
    const d = doc as unknown as { date: string; day: string; exerciseKey: string; completed: boolean };
    if (!store[d.date]) store[d.date] = {};
    if (!store[d.date][d.day]) store[d.date][d.day] = {};
    store[d.date][d.day][d.exerciseKey] = d.completed;
  }

  return Response.json(store);
}

// POST /api/completions
// Body: { date, day, exerciseKey, completed }
export async function POST(request: NextRequest) {
  await connectDB();

  const body = await request.json();
  const { date, day, exerciseKey, completed } = body;

  if (!date || !day || !exerciseKey || typeof completed !== "boolean") {
    return Response.json(
      { error: "Missing required fields: date, day, exerciseKey, completed" },
      { status: 400 }
    );
  }

  // Upsert: update if exists, create if not
  const doc = await Completion.findOneAndUpdate(
    { date, day, exerciseKey },
    { completed },
    { upsert: true, returnDocument: "after" }
  ).lean();

  return Response.json(doc);
}
