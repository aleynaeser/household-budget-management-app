import { NextRequest, NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    // Ensure we have a File with a name and type
    const namedFile = file instanceof File ? file : new File([file], 'receipt.jpg', { type: 'image/jpeg' });

    const utapi = new UTApi();
    const results = await utapi.uploadFiles([namedFile]);

    const first = results[0];
    if (!first || first.error || !first.data?.url) {
      console.error('UploadThing upload failed:', first?.error || first);
      return NextResponse.json({ error: 'UploadThing upload failed' }, { status: 500 });
    }

    return NextResponse.json({ url: first.data.url });
  } catch (err) {
    console.error('Receipt image upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
