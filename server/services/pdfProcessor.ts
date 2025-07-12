import { PDFDocument, rgb } from 'pdf-lib';
import sharp from 'sharp';
import { googleCloudService } from './googleCloud';

export class PDFProcessor {
  async mergePDFs(pdfBuffers: Buffer[]): Promise<Buffer> {
    const mergedPdf = await PDFDocument.create();

    for (const pdfBuffer of pdfBuffers) {
      const pdf = await PDFDocument.load(pdfBuffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    return Buffer.from(pdfBytes);
  }

  async splitPDF(pdfBuffer: Buffer, pageRanges: { start: number; end: number }[]): Promise<Buffer[]> {
    const pdf = await PDFDocument.load(pdfBuffer);
    const results: Buffer[] = [];

    for (const range of pageRanges) {
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(pdf, Array.from(
        { length: range.end - range.start + 1 }, 
        (_, i) => range.start + i - 1
      ));
      pages.forEach((page) => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      results.push(Buffer.from(pdfBytes));
    }

    return results;
  }

  async compressPDF(pdfBuffer: Buffer, quality: number = 0.8): Promise<Buffer> {
    // Note: PDF compression is complex. This is a simplified version.
    // For production, consider using specialized libraries like pdf2pic + image compression
    const pdf = await PDFDocument.load(pdfBuffer);
    const pdfBytes = await pdf.save({ useObjectStreams: false });
    return Buffer.from(pdfBytes);
  }

  async pdfToImages(pdfBuffer: Buffer, format: 'png' | 'jpg' = 'png'): Promise<Buffer[]> {
    // This is a simplified implementation. For production, use pdf2pic or similar
    // For now, we'll create placeholder images
    const pdf = await PDFDocument.load(pdfBuffer);
    const pageCount = pdf.getPageCount();
    const images: Buffer[] = [];

    for (let i = 0; i < pageCount; i++) {
      // Create a simple placeholder image
      const image = await sharp({
        create: {
          width: 612,
          height: 792,
          channels: 3,
          background: { r: 255, g: 255, b: 255 }
        }
      })
      .png()
      .toBuffer();

      images.push(image);
    }

    return images;
  }

  async imagesToPDF(imageBuffers: Buffer[]): Promise<Buffer> {
    const pdf = await PDFDocument.create();

    for (const imageBuffer of imageBuffers) {
      const image = await sharp(imageBuffer).png().toBuffer();
      const metadata = await sharp(image).metadata();
      
      let pdfImage;
      try {
        pdfImage = await pdf.embedPng(image);
      } catch {
        // If PNG embedding fails, try JPEG
        const jpegBuffer = await sharp(imageBuffer).jpeg().toBuffer();
        pdfImage = await pdf.embedJpg(jpegBuffer);
      }

      const page = pdf.addPage([metadata.width || 612, metadata.height || 792]);
      page.drawImage(pdfImage, {
        x: 0,
        y: 0,
        width: metadata.width || 612,
        height: metadata.height || 792,
      });
    }

    const pdfBytes = await pdf.save();
    return Buffer.from(pdfBytes);
  }

  async extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    try {
      return await googleCloudService.extractTextFromPdf(pdfBuffer);
    } catch (error) {
      console.error('Failed to extract text from PDF:', error);
      throw new Error('OCR processing failed');
    }
  }

  async optimizeImage(imageBuffer: Buffer, quality: number = 80): Promise<Buffer> {
    return await sharp(imageBuffer)
      .jpeg({ quality })
      .toBuffer();
  }
}

export const pdfProcessor = new PDFProcessor();
