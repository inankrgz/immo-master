import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = (session.user as any).role;

        // Only Super-Admins can impersonate
        if (role !== 'OWNER' && role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const formData = await request.formData();
        const orgId = formData.get('orgId') as string;

        if (!orgId) {
            return NextResponse.redirect(new URL('/admin/organizations', request.url));
        }

        // Set the secure cookie
        const cookieStore = cookies();
        cookieStore.set('impersonatedOrgId', orgId, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 2 // 2 hours
        });

        // Redirect to the dashboard as the new tenant
        return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
        console.error('Impersonation error:', error);
        return NextResponse.redirect(new URL('/admin/organizations', request.url));
    }
}
