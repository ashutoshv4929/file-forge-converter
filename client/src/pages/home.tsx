import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { ToolCard } from "@/components/ui/tool-card";
import { ProcessingModal } from "@/components/ui/processing-modal";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  FileText, 
  Scissors, 
  Minimize2, 
  FileImage, 
  FileType, 
  Search, 
  Edit3,
  Merge,
  Shield,
  Zap,
  Smartphone,
  Menu,
  X
} from "lucide-react";

export default function Home() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const tools = [
    {
      id: 'merge',
      title: 'Merge PDF',
      description: 'Combine multiple PDFs into one document',
      icon: Merge,
      color: 'red'
    },
    {
      id: 'split',
      title: 'Split PDF',
      description: 'Extract pages from your PDF document',
      icon: Scissors,
      color: 'blue'
    },
    {
      id: 'compress',
      title: 'Compress PDF',
      description: 'Reduce PDF file size while maintaining quality',
      icon: Minimize2,
      color: 'green'
    },
    {
      id: 'pdf-to-word',
      title: 'PDF to Word',
      description: 'Convert PDF to editable Word document',
      icon: FileText,
      color: 'indigo'
    },
    {
      id: 'word-to-pdf',
      title: 'Word to PDF',
      description: 'Convert Word documents to PDF format',
      icon: FileType,
      color: 'purple'
    },
    {
      id: 'pdf-to-image',
      title: 'PDF to Image',
      description: 'Convert PDF pages to JPG or PNG images',
      icon: FileImage,
      color: 'yellow'
    },
    {
      id: 'ocr',
      title: 'Extract Text',
      description: 'Extract text from images and scanned documents',
      icon: Search,
      color: 'teal'
    },
    {
      id: 'image-ocr',
      title: 'Image to Text',
      description: 'Extract text from JPG, PNG images using OCR',
      icon: FileImage,
      color: 'cyan'
    },
    {
      id: 'edit',
      title: 'Edit PDF',
      description: 'Add text, images, and annotations',
      icon: Edit3,
      color: 'orange'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: '100% Secure',
      description: 'Your files are processed securely and deleted automatically after processing'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process multiple files simultaneously with our optimized cloud infrastructure'
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Works perfectly on any device - desktop, tablet, or smartphone'
    }
  ];

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    setIsModalOpen(true);
  };

  const handleQuickUpload = () => {
    // Trigger file selection dialog
    document.getElementById('quick-upload-input')?.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <FileText className="h-8 w-8 text-red-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">PDF Tools</span>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#tools" className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors">
                Tools
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors">
                Pricing
              </a>
              <a href="#about" className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors">
                About
              </a>
            </nav>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
              <a href="#tools" className="block text-gray-700 hover:text-red-600 px-3 py-2 text-base font-medium">
                Tools
              </a>
              <a href="#pricing" className="block text-gray-700 hover:text-red-600 px-3 py-2 text-base font-medium">
                Pricing
              </a>
              <a href="#about" className="block text-gray-700 hover:text-red-600 px-3 py-2 text-base font-medium">
                About
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 to-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Every tool you need to work with PDFs in one place
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Convert, merge, split, compress and edit PDF files for free. Our tools are secure, fast, and work on any device.
            </p>
            
            {/* Quick upload area */}
            <div className="max-w-2xl mx-auto">
              <FileDropzone
                onFilesSelected={(files) => {
                  console.log('Files selected:', files);
                  // Handle quick upload
                }}
                className="border-2 border-dashed border-red-300 rounded-xl p-8 sm:p-12 bg-white/50 hover:border-red-400 transition-colors cursor-pointer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12 sm:py-16 lg:py-20" id="tools">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Choose your PDF tool
            </h2>
            <p className="text-lg text-gray-600">
              Select from our comprehensive suite of PDF tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onClick={() => handleToolSelect(tool.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Why choose our PDF tools?
            </h2>
            <p className="text-lg text-gray-600">
              Fast, secure, and reliable PDF processing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <FileText className="h-8 w-8 text-red-500 mr-2" />
                <span className="text-xl font-bold">PDF Tools</span>
              </div>
              <p className="text-gray-400 mb-4">
                Professional PDF tools for all your document needs. Convert, merge, split, and edit PDFs with ease.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Tools</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Merge PDF</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Split PDF</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Compress PDF</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Convert PDF</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 PDF Tools. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Processing Modal */}
      <ProcessingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedTool={selectedTool ? tools.find(t => t.id === selectedTool) : null}
      />

      {/* Mobile Navigation */}
      {isMobile && <MobileNav onToolSelect={handleToolSelect} />}
    </div>
  );
}
