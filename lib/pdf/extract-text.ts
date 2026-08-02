import "pdf-parse/worker";

import {
  InvalidPDFException,
  PasswordException,
  PDFParse,
} from "pdf-parse";

import { hasGeminiApiKey } from "@/lib/ai/client";
import { ocrResumePageImage } from "@/lib/ai/ocr-resume";
import { AppError } from "@/lib/errors/app-error";

/** Cap stored text so oversized PDFs don’t bloat Postgres. */
export const MAX_RESUME_TEXT_CHARS = 500_000;

/** Below this, treat the PDF as image-heavy / scanned and run OCR. */
const MIN_EMBEDDED_TEXT_CHARS = 80;

/** Limit OCR cost/latency for long portfolios uploaded as “resumes”. */
const MAX_OCR_PAGES = 5;

export type ExtractedPdfText = {
  text: string;
  pageCount: number;
  /** How the text was obtained. */
  source: "embedded" | "ocr" | "mixed";
};

function clipText(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.length > MAX_RESUME_TEXT_CHARS
    ? trimmed.slice(0, MAX_RESUME_TEXT_CHARS)
    : trimmed;
}

function isPasswordError(error: unknown): boolean {
  return (
    error instanceof PasswordException ||
    (error instanceof Error &&
      /password/i.test(error.message) &&
      /pdf|encrypt|protect/i.test(error.message))
  );
}

function isInvalidPdfError(error: unknown): boolean {
  return (
    error instanceof InvalidPDFException ||
    (error instanceof Error && /invalid\s*pdf/i.test(error.message))
  );
}

async function extractEmbeddedText(bytes: Uint8Array): Promise<{
  text: string;
  pageCount: number;
}> {
  // Copy + Buffer: pdfjs may transfer TypedArrays to a worker.
  const data = Buffer.from(bytes);
  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText();
    return {
      text: result.text?.trim() ?? "",
      pageCount: result.total ?? result.pages?.length ?? 0,
    };
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

async function extractViaOcr(bytes: Uint8Array): Promise<{
  text: string;
  pageCount: number;
}> {
  if (!hasGeminiApiKey()) {
    throw new AppError(
      "This PDF looks scanned (no selectable text). Configure GOOGLE_GENERATIVE_AI_API_KEY for OCR, or upload a text-based PDF.",
      {
        code: "PDF_OCR_UNAVAILABLE",
        statusCode: 400,
      },
    );
  }

  const data = Buffer.from(bytes);
  const parser = new PDFParse({ data });

  try {
    const screenshots = await parser.getScreenshot({
      first: MAX_OCR_PAGES,
      scale: 2,
      imageBuffer: true,
      imageDataUrl: false,
    });

    const pageCount = screenshots.pages?.length ?? 0;
    if (pageCount === 0) {
      throw new AppError("Could not render pages from this PDF for OCR", {
        code: "PDF_EXTRACT_FAILED",
        statusCode: 400,
      });
    }

    const pageTexts: string[] = [];

    for (const page of screenshots.pages) {
      const image = page.data;
      if (!image || image.byteLength === 0) {
        continue;
      }

      const pageText = await ocrResumePageImage(image, "image/png");
      if (pageText) {
        pageTexts.push(pageText);
      }
    }

    return {
      text: pageTexts.join("\n\n").trim(),
      pageCount,
    };
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

/**
 * Extract plain text from a resume PDF.
 * 1) Embedded text via pdf-parse
 * 2) OCR fallback (Gemini vision) for scanned / image-only PDFs
 *
 * Server-only — never import from Client Components.
 */
export async function extractPdfText(
  bytes: Uint8Array,
): Promise<ExtractedPdfText> {
  let embedded: { text: string; pageCount: number };

  try {
    embedded = await extractEmbeddedText(bytes);
  } catch (error) {
    console.error("[pdf] embedded text extraction failed:", error);

    if (isPasswordError(error)) {
      throw new AppError(
        "This PDF is password-protected. Upload an unlocked PDF.",
        {
          code: "PDF_PASSWORD_PROTECTED",
          statusCode: 400,
          cause: error,
        },
      );
    }

    if (isInvalidPdfError(error)) {
      throw new AppError("This file is not a readable PDF", {
        code: "PDF_INVALID",
        statusCode: 400,
        cause: error,
      });
    }

    // Parser crashed (common under misconfigured Next bundles) — try OCR path
    // which also opens the PDF; if that fails too, surface a clear error.
    try {
      const ocr = await extractViaOcr(bytes);
      const text = clipText(ocr.text);
      if (!text) {
        throw new AppError("Could not extract text from this PDF", {
          code: "PDF_EXTRACT_FAILED",
          statusCode: 400,
          cause: error,
        });
      }
      return { text, pageCount: ocr.pageCount, source: "ocr" };
    } catch (ocrError) {
      if (ocrError instanceof AppError) {
        throw ocrError;
      }
      console.error("[pdf] OCR fallback failed:", ocrError);
      throw new AppError("Could not extract text from this PDF", {
        code: "PDF_EXTRACT_FAILED",
        statusCode: 400,
        cause: ocrError,
      });
    }
  }

  if (embedded.text.length >= MIN_EMBEDDED_TEXT_CHARS) {
    return {
      text: clipText(embedded.text),
      pageCount: embedded.pageCount,
      source: "embedded",
    };
  }

  // Scanned / image-only / sparse text layer — OCR the pages.
  try {
    const ocr = await extractViaOcr(bytes);
    const merged = [embedded.text, ocr.text].filter(Boolean).join("\n\n");
    const text = clipText(merged);

    if (!text) {
      throw new AppError(
        "Could not extract text from this PDF. Try a text-based export or a clearer scan.",
        {
          code: "PDF_EXTRACT_FAILED",
          statusCode: 400,
        },
      );
    }

    return {
      text,
      pageCount: Math.max(embedded.pageCount, ocr.pageCount),
      source: embedded.text ? "mixed" : "ocr",
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    console.error("[pdf] OCR fallback failed:", error);
    throw new AppError("Could not extract text from this PDF", {
      code: "PDF_EXTRACT_FAILED",
      statusCode: 400,
      cause: error,
    });
  }
}
