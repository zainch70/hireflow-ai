import { generateText } from "ai";

import { createGeminiModel } from "@/lib/ai/client";

const OCR_PROMPT = `Extract all readable text from this resume page image.
Return plain text only — preserve reading order, section headings, bullets, and contact details.
Do not summarize, invent, or add commentary. If the page has no readable text, return an empty string.`;

/**
 * OCR a rendered PDF page (PNG/JPEG buffer) via Gemini vision.
 * Used when the PDF has little/no embedded text layer (scanned resumes).
 */
export async function ocrResumePageImage(
  image: Uint8Array,
  mediaType: "image/png" | "image/jpeg" = "image/png",
): Promise<string> {
  const { text } = await generateText({
    model: createGeminiModel(),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: OCR_PROMPT },
          { type: "image", image, mediaType },
        ],
      },
    ],
  });

  return text.trim();
}
