import { NextResponse } from 'next/server';
import { exportUserData } from '@/services/data-export';
import { getAuth } from 'firebase/auth';

export async function GET() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Use the function directly
    const result = await exportUserData();
    
    // Convert blob to buffer for response
    const buffer = Buffer.from(await result.blob.arrayBuffer());
    
    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', `attachment; filename="${result.filename}"`);
    
    return new NextResponse(buffer, { status: 200, headers });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export data' },
      { status: 500 }
    );
  }
}