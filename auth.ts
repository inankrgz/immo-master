import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from 'next/headers';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // Find user
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                // For demo purposes: if no user exists, we return a mock object
                // In reality, we'd check password via bcrypt:
                // const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash)

                if (user) {
                    return { id: user.id, email: user.email, organizationId: user.organizationId, role: user.role };
                } else {
                    // DEMO FALLBACK: Allow login as the first available User/Org if they exist
                    const org = await prisma.organization.findFirst();
                    if (org) {
                        return { id: "demo-user", email: credentials.email as string, organizationId: org.id, role: "ADMIN" };
                    }
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.organizationId = (user as any).organizationId;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                // Impersonation Logic for Super Admins
                const cookieStore = cookies();
                const impersonatedOrgId = cookieStore.get('impersonatedOrgId')?.value;

                if (impersonatedOrgId && (token.role === 'OWNER' || token.role === 'ADMIN')) {
                    (session.user as any).organizationId = impersonatedOrgId;
                    (session.user as any).isImpersonating = true;
                } else {
                    (session.user as any).organizationId = token.organizationId;
                    (session.user as any).isImpersonating = false;
                }

                (session.user as any).role = token.role;
                (session.user as any).originalOrgId = token.organizationId; // Keep track of the real org
            }
            return session;
        }
    },
    session: { strategy: "jwt" }
});
