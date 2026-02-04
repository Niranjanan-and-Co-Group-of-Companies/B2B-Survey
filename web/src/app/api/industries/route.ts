import { supabase } from '@/lib/db-server';
import { getUser, unauthorized } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const { data: industries, error } = await supabase
            .from('industries')
            .select(`
        *,
        sub_categories (*)
      `)
            .order('display_name');

        if (error) throw error;

        return NextResponse.json({ success: true, data: industries });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        const { industry_key, display_name, icon, description, is_active } = await req.json();

        const { data: industry, error } = await supabase
            .from('industries')
            .insert([{ industry_key, display_name, icon, description, is_active }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data: industry }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
