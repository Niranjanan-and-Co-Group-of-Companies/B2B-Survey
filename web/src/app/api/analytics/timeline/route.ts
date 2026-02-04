import { supabase } from '@/lib/db-server';
import { getUser, unauthorized } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        const { searchParams } = new URL(req.url);
        const industry = searchParams.get('industry');
        const state = searchParams.get('state');

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let query = supabase
            .from('surveys')
            .select('created_at, industries!inner(industry_key)')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at');

        if (industry) query = query.eq('industries.industry_key', industry);
        if (state) query = query.eq('state', state);

        const { data: surveys, error } = await query;

        if (error) throw error;

        const dailyCounts: Record<string, number> = {};
        (surveys || []).forEach((s: any) => {
            const date = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });

        const result = [];
        const current = new Date(thirtyDaysAgo);
        const now = new Date();
        while (current <= now) {
            const dateStr = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            result.push({
                date: dateStr,
                count: dailyCounts[dateStr] || 0
            });
            current.setDate(current.getDate() + 1);
        }

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
