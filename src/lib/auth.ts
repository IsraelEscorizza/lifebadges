import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Instagram from "next-auth/providers/instagram";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/onboarding",
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Only request minimum necessary scopes
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
        },
      },
    }),

    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      // Minimal scopes — no access to posts or friends list
      authorization: {
        params: { scope: "email,public_profile" },
      },
    }),

    Instagram({
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
    }),

    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            passwordHash: true,
            isBanned: true,
            deletedAt: true,
          },
        });

        if (!user || !user.passwordHash) return null;
        if (user.isBanned || user.deletedAt) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }

      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
        token.picture = session.image;
      }

      return token;
    },

    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  events: {
    async createUser({ user }) {
      // Grant access to base achievement pack on sign up
      if (!user.id) return;
      const basePack = await db.achievementPack.findFirst({
        where: { isBase: true },
        include: { achievements: { select: { id: true } } },
      });
      if (!basePack) return;
      // No purchase record needed for base pack — it's free
      // Achievements are visible by default via the isBase flag
    },
  },

  // Security: never log tokens or sensitive fields
  logger: {
    error: (error) => {
      const safeError = { message: error.message, name: error.name };
      console.error("[auth]", safeError);
    },
  },
});
