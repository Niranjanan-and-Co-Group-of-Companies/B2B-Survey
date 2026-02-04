import { supabase } from '@/lib/db-server';
import { getUser, unauthorized } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

// GET (Public)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: keyOrId } = await params;

        // First try to look up industry by key
        const { data: industry, error: indError } = await supabase
            .from('industries')
            .select('id')
            .eq('industry_key', keyOrId)
            .single();

        let targetIndustryId = keyOrId;
        if (!indError && industry) {
            targetIndustryId = industry.id;
        }

        // Get questions
        const { data: questions, error } = await supabase
            .from('industry_questions')
            .select('*')
            .eq('industry_id', targetIndustryId)
            .order('display_order');

        if (error) throw error;
        return NextResponse.json({ success: true, data: questions || [] });

    } catch (error: any) {
        // If invalid UUID and not a key, it might throw, but we just return empty array or error
        return NextResponse.json({ success: true, data: [] });
    }
}

// POST (Protected)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        const { id } = await params;
        // Support both old/new field names
        const body = await req.json();
        const field_key = body.field_key || body.question_key;
        const label = body.label || body.question_text;
        const field_type = body.field_type || body.question_type;
        const { options, is_required, placeholder } = body;

        // Get max display_order
        const { data: existing } = await supabase
            .from('industry_questions')
            .select('display_order')
            .eq('industry_id', id)
            .order('display_order', { ascending: false })
            .limit(1);

        const display_order = (existing?.[0]?.display_order || 0) + 1;

        const { data: question, error } = await supabase
            .from('industry_questions')
            .insert([{
                industry_id: id,
                field_key,
                label,
                field_type,
                options: options || null,
                is_required: is_required || false,
                placeholder: placeholder || null,
                display_order
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data: question }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
