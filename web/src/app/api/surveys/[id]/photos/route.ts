import { supabase } from '@/lib/db-server';
import { getUser, unauthorized } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        const { id } = await params;

        // First get the survey to get survey_id (human readable). 
        // Wait, the upload endpoint stores 'surveyId' which is the UUID or the human readable one?
        // In server-supabase.js:946: survey_id: surveyId (from body).
        // In frontend Survey Form (Step 6/5): It sets surveyId to UUID from response.
        // The previous code in server-supabase.js:986 fetched 'survey_id' (human readable) from 'surveys' table using UUID 'id'.
        // And then queried photos using that human readable ID.

        // Let's mirror the exact logic.
        const { data: survey, error: surveyError } = await supabase
            .from('surveys')
            .select('survey_id')
            .eq('id', id)
            .single();

        if (surveyError || !survey) {
            return NextResponse.json({ success: true, data: [] });
        }

        const surveyHumanId = survey.survey_id;

        // Get photos from database
        const { data: photos, error } = await supabase
            .from('survey_photos')
            .select('id, filename, content_type, photo_data, created_at')
            .eq('survey_id', surveyHumanId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching photos:', error);
            return NextResponse.json({ success: true, data: [] });
        }

        const formattedPhotos = (photos || []).map(photo => ({
            id: photo.id,
            name: photo.filename,
            url: photo.photo_data,
            createdAt: photo.created_at
        }));

        return NextResponse.json({ success: true, data: formattedPhotos });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
