// Proxy route for Google Drive PDF download to bypass CORS
import fetch from 'node-fetch';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get('fileId');
  if (!fileId) {
    return new Response('Missing fileId', { status: 400 });
  }

  // Google Drive direct download URL
  const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  try {
    const driveRes = await fetch(driveUrl);
    if (!driveRes.ok) {
      return new Response('Failed to fetch PDF', { status: 502 });
    }
    // Stream the PDF file to the client
    return new Response(driveRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        // Allow range requests for pdf.js
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (err) {
    return new Response('Proxy error', { status: 500 });
  }
}
