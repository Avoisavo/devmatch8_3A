import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const summary = await request.json();

    // Create summaries directory in the project root
    const projectRoot = path.join(process.cwd(), "..", ".."); // Go up from nextjs/app/api/save-summary to project root
    const summariesDir = path.join(projectRoot, "summaries");

    // Create the summaries directory if it doesn't exist
    if (!fs.existsSync(summariesDir)) {
      fs.mkdirSync(summariesDir, { recursive: true });
    }

    // Save the summary as JSON file
    const filePath = path.join(summariesDir, `${summary.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(summary, null, 2));

    console.log(`Chat summary saved to: ${filePath}`);

    return NextResponse.json({
      success: true,
      message: "Summary saved successfully",
      filePath,
    });
  } catch (error) {
    console.error("Error saving chat summary:", error);
    return NextResponse.json({ success: false, message: "Failed to save summary" }, { status: 500 });
  }
}
