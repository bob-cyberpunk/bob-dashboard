import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const STATE_PATH =
  process.env.WORKFLOW_STATE_PATH ||
  path.join(process.cwd(), "..", "memory", "workflow-state.json");

export async function GET() {
  try {
    const data = await readFile(STATE_PATH, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ tasks: [], lastUpdated: null }, { status: 200 });
  }
}
