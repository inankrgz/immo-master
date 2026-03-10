import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit3, Trash2, Home, MapPin } from 'lucide-react';

export default async function PropertyDetailsPage({ params }: { params: { id: string } }) {
    const session = await auth();

    if (!session?.user) {
        return <div className="p-8">Bitte anmelden.</div>
    }

    const orgId = (session.user as any).organizationId;

    // Fetch single property securely
    const property = await prisma.property.findFirst({
        where: {
            id: params.id,
            organizationId: orgId, // CRITICAL: RLS enforces this via NextAuth
            deletedAt: null
        },
        include: {
            units: true, // Fetch related units
        }
    });

    if (!property) {
        notFound();
    }

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header / Breadcrumbs */}
            <div className="mb-6 flex items-center justify-between">
                <Link href="/properties" className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 font-medium transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
                </Link>
                <div className="flex gap-2">
                    <button className="bg-white border border-slate-200 text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm" title="Bearbeiten">
                        <Edit3 className="h-5 w-5" />
                    </button>
                    <button className="bg-white border border-red-100 text-red-600 p-2.5 rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm" title="Löschen">
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Title Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border border-indigo-200">
                            {property.city}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                            <Home className="h-4 w-4" /> {property.units.length} Einheiten
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">{property.name}</h1>
                    <p className="text-slate-500 text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-slate-400" />
                        {property.street}, {property.zipCode} {property.city}
                    </p>
                </div>
            </div>

            {/* Units List */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Home className="h-6 w-6 text-indigo-500" />
                    Zuordnungen & Einheiten
                </h2>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Einheit</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Typ</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fläche</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {property.units.map(unit => (
                                <tr key={unit.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{unit.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{unit.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {unit.sizeSqm ? `${unit.sizeSqm.toString()} m²` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                            Aktiv
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {property.units.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                                        <p>Keine Einheiten angelegt.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
