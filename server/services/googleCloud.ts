import { Storage } from '@google-cloud/storage';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

// Initialize Google Vision API
const vision = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'pdf-tools-storage';
const bucket = storage.bucket(bucketName);

export class GoogleCloudService {
  async uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const file = bucket.file(fileName);
    
    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
      },
    });

    return fileName;
  }

  async downloadFile(fileName: string): Promise<Buffer> {
    const file = bucket.file(fileName);
    const [buffer] = await file.download();
    return buffer;
  }

  async deleteFile(fileName: string): Promise<void> {
    const file = bucket.file(fileName);
    await file.delete();
  }

  async getSignedUrl(fileName: string, action: 'read' | 'write' = 'read'): Promise<string> {
    const file = bucket.file(fileName);
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
    return url;
  }

  async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    try {
      const [result] = await vision.textDetection({
        image: { content: imageBuffer },
      });
      
      const detections = result.textAnnotations;
      return detections && detections.length > 0 ? detections[0].description || '' : '';
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  async extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
    try {
      const [result] = await vision.documentTextDetection({
        image: { content: pdfBuffer },
      });
      
      const fullTextAnnotation = result.fullTextAnnotation;
      return fullTextAnnotation?.text || '';
    } catch (error) {
      console.error('PDF OCR Error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }
}

export const googleCloudService = new GoogleCloudService();
