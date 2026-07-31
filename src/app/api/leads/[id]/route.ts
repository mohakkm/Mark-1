import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { LeadStatus } from "@/types/lead";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const VALID_STATUSES: LeadStatus[] = [
  "not_contacted",
  "messaged",
  "replied",
  "interested",
  "not_interested",
];

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    status?: string;
    notes?: string;
    linkedin_url?: string;
    name?: string;
    company?: string;
    role?: string;
    headline?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status as LeadStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }
    updates.status = body.status;
    if (body.status === "messaged") {
      updates.last_contact = new Date().toISOString();
    }
  }

  if (body.notes !== undefined) {
    updates.notes = body.notes.trim() || null;
  }
  if (body.linkedin_url !== undefined) {
    updates.linkedin_url = body.linkedin_url.trim() || null;
  }
  if (body.name !== undefined) {
    if (!body.name.trim()) {
      return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    }
    updates.name = body.name.trim();
  }
  if (body.company !== undefined) {
    updates.company = body.company.trim() || null;
  }
  if (body.role !== undefined) {
    updates.role = body.role.trim() || null;
  }
  if (body.headline !== undefined) {
    updates.headline = body.headline.trim() || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("leads").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
