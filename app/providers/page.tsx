import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { ProviderDashboard } from './ProviderDashboard';

export default async function ProvidersPage() {
    const session = await auth();

    if (!session?.user) {
        return <div className="p-8">Bitte anmelden.</div>
    }

    const orgId = (session.user as any).organizationId;

    // Fetch Providers with their active tickets and open jobs count
    const providers = await prisma.provider.findMany({
        where: { organizationId: orgId, deletedAt: null },
        include: {
            _count: {
                select: {
                    tickets: { where: { status: { not: 'CLOSED' } } },
                }
            },
            jobs: {
                where: { status: { not: 'PAID' } }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Fetch all Provider Jobs (Invoices)
    const providerJobs = await prisma.providerJob.findMany({
        where: { organizationId: orgId },
        include: { provider: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <ProviderDashboard initialProviders={providers} initialJobs={providerJobs} />
        </div>
    )
}
