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

        // Fetch actual transactions (Haben-Buchungen)
        const transactions = await prisma.bankTransaction.findMany({
            where: {
                organizationId: orgId,
            },
            include: {
                allocations: true
            },
            orderBy: {
                bookingDate: 'desc'
            }
        });

        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Error fetching bank transactions:', error);
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

        if (!body.amount || !body.bookingDate || !body.iban) {
            return NextResponse.json({ error: 'Fehlende Pflichtfelder' }, { status: 400 });
        }

        // TRANSACTION: GoBD requires immutable ledger entries.
        const result = await prisma.$transaction(async (tx) => {

            // 1. Create Transaction
            const transactionRecord = await tx.bankTransaction.create({
                data: {
                    organizationId: orgId,
                    amount: parseFloat(body.amount),
                    bookingDate: new Date(body.bookingDate),
                    purpose: body.description || null,
                    referenceId: body.referenceId || null, // Bank transaction ID
                    iban: body.iban
                }
            });

            // 2. If it pays a specific charge, update the charge status via Allocation
            if (body.chargeId) {
                const charge = await tx.charge.findUnique({ where: { id: body.chargeId } });

                if (charge) {
                    await tx.allocation.create({
                        data: {
                            chargeId: charge.id,
                            transactionId: transactionRecord.id,
                            amountAllocated: parseFloat(body.amount)
                        }
                    });
                }
            }

            // 3. Audit Log
            await tx.auditLog.create({
                data: {
                    organizationId: orgId,
                    userId: session.user?.id || 'system',
                    action: 'CREATE',
                    tableName: 'BankTransaction',
                    recordId: transactionRecord.id,
                    newData: JSON.stringify({ ...body, chargeUpdated: !!body.chargeId }),
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
                }
            });

            return transactionRecord;
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        console.error('Error creating bank transaction:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
