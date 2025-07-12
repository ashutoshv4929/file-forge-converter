import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SimpleFileUpload } from './simple-file-upload';
import { ProgressIndicator } from './progress-indicator';
import { Download, X, Settings } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTool: {
    id: string;
    title: string;
    description: string;
  } | null;
}

interface UploadedFile {
  id: number;
  name: string;
  size: number;
  type: string;
}

interface ProcessingJob {
  id: number;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  outputFiles: string[];
}

export function ProcessingModal({ isOpen, onClose, selectedTool }: ProcessingModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [options, setOptions] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Upload files mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedFiles(data.files);
      toast({
        title: "Files uploaded",
        description: `${data.files.length} file(s) ready for processing`,
      });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Please try again with smaller files",
        variant: "destructive",
      });
    }
  });

  // Start processing mutation
  const processMutation = useMutation({
    mutationFn: async (jobData: {
      type: string;
      inputFiles: string[];
      options: Record<string, any>;
    }) => {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData)
      });
      
      if (!response.ok) {
        throw new Error('Processing failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentJobId(data.jobId);
      toast({
        title: "Processing started",
        description: "Your files are being processed...",
      });
    },
    onError: (error) => {
      console.error('Processing error:', error);
      toast({
        title: "Processing failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  });

  // Poll job status
  const { data: job } = useQuery<ProcessingJob>({
    queryKey: ['/api/jobs', currentJobId],
    enabled: !!currentJobId,
    refetchInterval: currentJobId && 2000, // Poll every 2 seconds
  });

  const handleFilesSelected = (files: File[]) => {
    uploadMutation.mutate(files);
  };

  const handleStartProcessing = () => {
    if (!selectedTool || uploadedFiles.length === 0) return;

    const jobData = {
      type: selectedTool.id,
      inputFiles: uploadedFiles.map(f => f.id.toString()),
      options: options
    };

    processMutation.mutate(jobData);
  };

  const handleDownload = async (fileIndex: number) => {
    if (!currentJobId) return;

    try {
      const response = await fetch(`/api/download/${currentJobId}/${fileIndex}`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = job?.outputFiles[fileIndex] || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the file",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setUploadedFiles([]);
    setCurrentJobId(null);
    setOptions({});
    onClose();
  };

  const removeFile = (index: number) => {
    setUploadedFiles(files => files.filter((_, i) => i !== index));
  };

  const isProcessing = job?.status === 'processing';
  const isCompleted = job?.status === 'completed';
  const hasFailed = job?.status === 'failed';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle>
            {selectedTool?.title || 'PDF Tool'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Area */}
          {!currentJobId && uploadedFiles.length === 0 && (
            <SimpleFileUpload
              onFilesSelected={handleFilesSelected}
              isUploading={uploadMutation.isPending}
            />
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && !currentJobId && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Ready to Process ({uploadedFiles.length} files)</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={file.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">
                          {file.type.includes('pdf') ? 'PDF' : 
                           file.type.includes('image') ? 'IMG' : 'DOC'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tool-Specific Options */}
          {selectedTool?.id === 'image-ocr' && uploadedFiles.length > 0 && !currentJobId && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h4 className="font-medium text-blue-900">Image OCR Processing</h4>
              </div>
              <p className="text-sm text-blue-700">
                Upload images (JPG, PNG, GIF, etc.) to extract text using Google Cloud Vision API. 
                The system will process all images and combine the extracted text into a single file.
              </p>
            </div>
          )}

          {selectedTool?.id === 'split' && uploadedFiles.length > 0 && !currentJobId && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Split Options</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Start page"
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    ranges: [{ start: parseInt(e.target.value) || 1, end: prev.ranges?.[0]?.end || 1 }]
                  }))}
                />
                <input
                  type="number"
                  placeholder="End page"
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    ranges: [{ start: prev.ranges?.[0]?.start || 1, end: parseInt(e.target.value) || 1 }]
                  }))}
                />
              </div>
            </div>
          )}

          {selectedTool?.id === 'compress' && uploadedFiles.length > 0 && !currentJobId && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Compression Quality</h4>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                onChange={(e) => setOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
              >
                <option value="0.9">High Quality (90%)</option>
                <option value="0.8">Medium Quality (80%)</option>
                <option value="0.6">Low Quality (60%)</option>
              </select>
            </div>
          )}

          {/* Processing Status */}
          {job && (
            <ProgressIndicator
              status={job.status}
              progress={job.progress}
              error={job.error}
            />
          )}

          {/* Success State with Download */}
          {isCompleted && job.outputFiles.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Download className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-green-900">Processing completed!</p>
                  <p className="text-sm text-green-700">Your files are ready for download</p>
                </div>
              </div>
              <div className="space-y-2">
                {job.outputFiles.map((fileName, index) => (
                  <Button
                    key={index}
                    onClick={() => handleDownload(index)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download {fileName}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!currentJobId && uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <Button
                onClick={handleStartProcessing}
                disabled={uploadMutation.isPending || processMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
              >
                <Settings className="h-5 w-5 mr-2" />
                {processMutation.isPending ? 'Starting Conversion...' : `Convert ${uploadedFiles.length} File(s)`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
