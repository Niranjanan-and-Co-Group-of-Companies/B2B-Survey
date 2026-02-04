import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'B2B Survey API is running (Next.js)!',
        timestamp: new Date().toISOString(),
        database: process.env.SUPABASE_URL ? 'Supabase connected' : 'No database configured'
    });
}
