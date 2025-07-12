import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer, { FileFilterCallback } from "multer";
import { storage } from "./storage";
import { googleCloudService } from "./services/googleCloud";
import { pdfProcessor } from "./services/pdfProcessor";
import { insertFileSchema, insertProcessingJobSchema } from "@shared/schema";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and Word documents are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // File upload endpoint
  app.post("/api/upload", upload.array('files', 10), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedFiles = [];

      for (const file of req.files) {
        const fileName = `${uuidv4()}-${file.originalname}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Upload to Google Cloud Storage
        await googleCloudService.uploadFile(file.buffer, fileName, file.mimetype);

        // Save file record
        const fileRecord = await storage.createFile({
          originalName: file.originalname,
          storagePath: fileName,
          mimeType: file.mimetype,
          size: file.size,
          expiresAt
        });

        uploadedFiles.push({
          id: fileRecord.id,
          name: fileRecord.originalName,
          size: fileRecord.size,
          type: fileRecord.mimeType
        });
      }

      res.json({ files: uploadedFiles });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: "File upload failed" });
    }
  });

  // Start processing job
  app.post("/api/process", async (req, res) => {
    try {
      const jobData = insertProcessingJobSchema.parse(req.body);
      
      // Validate that all input files exist
      for (const fileId of jobData.inputFiles) {
        const file = await storage.getFile(parseInt(fileId));
        if (!file) {
          return res.status(400).json({ error: `File ${fileId} not found` });
        }
      }

      const job = await storage.createProcessingJob(jobData);
      
      // Start processing in background
      processJob(job.id).catch(error => {
        console.error('Job processing error:', error);
        storage.updateProcessingJob(job.id, { 
          status: 'failed', 
          error: error.message 
        });
      });

      res.json({ jobId: job.id });
    } catch (error) {
      console.error('Process start error:', error);
      res.status(400).json({ error: "Invalid job data" });
    }
  });

  // Get job status
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getProcessingJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json(job);
    } catch (error) {
      console.error('Job status error:', error);
      res.status(500).json({ error: "Failed to get job status" });
    }
  });

  // Download processed file
  app.get("/api/download/:jobId/:fileIndex", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const fileIndex = parseInt(req.params.fileIndex);
      
      const job = await storage.getProcessingJob(jobId);
      if (!job || job.status !== 'completed' || !job.outputFiles || !job.outputFiles[fileIndex]) {
        return res.status(404).json({ error: "File not found" });
      }

      const fileName = job.outputFiles[fileIndex];
      const buffer = await googleCloudService.downloadFile(fileName);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(buffer);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ error: "Download failed" });
    }
  });

  // Clean up expired files
  app.post("/api/cleanup", async (req, res) => {
    try {
      const expiredFiles = await storage.getExpiredFiles();
      
      for (const file of expiredFiles) {
        try {
          await googleCloudService.deleteFile(file.storagePath);
          await storage.deleteFile(file.id);
        } catch (error) {
          console.error(`Failed to delete file ${file.id}:`, error);
        }
      }

      res.json({ deletedCount: expiredFiles.length });
    } catch (error) {
      console.error('Cleanup error:', error);
      res.status(500).json({ error: "Cleanup failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function processJob(jobId: number) {
  const job = await storage.getProcessingJob(jobId);
  if (!job) throw new Error('Job not found');

  await storage.updateProcessingJob(jobId, { status: 'processing', progress: 0 });

  try {
    // Download input files
    const inputBuffers: Buffer[] = [];
    for (let i = 0; i < job.inputFiles.length; i++) {
      const fileId = parseInt(job.inputFiles[i]);
      const file = await storage.getFile(fileId);
      if (!file) throw new Error(`Input file ${fileId} not found`);
      
      const buffer = await googleCloudService.downloadFile(file.storagePath);
      inputBuffers.push(buffer);
      
      await storage.updateProcessingJob(jobId, { 
        progress: Math.round(((i + 1) / job.inputFiles.length) * 30)
      });
    }

    let outputBuffers: Buffer[] = [];
    let outputFileNames: string[] = [];

    // Process based on job type
    switch (job.type) {
      case 'merge':
        const mergedPdf = await pdfProcessor.mergePDFs(inputBuffers);
        outputBuffers = [mergedPdf];
        outputFileNames = [`merged-${uuidv4()}.pdf`];
        break;

      case 'split':
        const ranges = job.options?.ranges || [{ start: 1, end: 1 }];
        outputBuffers = await pdfProcessor.splitPDF(inputBuffers[0], ranges);
        outputFileNames = ranges.map((_: any, i: number) => `split-${i + 1}-${uuidv4()}.pdf`);
        break;

      case 'compress':
        const quality = job.options?.quality || 0.8;
        const compressedPdf = await pdfProcessor.compressPDF(inputBuffers[0], quality);
        outputBuffers = [compressedPdf];
        outputFileNames = [`compressed-${uuidv4()}.pdf`];
        break;

      case 'pdf-to-image':
        const format = job.options?.format || 'png';
        const images = await pdfProcessor.pdfToImages(inputBuffers[0], format);
        outputBuffers = images;
        outputFileNames = images.map((_, i) => `page-${i + 1}-${uuidv4()}.${format}`);
        break;

      case 'image-to-pdf':
        const pdfFromImages = await pdfProcessor.imagesToPDF(inputBuffers);
        outputBuffers = [pdfFromImages];
        outputFileNames = [`converted-${uuidv4()}.pdf`];
        break;

      case 'ocr':
        const extractedText = await pdfProcessor.extractTextFromPDF(inputBuffers[0]);
        const textBuffer = Buffer.from(extractedText, 'utf-8');
        outputBuffers = [textBuffer];
        outputFileNames = [`extracted-text-${uuidv4()}.txt`];
        break;

      case 'image-ocr':
        const imageTexts: string[] = [];
        for (let i = 0; i < inputBuffers.length; i++) {
          try {
            const text = await googleCloudService.extractTextFromImage(inputBuffers[i]);
            imageTexts.push(`=== Image ${i + 1} ===\n${text}\n\n`);
          } catch (error) {
            console.error(`OCR failed for image ${i + 1}:`, error);
            imageTexts.push(`=== Image ${i + 1} ===\nOCR processing failed\n\n`);
          }
          
          await storage.updateProcessingJob(jobId, { 
            progress: 70 + Math.round(((i + 1) / inputBuffers.length) * 20)
          });
        }
        
        const combinedText = imageTexts.join('');
        const combinedTextBuffer = Buffer.from(combinedText, 'utf-8');
        outputBuffers = [combinedTextBuffer];
        outputFileNames = [`extracted-text-${uuidv4()}.txt`];
        break;

      default:
        throw new Error(`Unsupported job type: ${job.type}`);
    }

    await storage.updateProcessingJob(jobId, { progress: 70 });

    // Upload output files
    const uploadedOutputFiles: string[] = [];
    for (let i = 0; i < outputBuffers.length; i++) {
      const fileName = outputFileNames[i];
      await googleCloudService.uploadFile(
        outputBuffers[i], 
        fileName, 
        fileName.endsWith('.pdf') ? 'application/pdf' : 
        fileName.endsWith('.txt') ? 'text/plain' : 'image/png'
      );
      uploadedOutputFiles.push(fileName);
      
      await storage.updateProcessingJob(jobId, { 
        progress: 70 + Math.round(((i + 1) / outputBuffers.length) * 30)
      });
    }

    await storage.updateProcessingJob(jobId, {
      status: 'completed',
      progress: 100,
      outputFiles: uploadedOutputFiles
    });

  } catch (error) {
    console.error('Job processing failed:', error);
    await storage.updateProcessingJob(jobId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
