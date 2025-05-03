// Shared authOptions for NextAuth
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/app/lib/db';
import Judge from '@/app/lib/models/judge';
import Admin from '@/app/lib/models/admin';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await connectDB();
          // Try admin first
          const admin = await Admin.findOne({ username: credentials.username }).lean();
          if (admin) {
            const isValid = await bcrypt.compare(credentials.password, admin.password);
            if (!isValid) return null;
            return {
              id: admin._id.toString(),
              username: admin.username,
              name: admin.name,
              role: 'admin',
            };
          }
          // Try judge
          const judge = await Judge.findOne({ username: credentials.username }).lean();
          if (judge) {
            const isValid = await bcrypt.compare(credentials.password, judge.password);
            if (!isValid) return null;
            return {
              id: judge._id.toString(),
              username: judge.username,
              name: judge.name,
              role: 'judge',
              categories: judge.categories,
            };
          }
          return null; // No user found
        } catch (error) {
          console.error(error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        if (user.role === 'judge') {
          token.categories = user.categories;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        if (token.role === 'judge') {
          session.user.categories = token.categories;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
