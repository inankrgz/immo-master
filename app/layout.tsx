import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

import { Sidebar } from '@/components/Sidebar'

export const metadata: Metadata = {
    title: 'Real Estate SaaS',
    description: 'Professional Property Management',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="de">
            <body className="bg-slate-50 text-slate-900 min-h-screen">
                <Providers>
                    <div className="flex min-h-screen">
                        <Sidebar />
                        <main className="flex-1 p-8">
                            {children}
                        </main>
                    </div>
                </Providers>
            </body>
        </html>
    )
}
