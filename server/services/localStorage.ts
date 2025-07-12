import { promises as fs } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const OUTPUT_DIR = path.join(process.cwd(), 'output');

// Ensure directories exist
async function ensureDirs() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create directories:', error);
  }
}

export class LocalStorageService {
  constructor() {
    ensureDirs();
  }

  async uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.writeFile(filePath, buffer);
    return fileName;
  }

  async downloadFile(fileName: string): Promise<Buffer> {
    const filePath = path.join(OUTPUT_DIR, fileName);
    return await fs.readFile(filePath);
  }
  
  async downloadUploadedFile(fileName: string): Promise<Buffer> {
    const filePath = path.join(UPLOAD_DIR, fileName);
    return await fs.readFile(filePath);
  }

  async saveOutputFile(buffer: Buffer, fileName: string): Promise<string> {
    const filePath = path.join(OUTPUT_DIR, fileName);
    await fs.writeFile(filePath, buffer);
    return fileName;
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const uploadPath = path.join(UPLOAD_DIR, fileName);
      const outputPath = path.join(OUTPUT_DIR, fileName);
      
      await fs.unlink(uploadPath).catch(() => {});
      await fs.unlink(outputPath).catch(() => {});
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  async getSignedUrl(fileName: string, action: 'read' | 'write' = 'read'): Promise<string> {
    // For local storage, return a simple HTTP URL
    return `http://localhost:5000/api/download/${fileName}`;
  }

  async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    // Use Google Cloud Vision API for OCR
    try {
      const { googleCloudService } = await import('./googleCloud.js');
      return await googleCloudService.extractTextFromImage(imageBuffer);
    } catch (error) {
      console.error('Google Cloud Vision API error:', error);
      return "OCR processing failed. Please check your Google Cloud Vision API configuration.";
    }
  }

  async extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
    // Simple fallback
    return "PDF text extraction is not available in local mode. Please configure Google Cloud Vision API.";
  }
}

export const localStorageService = new LocalStorageService();