// This file is just the screen for the camera. 
// Go to lib/image-upload.ts to see and update the supabase upload logic

import CameraCapture from "@/components/CameraCapture";
import uploadConfirmedImage from "@/lib/image-upload";

export default function CameraScreen() {
  const handlePhotoConfirmed = async (uri: string) =>{
    try{
      console.log("Photo confirmed with URI:", uri);

      const result = await uploadConfirmedImage(uri);

      console.log("Upload flow completed", result);
    }catch(error){
      console.error("Unexpected error while handling confirmed photo:", error);
    }
  };
  
  return <CameraCapture onPhotoConfirmed={handlePhotoConfirmed}/>
}