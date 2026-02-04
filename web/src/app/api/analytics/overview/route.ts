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

        // Helper to apply filters
        const applyFilters = (query: any) => {
            if (industry) query = query.eq('industries.industry_key', industry);
            if (state) query = query.eq('state', state);
            return query;
        };

        // Calculate stats directly
        let baseQuery = supabase.from('surveys').select('*, industries!inner(industry_key)', { count: 'exact', head: true });
        baseQuery = applyFilters(baseQuery);
        const { count: total } = await baseQuery;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let todayQuery = supabase.from('surveys').select('*, industries!inner(industry_key)', { count: 'exact', head: true }).gte('created_at', today.toISOString());
        todayQuery = applyFilters(todayQuery);
        const { count: todayCount } = await todayQuery;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        let weekQuery = supabase.from('surveys').select('*, industries!inner(industry_key)', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString());
        weekQuery = applyFilters(weekQuery);
        const { count: weekCount } = await weekQuery;

        let submittedQuery = supabase.from('surveys').select('*, industries!inner(industry_key)', { count: 'exact', head: true }).eq('status', 'submitted');
        submittedQuery = applyFilters(submittedQuery);
        const { count: submitted } = await submittedQuery;

        let verifiedQuery = supabase.from('surveys').select('*, industries!inner(industry_key)', { count: 'exact', head: true }).eq('status', 'verified');
        verifiedQuery = applyFilters(verifiedQuery);
        const { count: verified } = await verifiedQuery;

        let rejectedQuery = supabase.from('surveys').select('*, industries!inner(industry_key)', { count: 'exact', head: true }).eq('status', 'rejected');
        rejectedQuery = applyFilters(rejectedQuery);
        const { count: rejected } = await rejectedQuery;

        // Source counts (without filters for simpler logic currently)
        const { count: fromWeb } = await supabase.from('surveys').select('*', { count: 'exact', head: true }).eq('source', 'website');
        const { count: fromMobile } = await supabase.from('surveys').select('*', { count: 'exact', head: true }).eq('source', 'mobile_app');

        return NextResponse.json({
            success: true,
            data: {
                totals: {
                    all: total || 0,
                    today: todayCount || 0,
                    thisWeek: weekCount || 0,
                    thisMonth: total || 0
                },
                byStatus: {
                    submitted: submitted || 0,
                    verified: verified || 0,
                    rejected: rejected || 0
                },
                bySource: {
                    website: fromWeb || 0,
                    mobile_app: fromMobile || 0
                }
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
