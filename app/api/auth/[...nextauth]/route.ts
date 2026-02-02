import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        await connectDB();

        const admin = await Admin.findOne({ email: credentials.email });

        if (!admin) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          admin.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: admin._id.toString(),
          email: admin.email,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

