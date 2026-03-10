import { LucideIcon, Building2, Users, Wallet, LogIn } from 'lucide-react';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getCachedOrFetch } from '@/lib/cache';

export default async function Home() {
    const session = await auth();

    if (!session?.user) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh]">
                <h1 className="text-3xl font-bold mb-4">Willkommen bei ImmoMaster V3</h1>
                <p className="text-slate-500 mb-8 text-center max-w-md">Die Multi-Tenant, ISO 27001 zertifizierbare SaaS-Lösung für Immobilienverwaltungen.</p>
                <Link href="/api/auth/signin" className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center font-medium hover:bg-slate-800 transition-colors">
                    <LogIn className="mr-2 h-5 w-5" />
                    Anmelden (Demo)
                </Link>
            </div>
        )
    }

    const orgId = (session.user as any).organizationId;

    // Fetch real stats from DB with Redis Caching (isolated by Tenant ID = orgId)
    const propertyCount = await getCachedOrFetch(
        `org:${orgId}:stats:propertyCount`,
        () => prisma.property.count({ where: { organizationId: orgId, deletedAt: null } }),
        300 // Cache for 5 minutes
    );

    const tenantCount = await getCachedOrFetch(
        `org:${orgId}:stats:tenantCount`,
        () => prisma.tenant.count({ where: { organizationId: orgId, deletedAt: null } }),
        300
    );

    // In a real scenario we'd query the Charge/Transaction ledger for this
    const mockCashflow = "+ 4.250 €"

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="text-sm text-slate-500">Angemeldet als: <span className="font-medium text-slate-800">{session.user.email}</span></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Objekte" value={propertyCount.toString()} icon={Building2} />
                <Card title="Mieter" value={tenantCount.toString()} icon={Users} />
                <Card title="Cashflow" value={mockCashflow} icon={Wallet} trend="up" />
            </div>

            <div className="mt-12 bg-white p-8 rounded-xl border border-slate-200 text-center">
                <h2 className="text-lg font-medium text-slate-900">SaaS Backend V3.1 ist aktiv 🚀</h2>
                <p className="text-slate-500 mt-2">Prisma ORM, PostgreSQL und NextAuth sind erfolgreich verbunden. Mandant: {orgId}</p>
            </div>
        </div>
    );
}

function Card({ title, value, icon: Icon, trend }: { title: string, value: string, icon: any, trend?: 'up' | 'down' }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-slate-500">{title}</div>
                <Icon className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{value}</div>
            {trend === 'up' && <div className="text-xs text-emerald-600 mt-2">▲ Gut</div>}
        </div>
    )
}
