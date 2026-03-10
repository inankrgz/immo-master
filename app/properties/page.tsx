import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Database, Plus, Search, Building } from 'lucide-react';

export default async function PropertiesPage() {
    const session = await auth();

    if (!session?.user) {
        return <div className="p-8">Bitte anmelden.</div>
    }

    const orgId = (session.user as any).organizationId;

    // Fetch properties for this organization
    const properties = await prisma.property.findMany({
        where: {
            organizationId: orgId,
            deletedAt: null // Only active properties
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Immobilien</h1>
                    <p className="text-slate-500 mt-2 text-lg">Verwalten Sie Ihr Portfolio und optimieren Sie Renditen.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 px-4 py-3 rounded-xl font-medium shadow-sm flex items-center gap-2 transition-all">
                        <Database className="h-5 w-5" />
                        <span>Daten sichern</span>
                    </button>
                    {/* In a real app, this opens a modal. For now, it could be a link to a new page or open a Client Component modal */}
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                        <Plus className="h-5 w-5" />
                        <span>Objekt anlegen</span>
                    </button>
                </div>
            </header>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map(property => (
                    <Link href={`/properties/${property.id}`} key={property.id} className="block group">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform group-hover:-translate-y-1">
                            {/* Placeholder Image */}
                            <div className="h-48 bg-slate-200 relative">
                                <img src={`https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&q=80&w=800&h=600`} alt={property.name} className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm border border-white/20">
                                    {property.city}
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{property.name}</h3>
                                <p className="text-slate-500 text-sm flex items-center gap-1 mb-4">
                                    {property.street}, {property.zipCode} {property.city}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Mieteinnahmen</p>
                                        <p className="text-lg font-bold text-slate-900">-- €</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Einheiten</p>
                                        <p className="text-lg font-bold text-indigo-600">--</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}

                {properties.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Building className="h-10 w-10 mb-4 text-slate-300" />
                        <p className="font-medium text-slate-500">Keine Immobilien gefunden.</p>
                        <p className="text-sm mt-1">Legen Sie Ihr erstes Objekt an, um zu starten.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
