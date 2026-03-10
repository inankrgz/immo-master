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

        // Fetch ledgers (Charges) that act as open items (Soll-Stellungen)
        const charges = await prisma.charge.findMany({
            where: {
                organizationId: orgId,
            },
            include: {
                lease: {
                    include: {
                        tenant: true,
                        unit: {
                            include: {
                                property: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });

        return NextResponse.json(charges);
    } catch (error) {
        console.error('Error fetching finance charges:', error);
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

        if (!body.leaseId || !body.amount || !body.dueDate || !body.type) {
            return NextResponse.json({ error: 'Fehlende Pflichtfelder' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the Charge (Sollstellung)
            const charge = await tx.charge.create({
                data: {
                    organizationId: orgId,
                    leaseId: body.leaseId,
                    amount: parseFloat(body.amount),
                    dueDate: new Date(body.dueDate),
                    type: body.type, // e.g. 'RENT', 'DEPOSIT', 'MAINTENANCE'
                }
            });

            // 2. Audit Trail (GoBD / ISO 27001)
            await tx.auditLog.create({
                data: {
                    organizationId: orgId,
                    userId: session.user?.id || 'system',
                    action: 'CREATE',
                    tableName: 'Charge',
                    recordId: charge.id,
                    newData: JSON.stringify(body),
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
                }
            });

            return charge;
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        console.error('Error creating finance charge:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
