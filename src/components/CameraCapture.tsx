import { cameraStyles as styles } from "@/styles/camera-styles";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CameraCaptureProps = {
  onPhotoConfirmed?: (uri: string) => void;
};

export default function CameraCapture({
  onPhotoConfirmed,
}: CameraCaptureProps) {
  const [facing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Ref to access the CameraView methods, such as takePictureAsync since we need to trigger it from a button outside the CameraView component
  const cameraRef = useRef<CameraView | null>(null);
  const insets = useSafeAreaInsets();

  if (!permission) {
    return <View style={styles.screen} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>
          Camera permission is required to use this feature.
        </Text>

        <Pressable
          style={styles.permissionPressable}
          onPress={requestPermission}
        >
          <Text style={styles.permissionPressableText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const capturePicture = async () => {
    if (!cameraRef.current) {
      return;
    }
    // Use the takePictureAsync method from the CameraView ref to capture a photo and get its URI
    const result = await cameraRef.current.takePictureAsync();

    setPhotoUri(result.uri);
  };

  const retakePicture = () => {
    setPhotoUri(null);
  };

  const usePhoto = () => {
    if (!photoUri) {
      console.log("No photo to confirm");
      return;
    }
    // Here you can handle the confirmed photo URI, e.g., by passing it to a parent component or uploading it
    onPhotoConfirmed?.(photoUri);
  };

  return (
    <View style={styles.screen}>
      {photoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />

          <View
            style={[
              styles.previewBottomBar,
              { paddingBottom: insets.bottom + 16 },
            ]}
          >
            <Pressable
              style={styles.previewActionButton}
              onPress={retakePicture}
            >
              <Text style={styles.previewActionText}>Retake</Text>
            </Pressable>

            <Pressable style={styles.previewPrimaryButton} onPress={usePhoto}>
              <Text style={styles.previewPrimaryText}>Use photo</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

          <View
            style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}
          >
            <View style={styles.controlsRow}>
              <View style={styles.sideControl} />

              <Pressable style={styles.captureButton} onPress={capturePicture}>
                <View style={styles.captureButtonInner} />
              </Pressable>

              <View style={styles.sideControl} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
