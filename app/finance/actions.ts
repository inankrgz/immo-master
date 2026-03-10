'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function processCSVUpload(formData: FormData) {
    const session = await auth();
    const orgId = (session?.user as any)?.organizationId;
    if (!orgId) throw new Error('Unauthorized');

    const file = formData.get('file') as File;
    if (!file) {
        throw new Error('No file uploaded');
    }

    const text = await file.text();
    const lines = text.split('\n');

    // Basic CSV Parser (assuming semicolon separated, like typical German bank exports)
    // Expected headers roughly: Buchungstag;Wertstellung;Umsatzart;Name;IBAN;Verwendungszweck;Betrag;Waehrung
    // We will do a generic parse for demo purposes.

    let parsedCount = 0;
    const transactions = [];

    for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i].trim();
        if (!line) continue;

        // Splitting by semicolon, handling quotes is complex, doing simple split
        const columns = line.split(';').map(c => c.replace(/^"|"$/g, ''));

        // Let's assume a simplified structure for the import:
        // [0] Date (DD.MM.YYYY)
        // [1] Name / Payee
        // [2] IBAN
        // [3] Purpose / Reference
        // [4] Amount (with comma as decimal)

        if (columns.length >= 5) {
            try {
                const dateParts = columns[0].split('.');
                const dateString = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // YYYY-MM-DD
                const bookingDate = new Date(dateString);

                const amountStr = columns[4].replace('.', '').replace(',', '.'); // Convert 1.250,50 to 1250.50
                const amount = parseFloat(amountStr);

                if (!isNaN(amount)) {
                    transactions.push({
                        organizationId: orgId,
                        bookingDate: bookingDate,
                        purpose: columns[3] || columns[1] || 'CSV Import', // Fallback to Payee if no purpose
                        iban: columns[2] || 'UNKNOWN',
                        amount: amount,
                    });
                }
            } catch (e) {
                console.error("Error parsing row: ", line, e);
            }
        }
    }

    if (transactions.length > 0) {
        // GoBD: Insert only, no updates. Append-only ledger style.
        // For import, we just dump them into BankTransaction
        await prisma.$transaction(
            transactions.map(data =>
                prisma.bankTransaction.create({ data })
            )
        );
        parsedCount = transactions.length;

        // Create an audit log entry for the batch upload
        await prisma.auditLog.create({
            data: {
                organizationId: orgId,
                userId: session?.user?.id || 'system',
                action: 'IMPORT_CSV',
                tableName: 'BankTransaction',
                recordId: 'BATCH',
                newData: `Imported ${parsedCount} transactions from ${file.name}`,
                ipAddress: 'server'
            }
        });
    }

    revalidatePath('/finance');
    return { success: true, count: parsedCount };
}
