import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button, Image, StyleSheet, Text, View } from 'react-native';

type CameraCaptureProps = {
    onPhotoConfirmed?: (uri: string) => void;
};

export default function  CameraCapture({ onPhotoConfirmed }: CameraCaptureProps) {
    const [facing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [photoUri, setPhotoUri] = useState<string | null>(null);

    // Ref to access the CameraView methods, such as takePictureAsync since we need to trigger it from a button outside the CameraView component
    const cameraRef = useRef<CameraView | null>(null);

    if (!permission) {
        return  <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Camera permission is required to use this feature.</Text>
                <Button title="Grant Permission" onPress={requestPermission} />
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

        console.log('Picture taken:', result);
    };

    const retakePicture = () => {
        setPhotoUri(null);
    };

    const usePhoto = () => {
        if (!photoUri) {
            console.log('No photo to confirm');
            return;
        }
        // Here you can handle the confirmed photo URI, e.g., by passing it to a parent component or uploading it
        console.log('Photo confirmed with URI:', photoUri);
        onPhotoConfirmed?.(photoUri);
    }

  return (
        <View style={styles.container}>
            {photoUri ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: photoUri }} style={styles.previewImage} />
                    <View style={styles.previewButtonContainer}>
                        <Button title="Retake" onPress={retakePicture} />
                        <Button title="Use Photo" onPress={usePhoto} />
                    </View>
                </View>
            ) : (
        <View style={styles.cameraContainer}>
                <CameraView ref={cameraRef} style={styles.camera} facing={facing}/>

                <View style={styles.cameraOverlay}>
                    <Button title="Take Picture" onPress={capturePicture} />
                </View>
            </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    previewImage: {
        flex: 1,
    },
    message: {
        textAlign: 'center',
        marginBottom: 10,
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 16,
    },
    previewContainer: {
        flex: 1,    
    },
    previewButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
    },
    cameraContainer: {
        flex: 1,
    },
    cameraOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 16,
        justifyContent: 'center',
    },
});