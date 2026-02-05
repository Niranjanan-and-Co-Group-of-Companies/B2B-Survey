import { supabase, supabaseAdmin } from '@/lib/db-server';
import { getUser, unauthorized } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

// GET by Key (Public)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params; // id here is serving as 'key' for GET requests per original backend logic
        const { data: industry, error } = await supabase
            .from('industries')
            .select(`
        *,
        sub_categories (*),
        industry_questions (*)
      `)
            .eq('industry_key', id)
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data: industry });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Industry not found' }, { status: 404 });
    }
}

// PUT by ID (Protected)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        const { id } = await params;
        const { display_name, icon, description, is_active } = await req.json();

        const { data: industry, error } = await supabaseAdmin
            .from('industries')
            .update({ display_name, icon, description, is_active })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data: industry });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE by ID (Protected)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        const { id } = await params;

        // Manually cascade delete related records to avoid Foreign Key constraints
        // 1. Delete Surveys
        await supabaseAdmin.from('surveys').delete().eq('industry_id', id);
        // 2. Delete Questions
        await supabaseAdmin.from('industry_questions').delete().eq('industry_id', id);
        // 3. Delete Sub-categories
        await supabaseAdmin.from('sub_categories').delete().eq('industry_id', id);

        // 4. Finally Delete Industry
        const { error } = await supabaseAdmin
            .from('industries')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Industry deleted' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
