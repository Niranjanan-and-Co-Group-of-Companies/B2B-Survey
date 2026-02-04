import { supabase } from '@/lib/db-server';
import { getUser, unauthorized } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        const { searchParams } = new URL(req.url);
        const state = searchParams.get('state');

        let query = supabase.from('surveys').select('industry_id, industries(display_name, icon)');
        if (state) query = query.eq('state', state);

        const { data: surveys, error } = await query;

        if (error) throw error;

        const counts: Record<string, number> = {};
        (surveys || []).forEach((s: any) => {
            const name = s.industries?.display_name || 'Unknown';
            counts[name] = (counts[name] || 0) + 1;
        });

        const data = Object.entries(counts).map(([name, count]) => ({ name, count }));
        data.sort((a, b) => b.count - a.count);

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
