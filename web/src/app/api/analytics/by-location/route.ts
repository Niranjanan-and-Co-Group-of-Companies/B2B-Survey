import { supabase } from '@/lib/db-server';
import { getUser, unauthorized } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        const { searchParams } = new URL(req.url);
        const industry = searchParams.get('industry');

        let query = supabase.from('surveys').select('state, industries!inner(industry_key)');
        if (industry) query = query.eq('industries.industry_key', industry);

        const { data: surveys, error } = await query;
        if (error) throw error;

        const counts: Record<string, number> = {};
        (surveys || []).forEach((s: any) => {
            const state = s.state || 'Unknown';
            counts[state] = (counts[state] || 0) + 1;
        });

        const data = Object.entries(counts).map(([state, count]) => ({ state, count }));
        data.sort((a, b) => b.count - a.count);

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
