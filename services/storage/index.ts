import { createAdminClient } from "@/lib/supabase/admin";
import { UPLOAD_CONSTRAINTS } from "@/lib/uploads";
import {
  resumeSignedUrlError,
  resumeUploadError,
} from "@/services/storage/errors";

const BUCKET = UPLOAD_CONSTRAINTS.storageBucket;

export function buildResumeStoragePath(input: {
  jobId: string;
  applicationId: string;
}): string {
  return `${input.jobId}/${input.applicationId}/${crypto.randomUUID()}.pdf`;
}

export async function uploadResumeObject(input: {
  path: string;
  bytes: Uint8Array;
  contentType?: string;
}): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage.from(BUCKET).upload(input.path, input.bytes, {
    contentType: input.contentType ?? "application/pdf",
    upsert: false,
    cacheControl: "3600",
  });

  if (error) {
    throw resumeUploadError(error.message);
  }
}

export async function deleteResumeObject(path: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) {
    throw resumeUploadError(`Failed to remove resume: ${error.message}`);
  }
}

/** Short-lived signed URL — call only after HR auth checks. */
export async function createResumeSignedUrl(
  path: string,
  expiresInSeconds = 60,
): Promise<string> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw resumeSignedUrlError(error?.message);
  }

  return data.signedUrl;
}
