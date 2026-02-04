import { supabase } from '@/lib/db-server';
import { getUser, unauthorized } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

// PUT (Protected)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ questionId: string }> }) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        const { questionId } = await params;
        const body = await req.json();
        const field_key = body.field_key || body.question_key;
        const label = body.label || body.question_text;
        const field_type = body.field_type || body.question_type;
        const { options, is_required, placeholder } = body;

        const { data: question, error } = await supabase
            .from('industry_questions')
            .update({ field_key, label, field_type, options, is_required, placeholder })
            .eq('id', questionId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data: question });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE (Protected)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ questionId: string }> }) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        const { questionId } = await params;
        const { error } = await supabase
            .from('industry_questions')
            .delete()
            .eq('id', questionId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Question deleted' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
