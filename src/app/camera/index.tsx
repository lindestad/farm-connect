// This file is just the screen for the camera.
// Go to lib/image-create.ts to see and update the supabase upload logic

import CameraCapture from "@/components/CameraCapture";
import uploadConfirmedImage from "@/lib/image-helpers/image-create";
import { useRouter } from "expo-router";

export default function CameraScreen() {
  const router = useRouter();
  const handlePhotoConfirmed = async (uri: string) => {
    try {
      await uploadConfirmedImage(uri);
      // Goes back to landing page, change if needed.
      router.replace("/");
    } catch (error) {
      console.error("Unexpected error while handling confirmed photo:", error);
    }
  };

  return <CameraCapture onPhotoConfirmed={handlePhotoConfirmed} />;
}
