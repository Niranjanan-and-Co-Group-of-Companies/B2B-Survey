import { getUser, unauthorized } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const user = await getUser(req);
    if (!user) return unauthorized();

    return NextResponse.json({
        success: true,
        data: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }
    });
}
