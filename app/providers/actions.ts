'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function createProvider(formData: FormData) {
    const session = await auth();
    const orgId = (session?.user as any)?.organizationId;
    if (!orgId) throw new Error('Unauthorized');

    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const email = formData.get('email') as string;

    await prisma.provider.create({
        data: {
            organizationId: orgId,
            name,
            category: category || 'Sonstiges',
            email: email || null,
            rating: 5,
        }
    });

    revalidatePath('/providers');
}

export async function payProviderJob(jobId: string) {
    const session = await auth();
    const orgId = (session?.user as any)?.organizationId;
    if (!orgId) throw new Error('Unauthorized');

    await prisma.providerJob.update({
        where: { id: jobId, organizationId: orgId },
        data: { status: 'PAID' }
    });

    revalidatePath('/providers');
}
