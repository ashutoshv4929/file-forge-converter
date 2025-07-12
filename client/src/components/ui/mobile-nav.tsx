import { Grid3X3, Plus, History, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavProps {
  onToolSelect: (toolId: string) => void;
}

export function MobileNav({ onToolSelect }: MobileNavProps) {
  const scrollToTools = () => {
    const toolsSection = document.getElementById('tools');
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openFileSelector = () => {
    document.getElementById('file-input')?.click();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="grid grid-cols-4 gap-1">
        <Button
          variant="ghost"
          className="flex flex-col items-center py-2 text-xs font-medium text-gray-600 hover:text-red-600 h-auto"
          onClick={scrollToTools}
        >
          <Grid3X3 className="h-5 w-5 mb-1" />
          Tools
        </Button>
        
        <Button
          variant="ghost"
          className="flex flex-col items-center py-2 text-xs font-medium text-gray-600 hover:text-red-600 h-auto"
          onClick={openFileSelector}
        >
          <Plus className="h-5 w-5 mb-1" />
          Upload
        </Button>
        
        <Button
          variant="ghost"
          className="flex flex-col items-center py-2 text-xs font-medium text-gray-600 hover:text-red-600 h-auto"
          onClick={() => {}}
        >
          <History className="h-5 w-5 mb-1" />
          Recent
        </Button>
        
        <Button
          variant="ghost"
          className="flex flex-col items-center py-2 text-xs font-medium text-gray-600 hover:text-red-600 h-auto"
          onClick={() => {}}
        >
          <MoreHorizontal className="h-5 w-5 mb-1" />
          More
        </Button>
      </div>
    </div>
  );
}
