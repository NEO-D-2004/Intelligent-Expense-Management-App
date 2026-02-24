import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface PhotoResult {
    filepath: string;
    webviewPath?: string;
}

export const captureReceipt = async (): Promise<PhotoResult | null> => {
    try {
        const photo = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Prompt,
            quality: 80,
        });

        if (!photo.path && !photo.webPath) return null;

        // Save to filesystem to ensure persistence
        const fileName = new Date().getTime() + '.jpeg';
        const savedFile = await savePicture(photo, fileName);

        return savedFile;
    } catch (e) {
        console.error('Camera error:', e);
        return null;
    }
};

const savePicture = async (photo: any, fileName: string): Promise<PhotoResult> => {
    let base64Data: string;

    // Hybrid (Android/iOS)
    if (photo.path) {
        const file = await Filesystem.readFile({
            path: photo.path,
        });
        base64Data = file.data as string;
    } else {
        // Web
        base64Data = await base64FromPath(photo.webPath!);
    }

    await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Data,
    });

    // For web, use the webPath. For native, use the actual uri of the saved file or convert to web-accessible uri
    // But wait, Capacitor Filesystem 'uri' from writeFile result works for native image loading?
    // Let's rely on reading it back or using the Capacitor.convertFileSrc if needed.
    // Actually, for local dev (web), Directory.Data falls back to IndexedDB.

    return {
        filepath: fileName,
        webviewPath: photo.webPath,
    };
};

export const loadReceiptValues = async (filepath: string): Promise<string | null> => {
    try {
        const file = await Filesystem.readFile({
            path: filepath,
            directory: Directory.Data,
        });
        return `data:image/jpeg;base64,${file.data}`;
    } catch (e) {
        console.error('Error loading receipt', e);
        return null;
    }
}

// Helper for Web
const base64FromPath = async (path: string): Promise<string> => {
    const response = await fetch(path);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]); // remove prefix
            } else {
                reject('method did not return a string');
            }
        };
        reader.readAsDataURL(blob);
    });
};
