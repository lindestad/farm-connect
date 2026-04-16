import { supabase } from "@/lib/supabase";

export default async function deleteImage(id: string, imagePath: string) {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  // Delete file from storage bucket
  const { error: storageError } = await supabase.storage
    .from("farm-connect-images")
    .remove([imagePath]);

  if (storageError) {
    throw new Error("Error delting image from storage:" + storageError.message);
  }

  // Delete the matching database row after Storage deletion succeeds.
  const { error: rowError } = await supabase
    .from("image_uploads_development")
    .delete()
    .eq("id", id);

  if (rowError) {
    throw new Error(
      "Error deleting image row from database" + rowError.message,
    );
  }
}
