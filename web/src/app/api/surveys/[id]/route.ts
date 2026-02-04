import { supabase } from '@/lib/db-server';
import { getUser, unauthorized } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        const { id } = await params;
        const { data: survey, error } = await supabase
            .from('surveys')
            .select(`
        *,
        industries (*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data: survey });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Survey not found' }, { status: 404 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        const { id } = await params;
        const { error } = await supabase
            .from('surveys')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
