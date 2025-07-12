import { Storage } from '@google-cloud/storage';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

// Initialize Google Vision API with direct API key
const vision = new ImageAnnotatorClient({
  auth: {
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    credentials: {
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    }
  },
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

// Fallback to API key if credentials are not available
const visionWithApiKey = process.env.GOOGLE_CLOUD_API_KEY ? new ImageAnnotatorClient({
  auth: process.env.GOOGLE_CLOUD_API_KEY,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'default-project',
}) : vision;

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
      // Use the Vision API with API key if available
      const visionClient = process.env.GOOGLE_CLOUD_API_KEY ? visionWithApiKey : vision;
      const [result] = await visionClient.textDetection({
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
