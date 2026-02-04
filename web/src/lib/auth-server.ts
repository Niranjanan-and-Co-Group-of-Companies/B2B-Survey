import jwt from 'jsonwebtoken';
import { supabase } from './db-server';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function getUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        // Ideally we might cache this or just trust the token claim if we want speed,
        // but looking up the user ensures they still exist and have correct role.
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.id)
            .single();

        return user;
    } catch (error) {
        return null;
    }
}

export function unauthorized() {
    return Response.json({ success: false, error: 'Not authorized' }, { status: 401 });
}
