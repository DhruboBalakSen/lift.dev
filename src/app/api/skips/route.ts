import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Skip } from "@/lib/models/skip";

// GET /api/skips?from=2026-04-01&to=2026-04-30
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

  const docs = await Skip.find(filter).lean();

  // Shape: { "2026-04-15": { "monday": { rescheduledToDay?, rescheduledToDate? } } }
  const store: Record<
    string,
    Record<string, { rescheduledToDay: string | null; rescheduledToDate: string | null }>
  > = {};

  for (const doc of docs) {
    const d = doc as unknown as {
      date: string;
      day: string;
      rescheduledToDay: string | null;
      rescheduledToDate: string | null;
    };
    if (!store[d.date]) store[d.date] = {};
    store[d.date][d.day] = {
      rescheduledToDay: d.rescheduledToDay,
      rescheduledToDate: d.rescheduledToDate,
    };
  }

  return Response.json(store);
}

// POST /api/skips
// Body: { date, day, rescheduledToDay?, rescheduledToDate? }
export async function POST(request: NextRequest) {
  await connectDB();

  const body = await request.json();
  const { date, day, rescheduledToDay, rescheduledToDate } = body;

  if (!date || !day) {
    return Response.json(
      { error: "Missing required fields: date, day" },
      { status: 400 }
    );
  }

  const doc = await Skip.findOneAndUpdate(
    { date, day },
    { rescheduledToDay: rescheduledToDay ?? null, rescheduledToDate: rescheduledToDate ?? null },
    { upsert: true, returnDocument: "after" }
  ).lean();

  return Response.json(doc);
}

// DELETE /api/skips?date=2026-04-15&day=monday
export async function DELETE(request: NextRequest) {
  await connectDB();

  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");
  const day = searchParams.get("day");

  if (!date || !day) {
    return Response.json(
      { error: "Missing required query params: date, day" },
      { status: 400 }
    );
  }

  await Skip.deleteOne({ date, day });
  return Response.json({ ok: true });
}
