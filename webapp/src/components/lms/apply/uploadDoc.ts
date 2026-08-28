import { DOCUMENTS_BUCKET, isSupabaseConfigured, supabase } from "@/lib/supabase";

export interface UploadedDoc {
  fileUrl: string; fileName: string; mimeType: string; sizeBytes: number;
}

/**
 * Uploads a document file to Supabase storage (organised per application ID).
 * Returns null when storage isn't configured so the flow degrades gracefully.
 */
export async function uploadDoc(file: File, applicationId: string, docKey: string): Promise<UploadedDoc | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${applicationId}/${docKey}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return {
    fileUrl: supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(path).data.publicUrl,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  };
}

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
