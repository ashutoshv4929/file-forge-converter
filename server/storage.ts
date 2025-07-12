import { files, processingJobs, type File, type InsertFile, type ProcessingJob, type InsertProcessingJob, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // File methods
  createFile(file: InsertFile): Promise<File>;
  getFile(id: number): Promise<File | undefined>;
  deleteFile(id: number): Promise<void>;
  getExpiredFiles(): Promise<File[]>;
  
  // Processing job methods
  createProcessingJob(job: InsertProcessingJob): Promise<ProcessingJob>;
  getProcessingJob(id: number): Promise<ProcessingJob | undefined>;
  updateProcessingJob(id: number, updates: Partial<ProcessingJob>): Promise<ProcessingJob | undefined>;
  getJobsByStatus(status: string): Promise<ProcessingJob[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private files: Map<number, File>;
  private processingJobs: Map<number, ProcessingJob>;
  private currentUserId: number;
  private currentFileId: number;
  private currentJobId: number;

  constructor() {
    this.users = new Map();
    this.files = new Map();
    this.processingJobs = new Map();
    this.currentUserId = 1;
    this.currentFileId = 1;
    this.currentJobId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.currentFileId++;
    const file: File = {
      ...insertFile,
      id,
      uploadedAt: new Date(),
    };
    this.files.set(id, file);
    return file;
  }

  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async deleteFile(id: number): Promise<void> {
    this.files.delete(id);
  }

  async getExpiredFiles(): Promise<File[]> {
    const now = new Date();
    return Array.from(this.files.values()).filter(
      (file) => file.expiresAt < now
    );
  }

  async createProcessingJob(insertJob: InsertProcessingJob): Promise<ProcessingJob> {
    const id = this.currentJobId++;
    const job: ProcessingJob = {
      ...insertJob,
      id,
      status: insertJob.status ?? 'pending',
      progress: insertJob.progress ?? 0,
      error: insertJob.error ?? null,
      options: insertJob.options ?? {},
      outputFiles: (insertJob.outputFiles as string[]) || [],
      inputFiles: insertJob.inputFiles,
      createdAt: new Date(),
      completedAt: null,
    };
    this.processingJobs.set(id, job);
    return job;
  }

  async getProcessingJob(id: number): Promise<ProcessingJob | undefined> {
    return this.processingJobs.get(id);
  }

  async updateProcessingJob(id: number, updates: Partial<ProcessingJob>): Promise<ProcessingJob | undefined> {
    const job = this.processingJobs.get(id);
    if (!job) return undefined;

    const updatedJob = { ...job, ...updates };
    if (updates.status === 'completed' || updates.status === 'failed') {
      updatedJob.completedAt = new Date();
    }
    
    this.processingJobs.set(id, updatedJob);
    return updatedJob;
  }

  async getJobsByStatus(status: string): Promise<ProcessingJob[]> {
    return Array.from(this.processingJobs.values()).filter(
      (job) => job.status === status
    );
  }
}

export const storage = new MemStorage();
