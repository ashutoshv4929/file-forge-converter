import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ProgressIndicatorProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

export function ProgressIndicator({ status, progress, error }: ProgressIndicatorProps) {
  if (status === 'pending') {
    return (
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 text-blue-600" />
          <p className="font-medium text-blue-900">Preparing your files...</p>
        </div>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          <div className="flex-1">
            <p className="font-medium text-blue-900">Processing your files...</p>
            <Progress value={progress} className="mt-2" />
            <p className="text-sm text-blue-700 mt-1">
              {progress}% complete
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Processing completed!</p>
            <p className="text-sm text-green-700">Your files are ready for download</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="bg-red-50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <XCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Processing failed</p>
            <p className="text-sm text-red-700">
              {error || 'An error occurred during processing'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
