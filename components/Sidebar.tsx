import { LucideIcon, Building2, LayoutDashboard, Building, Users, FileText, HardHat, Wallet, Sparkles, FolderOpen, FileUp, Database, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';

export async function Sidebar() {
    const session = await auth();
    const role = session?.user ? (session.user as any).role : null;
    const isSuperAdmin = role === 'OWNER' || role === 'ADMIN';

    return (
        <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20 transition-all duration-300">
            <div className="h-20 flex items-center px-8 border-b border-slate-800/50">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-500 rounded-lg p-1.5 shadow-lg shadow-indigo-500/30">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Estate<span className="text-indigo-400">Manager</span></span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-2">
                <NavItem href="/" icon={LayoutDashboard} label="Übersicht" />
                <NavItem href="/properties" icon={Building} label="Immobilien" active />
                <NavItem href="/tenants" icon={Users} label="Mieter" />
                <NavItem href="/requests" icon={FileText} label="Anfragen" />
                <NavItem href="/providers" icon={HardHat} label="Dienstleister" />

                <NavItem href="/finance" icon={Wallet} label="Finanzen" colorClass="text-emerald-500/80 group-hover:text-emerald-400" className="mt-6" />
                <NavItem href="/chatbot" icon={Sparkles} label="KI Assistent" colorClass="text-purple-500/80 group-hover:text-purple-400" />
                <NavItem href="/documents" icon={FolderOpen} label="Dokumente" colorClass="text-indigo-500/80 group-hover:text-indigo-400" />
                <NavItem href="/import" icon={FileUp} label="KI Import" colorClass="text-indigo-500/80 group-hover:text-indigo-400" />

                {isSuperAdmin && (
                    <div className="pt-6 mt-6 border-t border-slate-800/50">
                        <div className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">SaaS Verwaltung</div>
                        <NavItem href="/admin/organizations" icon={Database} label="Mandanten" colorClass="text-amber-500/80 group-hover:text-amber-400" />
                    </div>
                )}
            </nav>

            <div className="p-4 border-t border-slate-800/50">
                {(session?.user as any)?.isImpersonating && (
                    <form action="/api/admin/impersonate/stop" method="POST" className="mb-4">
                        <button type="submit" className="w-full flex justify-center items-center py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold rounded-lg border border-red-500/20 transition-all">
                            Admin-Modus Beenden
                        </button>
                    </form>
                )}
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <img src={`https://ui-avatars.com/api/?name=${session?.user?.email || 'User'}&background=6366f1&color=fff`} className="h-8 w-8 rounded-lg" alt="Avatar" />
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white justify-self-start truncate">{session?.user?.email?.split('@')[0] || 'Admin User'}</p>
                        <p className="text-xs text-slate-500 justify-self-start truncate">
                            {isSuperAdmin ? <span className="text-amber-400">Super-Admin</span> : 'Mandant'}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function NavItem({ href, icon: Icon, label, active, colorClass, className = "" }: { href: string, icon: any, label: string, active?: boolean, colorClass?: string, className?: string }) {
    if (active) {
        return (
            <Link href={href} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-glow ${className}`}>
                <Icon className={`h-5 w-5 ${colorClass || ''}`} /> {label}
            </Link>
        )
    }

    return (
        <Link href={href} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-all group ${className}`}>
            <Icon className={`h-5 w-5 group-hover:text-indigo-400 transition-colors ${colorClass || ''}`} /> {label}
        </Link>
    )
}
