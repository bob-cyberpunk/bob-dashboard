import { readFile, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const STATE_PATH = path.join(process.cwd(), "..", "memory", "featurebase-state.json");

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const raw = await readFile(STATE_PATH, "utf-8");
    const state = JSON.parse(raw);
    if (!state.completedConversationIds) {
      state.completedConversationIds = [];
    }
    if (!state.completedConversationIds.includes(id)) {
      state.completedConversationIds.push(id);
    }
    await writeFile(STATE_PATH, JSON.stringify(state, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
