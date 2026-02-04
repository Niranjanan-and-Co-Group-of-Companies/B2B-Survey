import { supabase } from '@/lib/db-server';
import { getUser, unauthorized } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

// GET Surveys (Protected)
export async function GET(req: NextRequest) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const industry = searchParams.get('industry');
        const city = searchParams.get('city');
        const status = searchParams.get('status');
        const offset = (page - 1) * limit;

        let query = supabase
            .from('surveys')
            .select(`
        *,
        industries (display_name, icon)
      `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (industry) query = query.eq('industry_id', industry);
        if (city) query = query.ilike('city', `%${city}%`);
        if (status) query = query.eq('status', status);

        const { data: surveys, count, error } = await query;

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: surveys,
            pagination: {
                total: count,
                page,
                pages: Math.ceil((count || 0) / limit)
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST Submit Survey (Public)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { business, currentProcurement, industryData, meta } = body;

        // Validate required data
        if (!business || !business.name) {
            return NextResponse.json({ success: false, error: 'Business name is required' }, { status: 400 });
        }

        // Generate survey ID
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        const surveyId = `SRV-${timestamp}-${random}`;

        // Get industry ID from key
        let industryId = null;
        if (business.industry) {
            const { data: industry } = await supabase
                .from('industries')
                .select('id')
                .eq('industry_key', business.industry)
                .single();
            industryId = industry?.id;
        }

        const surveyData: any = {
            survey_id: surveyId,
            business_name: business.name,
            industry_id: industryId,
            sub_category: business.subCategory || null,
            owner_name: business.ownerName || null,
            contact_phone: business.contactPhone || null,
            contact_email: business.contactEmail || null,
            city: business.address?.city || null,
            state: business.address?.state || null,
            pincode: business.address?.pincode || null,
            street: business.address?.street || null,
            location_source: business.locationSource || 'not_provided',
            years_in_operation: business.yearsInOperation || null,
            employees_count: business.employeeCount || business.employeesCount || null,
            current_method: currentProcurement?.method || null,
            monthly_budget_min: currentProcurement?.monthlyBudget?.min || null,
            monthly_budget_max: currentProcurement?.monthlyBudget?.max || null,
            preferred_credit_period: currentProcurement?.preferredCreditPeriod || null,
            pain_points: currentProcurement?.painPoints || null,
            willing_to_switch: currentProcurement?.willingToSwitch || null,
            industry_data: industryData || {},
            source: meta?.source || 'website',
            status: 'submitted'
        };

        // Handle location if provided
        if (business.location?.coordinates && Array.isArray(business.location.coordinates)) {
            const [lng, lat] = business.location.coordinates;
            if (lng && lat) {
                surveyData.location = `POINT(${lng} ${lat})`;
            }
        }

        const { data: survey, error } = await supabase
            .from('surveys')
            .insert([surveyData])
            .select()
            .single();

        if (error) {
            console.error('Survey insert error:', error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: {
                surveyId: survey.survey_id,
                id: survey.id
            }
        }, { status: 201 });
    } catch (error: any) {
        console.error('Survey submission error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
