import mammoth from 'mammoth';

// Configure PDF.js worker for Next.js (client-side only)
let pdfjsLib: any = null;
if (typeof window !== 'undefined') {
  // Use dynamic import to load PDF.js only on the client side
  import('pdfjs-dist').then((pdfjs) => {
    pdfjsLib = pdfjs;
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  });
}

export interface FileProcessingResult {
  success: boolean;
  content: string;
  error?: string;
}

export const fileProcessingService = {

  async processFile(file: File): Promise<FileProcessingResult> {
    const fileExtension = file.name.toLowerCase().split('.').pop();

    try {
      let extractedText = '';

      switch (fileExtension) {
        case 'docx':
          extractedText = await this.processDocxFile(file);
          break;

        case 'doc':
          extractedText = await this.processDocFile(file);
          break;

        case 'pdf': {
          const pdfResult = await this.processPdfFile(file);
          if (!pdfResult.success) {
            return pdfResult;
          }
          extractedText = pdfResult.content;
        } break;

        case 'txt':
          extractedText = await this.processTxtFile(file);
          break;

        default:
          return {
            success: false,
            content: '',
            error: 'Unsupported file type. Please upload a .txt, .doc, .docx, or .pdf file.'
          };
      }

      return {
        success: true,
        content: extractedText
      };
    } catch (error) {
      console.error('Error extracting text from file:', error);
      return {
        success: false,
        content: '',
        error: 'Failed to extract text from the file. Please try again or use a different file.'
      };
    }
  },

  async processDocxFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  },

  async processDocFile(file: File): Promise<string> {
    // Use the server-side extract-text API for .doc files
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/extract-text', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to extract text from .doc file');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to extract text from .doc file');
    }

    return result.content;
  },

  async processPdfFile(file: File): Promise<FileProcessingResult> {
    if (!pdfjsLib) {
      return {
        success: false,
        content: '',
        error: 'PDF processing is not available. Please try again in a moment.'
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => {
          if ('str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' ');
      fullText += pageText + '\n';
    }

    return {
      success: true,
      content: fullText.trim()
    };
  },

  async processTxtFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          resolve(text);
        } else {
          reject(new Error('Failed to read text file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }
};
