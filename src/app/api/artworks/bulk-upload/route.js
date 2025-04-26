import { parse as parseMultipart } from 'parse-multipart-data';
import { promises as fs } from 'fs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import connectDB from '@/app/lib/db';
import Artwork from '@/app/lib/models/artwork';
import { parse } from 'csv-parse/sync';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  await connectDB();

    // Read raw body as buffer
  const buffer = Buffer.from(await req.arrayBuffer());
  const contentType = req.headers.get('content-type') || '';
  const boundary = contentType.split('boundary=')[1];
  if (!boundary) {
    return new Response(JSON.stringify({ error: 'No boundary in content-type' }), { status: 400 });
  }
  const parts = parseMultipart(buffer, boundary);
  const csvPart = parts.find(p => p.filename && p.filename.endsWith('.csv'));
  if (!csvPart) {
    return new Response(JSON.stringify({ error: 'CSV file is required' }), { status: 400 });
  }
  try {
      const csvString = csvPart.data.toString('utf-8');
      const records = parse(csvString, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
      const results = [];
      for (const row of records) {
        const {
          title,
          description,
          category,
          artistName,
          artworkCode,
          imageUrl,
          orderWithinCategory,
        } = row;
        if (!title || !description || !category || !artistName || !artworkCode || !imageUrl) {
          results.push({ artworkCode, success: false, error: 'Missing required fields' });
          continue;
        }
        try {
          const existing = await Artwork.findOne({ artworkCode });
          if (existing) {
            results.push({ artworkCode, success: false, error: 'Duplicate artwork code' });
            continue;
          }
          await Artwork.create({
            title,
            description,
            category,
            artistName,
            artworkCode,
            imageUrl,
            orderWithinCategory: Number(orderWithinCategory) || 0,
          });
          results.push({ artworkCode, success: true });
        } catch (e) {
          console.error(`Error creating artwork with code ${artworkCode}:`, e);
          results.push({ artworkCode, success: false, error: e.message || 'Database error' });
        }
      }
    return new Response(JSON.stringify({ results }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'CSV parsing error' }), { status: 400 });
  }
}
