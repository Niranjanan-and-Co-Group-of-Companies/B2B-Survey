import { supabase } from '@/lib/db-server';
import { getUser, unauthorized } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

interface Question {
    id: string;
    field_key: string;
    label: string;
    field_type: string;
    options: any;
    industry_id: string;
    industries: { display_name: string } | null;
}

export async function GET(req: NextRequest) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        // Get all industry questions
        const { data: questionsData, error: qError } = await supabase
            .from('industry_questions')
            .select(`
        id,
        field_key,
        label,
        field_type,
        options,
        industry_id,
        industries (display_name)
      `)
            .order('display_order');

        if (qError) throw qError;

        // Supabase returns 'industries' as single object in array if joined, but type coercion is needed
        const questions = questionsData as any[] as Question[];

        // Get all surveys with industry data
        const { data: surveys, error: sError } = await supabase
            .from('surveys')
            .select('industry_data, industry_id');

        if (sError) throw sError;

        // Analyze each question
        const analysis = questions?.map(q => {
            // Find surveys that answer this question
            const relevantSurveys = surveys?.filter(s =>
                s.industry_id === q.industry_id &&
                s.industry_data &&
                s.industry_data[q.field_key] !== undefined
            ) || [];

            const responses = relevantSurveys.length;
            const values = relevantSurveys.map(s => s.industry_data[q.field_key]);

            let data: any[] = [];
            let stats: any = null;

            if (q.field_type === 'number') {
                const numericValues = values.filter(v => typeof v === 'number');
                if (numericValues.length > 0) {
                    const min = Math.min(...numericValues);
                    const max = Math.max(...numericValues);
                    stats = {
                        avg: Math.round(numericValues.reduce((a, b) => a + b, 0) / numericValues.length),
                        min,
                        max
                    };

                    const range = max - min;
                    const bucketSize = range > 0 ? Math.ceil(range / 5) : 1;
                    const buckets: Record<string, number> = {};
                    numericValues.forEach(v => {
                        const bucket = Math.floor((v - min) / bucketSize) * bucketSize + min;
                        const label = `${bucket}-${bucket + bucketSize}`;
                        buckets[label] = (buckets[label] || 0) + 1;
                    });
                    data = Object.entries(buckets).map(([label, value]) => ({ label, value }));
                }
            } else if (q.field_type === 'select' || q.field_type === 'boolean') {
                const counts: Record<string, number> = {};
                values.forEach(v => {
                    const label = String(v);
                    counts[label] = (counts[label] || 0) + 1;
                });
                data = Object.entries(counts).map(([label, value]) => ({ label, value }));
            } else if (q.field_type === 'multiselect') {
                const counts: Record<string, number> = {};
                values.forEach(v => {
                    if (Array.isArray(v)) {
                        v.forEach(item => {
                            counts[item] = (counts[item] || 0) + 1;
                        });
                    }
                });
                data = Object.entries(counts).map(([label, value]) => ({ label, value }));
            }

            return {
                questionKey: q.field_key,
                questionText: q.label,
                questionType: q.field_type,
                responses,
                data,
                stats
            };
        }).filter(q => q.responses > 0) || [];

        return NextResponse.json({ success: true, data: analysis });
    } catch (error: any) {
        console.error('Per-question analytics error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
