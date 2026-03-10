import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orgId = (session.user as any).organizationId;

        const tenants = await prisma.tenant.findMany({
            where: {
                organizationId: orgId,
                deletedAt: null
            },
            include: {
                leases: {
                    include: {
                        unit: {
                            include: {
                                property: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(tenants);
    } catch (error) {
        console.error('Error fetching tenants:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orgId = (session.user as any).organizationId;
        const body = await request.json();

        // Basic validation
        if (!body.firstName || !body.lastName) {
            return NextResponse.json({ error: 'Vor- und Nachname sind erforderlich' }, { status: 400 });
        }

        // TRANSACTION: Create Tenant, Create Lease, and Create Audit Log
        // Note: In real app, we validate that the unitId belongs to the orgId before creating lease.
        const result = await prisma.$transaction(async (tx) => {

            // 1. Create Tenant
            const tenant = await tx.tenant.create({
                data: {
                    organizationId: orgId,
                    firstName: body.firstName,
                    lastName: body.lastName,
                    email: body.email || null,
                    phone: body.phone || null,
                }
            });

            // 2. Create Lease (if unit is provided)
            if (body.unitId && body.startDate && body.rent) {
                await tx.lease.create({
                    data: {
                        organizationId: orgId,
                        unitId: body.unitId,
                        tenantId: tenant.id,
                        startDate: new Date(body.startDate),
                        endDate: body.endDate ? new Date(body.endDate) : null,
                        depositAmount: body.deposit ? parseFloat(body.deposit) : null
                    }
                });
                // Depending on GoBD logic, we might also seed the initial 'Charge' for rent here.
            }

            // 3. Write Audit Log
            await tx.auditLog.create({
                data: {
                    organizationId: orgId,
                    userId: session.user?.id || 'system',
                    action: 'CREATE',
                    tableName: 'Tenant',
                    recordId: tenant.id,
                    newData: JSON.stringify(body),
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
                }
            });

            return tenant;
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        console.error('Error creating tenant:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
