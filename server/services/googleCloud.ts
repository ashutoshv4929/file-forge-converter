import { Storage } from '@google-cloud/storage';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

// Initialize Google Vision API with fallback to local processing
let vision: ImageAnnotatorClient | null = null;
let visionInitialized = false;

function getVisionClient(): ImageAnnotatorClient | null {
  if (visionInitialized) return vision;
  
  try {
    if (process.env.GOOGLE_CLOUD_API_KEY) {
      vision = new ImageAnnotatorClient({
        auth: process.env.GOOGLE_CLOUD_API_KEY,
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'default-project',
      });
    } else if (process.env.GOOGLE_CLOUD_PRIVATE_KEY && process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
      vision = new ImageAnnotatorClient({
        credentials: {
          private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        },
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      });
    }
    visionInitialized = true;
  } catch (error) {
    console.warn('Google Vision API initialization failed:', error);
    vision = null;
    visionInitialized = true;
  }
  
  return vision;
}

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
    const visionClient = getVisionClient();
    
    if (!visionClient) {
      console.warn('Google Vision API not available, returning empty text');
      return '';
    }
    
    try {
      const [result] = await visionClient.textDetection({
        image: { content: imageBuffer },
      });
      
      const detections = result.textAnnotations;
      return detections && detections.length > 0 ? detections[0].description || '' : '';
    } catch (error) {
      console.error('OCR Error:', error);
      return '';
    }
  }

  async extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
    const visionClient = getVisionClient();
    
    if (!visionClient) {
      console.warn('Google Vision API not available, returning empty text');
      return '';
    }
    
    try {
      const [result] = await visionClient.documentTextDetection({
        image: { content: pdfBuffer },
      });
      
      const fullTextAnnotation = result.fullTextAnnotation;
      return fullTextAnnotation?.text || '';
    } catch (error) {
      console.error('PDF OCR Error:', error);
      return '';
    }
  }
}

export const googleCloudService = new GoogleCloudService();
