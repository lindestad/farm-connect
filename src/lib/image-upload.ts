import { supabase } from "@/lib/supabase";
import { File } from "expo-file-system";

type UploadImageResult = {
    imageUrl: string;
    imagePath: string;
};

export default async function uploadConfirmedImage(uri: string): Promise<UploadImageResult> {
      if(!supabase){
        throw new Error("Supabase is not configured")
      }
    
    // Convert the local image URI into a binary data (ArrayBuffer) before uploading
    const file = new File(uri)
    const arrayBuffer = await file.arrayBuffer();

    // Create a unique file name and file path inside the bucket
    const fileName = `camera-${Date.now()}.jpg`;
    const filePath = `camera-uploads/${fileName}`; 

    // Upload the image file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('farm-connect-images')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
      });

      if (error) {
        throw new Error(`Error uploading photo to Supabase Storage: ${error.message}`);
      }

      console.log('Photo uploaded successfully. Supabase Storage data:', data);

      // Get the public URL for the uploaded file from the public bucket
      const { data: publicUrlData } = supabase.storage
        .from('farm-connect-images')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrlData.publicUrl);

      // Save the image reference in the TEMPORARY development table
      const { error: insertError } = await supabase
        .from('image_uploads_development')
        .insert([
            {
                image_url: publicUrlData.publicUrl,
                image_path: filePath,
            },
        ]);

        if(insertError){
          throw new Error(`Error inserting image reference into database: ${insertError.message}`);
        }

        console.log('Image reference saved to image_uploads_development');

        return {
            imageUrl: publicUrlData.publicUrl,
            imagePath: filePath,
        };
    }