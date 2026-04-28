import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filename, dataUrl, resourceType } = body;
    if (!dataUrl) return NextResponse.json({ error: 'No dataUrl provided' }, { status: 400 });

    // Parse data URL: data:<mime>;base64,<data>
    const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
    if (!match) return NextResponse.json({ error: 'Invalid dataUrl' }, { status: 400 });
    const mime = match[1].toLowerCase();
    const base64 = match[2];
    const buffer = Buffer.from(base64, 'base64');
    const sizeBytes = buffer.length;

    // Determine resource type (image or raw). If provided, trust but validate.
    const rType = resourceType === 'raw' ? 'raw' : resourceType === 'image' ? 'image' : (mime.startsWith('image/') ? 'image' : 'raw');

    const allowedImageMimes = new Set([
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/avif'
    ]);
    const allowedRawMimes = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]);

    const imageMax = Number(process.env.UPLOAD_MAX_IMAGE_BYTES) || 5 * 1024 * 1024; // 5MB
    const rawMax = Number(process.env.UPLOAD_MAX_RAW_BYTES) || 10 * 1024 * 1024; // 10MB

    if (rType === 'image') {
      if (!allowedImageMimes.has(mime)) {
        return NextResponse.json({ error: `Unsupported image type: ${mime}` }, { status: 400 });
      }
      if (sizeBytes > imageMax) {
        return NextResponse.json({ error: `Image too large: ${Math.round(sizeBytes/1024)}KB` }, { status: 413 });
      }
    } else {
      // raw
      if (!allowedRawMimes.has(mime)) {
        return NextResponse.json({ error: `Unsupported file type: ${mime}` }, { status: 400 });
      }
      if (sizeBytes > rawMax) {
        return NextResponse.json({ error: `File too large: ${Math.round(sizeBytes/1024)}KB` }, { status: 413 });
      }
    }

    const cloudName = process.env.CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });

    const timestamp = Math.floor(Date.now() / 1000);
    // include resource_type in signature when present
    const toSign = `timestamp=${timestamp}` + (rType ? `&resource_type=${rType}` : '');
    const signature = crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${rType}/upload`;

    const params = new URLSearchParams();
    params.append('file', dataUrl);
    if (filename) params.append('public_id', filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    params.append('api_key', apiKey);
    params.append('timestamp', String(timestamp));
    params.append('signature', signature);
    if (rType) params.append('resource_type', rType);

    const res = await fetch(url, { method: 'POST', body: params });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });

    return NextResponse.json({ url: data.secure_url, raw: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
