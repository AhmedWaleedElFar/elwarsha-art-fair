import { NextResponse } from 'next/server';
import sharp from 'sharp';

// Detailed logging function
function logDetailed(message, data) {
  console.log(`[PDF PREVIEW DEBUG] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Create a 1x1 transparent PNG
const FALLBACK_IMAGE = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');

// Create a solid color image for debugging
const createColorImage = (width, height, color = '#2a2a2a') => {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: color
    }
  })
  .png()
  .toBuffer();
}

export async function GET(request) {
  console.group('PDF Preview Request');
  console.log('Request URL:', request.url);
  console.log('Request Method:', request.method);

  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');
  const width = parseInt(searchParams.get('width') || '300', 10);
  const height = parseInt(searchParams.get('height') || '400', 10);

  console.log('File ID:', fileId);
  console.log('Dimensions:', { width, height });

  if (!fileId) {
    console.error('No file ID provided');
    return NextResponse.json({ error: 'No file ID provided' }, { status: 400 });
  }

  console.log(`Processing PDF for fileId: ${fileId}, width: ${width}, height: ${height}`);

  try {
    // Fetch PDF from proxy endpoint
    console.log(`Fetching PDF from proxy endpoint`);
    console.log('Proxy PDF URL:', `${process.env.NEXTAUTH_URL}/api/proxy-pdf?fileId=${fileId}`);
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

    const pdfResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/proxy-pdf?fileId=${fileId}`);
    
    console.log('PDF Fetch Response:', {
      status: pdfResponse.status,
      statusText: pdfResponse.statusText,
      headers: Object.fromEntries(pdfResponse.headers.entries())
    });

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.error('PDF Fetch Error:', {
        status: pdfResponse.status,
        statusText: pdfResponse.statusText,
        body: errorText
      });
      return NextResponse.json({ 
        error: 'Failed to fetch PDF', 
        details: errorText 
      }, { status: 500 });
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfFile = Buffer.from(pdfBuffer);

    console.log('PDF Buffer Details:', {
      bufferLength: pdfBuffer.byteLength,
      fileLength: pdfFile.length
    });

    try {
      // Try to generate an image from the PDF
      let resizedImage;
      try {
        console.time('Image Generation');
        resizedImage = await sharp(pdfBuffer)
          .toFormat('png')
          .resize(width, height, { 
            fit: 'contain', 
            background: { r: 42, g: 42, b: 42, alpha: 1 } 
          })
          .toBuffer();
        console.timeEnd('Image Generation');
      } catch (imageError) {
        console.error('Image Generation Error:', {
          message: imageError.message,
          stack: imageError.stack
        });
        // Fallback to a solid color image
        resizedImage = await createColorImage(width, height);
      }

      console.log('Resized Image Details:', {
        imageSize: resizedImage.length
      });

      return new NextResponse(resizedImage, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } catch (error) {
      console.error('Unexpected Processing Error:', {
        message: error.message,
        stack: error.stack
      });

      // Final fallback to a solid color image
      const fallbackImage = await createColorImage(width, height);

      return new NextResponse(fallbackImage, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
  } catch (error) {
    console.error('PDF preview error:', error);
    console.error('Full error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ 
      error: 'Failed to generate PDF preview', 
      details: error.toString() 
    }, { status: 500 });
  }
}
