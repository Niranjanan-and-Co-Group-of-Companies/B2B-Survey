import { supabase } from '@/lib/db-server';
import { NextRequest, NextResponse } from 'next/server';

// Increase limit is set in next.config.ts usually, but here we read request body
// Note: Next.js App Router body size limit defaults to 4MB. 
// Vercel limit is 4.5MB.
// We should rely on standard parsing.

export async function POST(req: NextRequest) {
    try {
        const { photo, surveyId, filename } = await req.json();

        if (!photo || !surveyId) {
            return NextResponse.json({ success: false, error: 'Photo and surveyId are required' }, { status: 400 });
        }

        // Determine content type from base64 header
        let contentType = 'image/jpeg';
        const matches = photo.match(/^data:([^;]+);base64,/);
        if (matches) {
            contentType = matches[1];
        }

        // Store photo in database
        const { data, error } = await supabase
            .from('survey_photos')
            .insert([{
                survey_id: surveyId,
                filename: filename || 'photo.jpg',
                content_type: contentType,
                photo_data: photo  // Store the full base64 string including data URI prefix
            }])
            .select()
            .single();

        if (error) {
            console.error('Photo storage error:', error);
            if (error.message.includes('relation') || error.code === '42P01') {
                return NextResponse.json({
                    success: false,
                    error: 'Photo storage not configured. Run add-survey-photos-table.sql in Supabase.'
                }, { status: 400 });
            }
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: {
                id: data.id,
                filename: data.filename
            }
        });
    } catch (error: any) {
        console.error('Photo upload error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
