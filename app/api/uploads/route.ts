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

    // Prepare public_id (sanitize and strip extension)
    let publicId: string | undefined;
    if (filename) {
      publicId = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_').replace(/\.[^.]+$/, '');
    }

    // Build signing params and sort keys as required by Cloudinary.
    // Note: the upload path already encodes the resource type (e.g. /image/upload),
    // so we must NOT include `resource_type` in the signed string. Including it
    // previously caused signature mismatches for image uploads.
    const signParams: Record<string, string> = { timestamp: String(timestamp) };
    if (publicId) signParams.public_id = publicId;

    const toSign = Object.keys(signParams)
      .sort()
      .map((k) => `${k}=${signParams[k]}`)
      .join('&');

    const signature = crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${rType}/upload`;

    // Use FormData for uploads — more reliable for larger payloads and
    // avoids urlencoded size/encoding issues. Node / Next.js supports
    // FormData in server runtime.
    const form = new FormData();
    // Send binary buffer rather than the data URL string — more reliable
    // for server-side multipart uploads to Cloudinary.
    const filenameForForm = publicId ? `${publicId}` : filename || 'file';
    // Convert Node Buffer to a Blob with the correct MIME type so
    // server-side FormData.append accepts it in Next.js runtime.
    const fileBlob = new Blob([buffer], { type: mime });
    form.append('file', fileBlob, filenameForForm);
    if (publicId) form.append('public_id', publicId);
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('signature', signature);

    // Do not set manual Content-Type; let fetch set the multipart boundary.
    const res = await fetch(url, { method: 'POST', body: form });

    // Try to parse JSON, but fall back to text for unexpected responses
    let data: any;
    try {
      data = await res.json();
    } catch (parseErr) {
      const text = await res.text();
      data = { text };
    }

    if (!res.ok) {
      // Log Cloudinary response for easier debugging during development
      console.error('Cloudinary upload failed', { status: res.status, body: data });
      return NextResponse.json({ error: 'Cloudinary upload failed', status: res.status, body: data }, { status: 502 });
    }

    return NextResponse.json({ url: data.secure_url, raw: data });
  } catch (err: any) {
    console.error('uploads.route error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
