import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users, students } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            id: "admin",
            name: "Admin Login",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const targetUser = await db.query.users.findFirst({
                    where: eq(users.email, credentials.email as string)
                });

                if (!targetUser || !targetUser.password) return null;
                // Double check it's an admin role (though student role is removed from schema enum)
                if (targetUser.role !== "admin" && targetUser.role !== "superadmin") return null;

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    targetUser.password
                );

                if (!isValid) return null;

                return {
                    id: targetUser.id,
                    name: targetUser.name,
                    email: targetUser.email,
                    role: targetUser.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub as string;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
});
