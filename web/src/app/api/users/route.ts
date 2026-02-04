import { supabase } from '@/lib/db-server';
import { getUser, unauthorized } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// GET Users
export async function GET(req: NextRequest) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, name, role, is_active, last_active, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data: users || [] });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST Create User
export async function POST(req: NextRequest) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        const { email, name, password, role } = await req.json();

        const password_hash = await bcrypt.hash(password, 10);

        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{ email, name, password_hash, role, is_active: true }])
            .select('id, email, name, role, is_active, created_at')
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data: newUser }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
