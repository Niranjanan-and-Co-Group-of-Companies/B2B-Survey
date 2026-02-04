import { supabase } from '@/lib/db-server';
import { getUser, unauthorized } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        const { id } = await params;
        const { status, notes } = await req.json();

        if (!['submitted', 'verified', 'rejected'].includes(status)) {
            return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
        }

        const updates: any = {
            status,
            verified_at: status === 'verified' ? new Date().toISOString() : null,
            verified_by: status === 'verified' ? user.id : null
        };

        if (notes) {
            updates.notes = notes;
        }

        const { data: survey, error } = await supabase
            .from('surveys')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data: survey });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
