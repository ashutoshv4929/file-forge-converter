# PDF Tools Application - Replit Guide

## Overview

This is a modern PDF processing web application built with React, Node.js/Express, and PostgreSQL. The application provides various PDF manipulation tools including merging, splitting, compression, OCR, and format conversion capabilities. It features a clean, responsive UI with file upload functionality and real-time processing status updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and build processes
- **UI Components**: Comprehensive set of accessible components using Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API design
- **File Processing**: Multer for file uploads with memory storage
- **PDF Processing**: PDF-lib for PDF manipulation operations

### Database Layer
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Connection**: @neondatabase/serverless for database connectivity

## Key Components

### File Upload System
- Multi-file upload support with drag-and-drop interface
- File type validation (PDF, images, Word documents)
- Size limitations (50MB per file)
- Temporary file storage with automatic cleanup

### Processing Engine
- Background job processing system
- Support for multiple PDF operations:
  - Merge multiple PDFs
  - Split PDFs by page ranges
  - Compress PDF files
  - Convert PDFs to images
  - OCR text extraction
  - Format conversion
- Real-time progress tracking

### User Interface
- Responsive design with mobile-first approach
- Tool selection cards with visual icons
- Processing modal with progress indicators
- File dropzone component
- Mobile navigation for smaller screens

## Data Flow

1. **File Upload**: Users select or drag files into the dropzone
2. **File Processing**: Files are uploaded to Google Cloud Storage
3. **Job Creation**: Processing jobs are created in the database
4. **Background Processing**: PDF operations are performed asynchronously
5. **Progress Updates**: Real-time status updates via API polling
6. **Result Delivery**: Processed files available for download

## External Dependencies

### Google Cloud Services
- **Cloud Storage**: File storage and retrieval
- **Vision API**: OCR capabilities for text extraction
- **Authentication**: Service account key-based authentication

### UI Component Libraries
- **Radix UI**: Accessible, unstyled UI primitives
- **Lucide React**: Icon library
- **shadcn/ui**: Pre-built component collection

### Development Tools
- **Replit Integration**: Development environment optimizations
- **Error Handling**: Runtime error overlay for development

## Deployment Strategy

### Development Environment
- Vite dev server with HMR (Hot Module Replacement)
- Express server with file watching
- Development-specific error overlays and debugging tools

### Production Build
- Frontend: Vite builds optimized React bundle
- Backend: esbuild bundles Node.js server code
- Static file serving through Express

### Environment Configuration
- Database URL required for PostgreSQL connection
- Google Cloud credentials for storage and Vision API
- Environment-specific configuration management

### Database Management
- Schema definitions in shared directory
- Migration system using Drizzle Kit
- Automatic database provisioning checks

## Development Notes

- The application uses a monorepo structure with shared types between client and server
- Path aliases configured for clean imports (@/, @shared/)
- TypeScript strict mode enabled throughout
- Mobile-responsive design with dedicated mobile navigation
- File expiration system for automatic cleanup
- Comprehensive error handling and user feedback systems