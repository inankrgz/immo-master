'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function createTenant(formData: FormData) {
    const session = await auth();
    const orgId = (session?.user as any)?.organizationId;
    if (!orgId) throw new Error('Unauthorized');

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const unitId = formData.get('unitId') as string;
    const rent = parseFloat(formData.get('rent') as string) || 0;
    const deposit = parseFloat(formData.get('deposit') as string) || 0;
    const startDate = formData.get('startDate') as string;

    // In a real app we'd validate the inputs

    // Create Tenant and Lease in a transaction
    await prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
            data: {
                organizationId: orgId,
                firstName,
                lastName,
                email,
                phone,
            }
        });

        if (unitId) {
            await tx.lease.create({
                data: {
                    organizationId: orgId,
                    tenantId: tenant.id,
                    unitId: unitId,
                    startDate: new Date(startDate || new Date()),
                    depositAmount: deposit,
                }
            });

            // Also update unit size if needed, but handled separately usually
        }
    });

    revalidatePath('/tenants');
}

export async function deleteTenant(tenantId: string) {
    const session = await auth();
    const orgId = (session?.user as any)?.organizationId;
    if (!orgId) throw new Error('Unauthorized');

    await prisma.tenant.update({
        where: { id: tenantId, organizationId: orgId },
        data: { deletedAt: new Date() }
    });

    revalidatePath('/tenants');
}
