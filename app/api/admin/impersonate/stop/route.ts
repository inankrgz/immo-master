import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const cookieStore = cookies();

        // Delete the impersonation cookie
        cookieStore.delete('impersonatedOrgId');

        return NextResponse.redirect(new URL('/admin/organizations', request.url));
    } catch (error) {
        console.error('Error stopping impersonation:', error);
        return NextResponse.redirect(new URL('/', request.url));
    }
}
