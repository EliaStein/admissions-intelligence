import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import WordExtractor from 'word-extractor';

interface ExtractTextResult {
  success: boolean;
  content: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, content: '', error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileExtension = file.name.toLowerCase().split('.').pop();

    // Only handle .doc files
    if (fileExtension !== 'doc') {
      return NextResponse.json(
        {
          success: false,
          content: '',
          error: 'This endpoint only supports legacy .doc files. Please use the client-side processing for other file types.'
        },
        { status: 400 }
      );
    }

    const result = await extractFromDoc(file);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error extracting text from .doc file:', error);
    return NextResponse.json(
      {
        success: false,
        content: '',
        error: 'Failed to extract text from the .doc file. Please try again or use a different file.'
      },
      { status: 500 }
    );
  }
}

async function extractFromDoc(file: File): Promise<ExtractTextResult> {
  try {
    const extractor = new WordExtractor();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extracted = await extractor.extract(buffer);
    return {
      success: true,
      content: extracted.getBody()
    };
  } catch (error) {
    console.error('Error extracting text from DOC:', error);
    return {
      success: false,
      content: '',
      error: 'Failed to extract text from DOC file. The file may be corrupted or password-protected.'
    };
  }
}
