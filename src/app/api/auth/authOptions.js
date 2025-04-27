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
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('Login attempt with password:', credentials.password);
          await connectDB();
          // Try admin first (case-insensitive)
          const admin = await Admin.findOne({ email: { $regex: `^${credentials.email}$`, $options: 'i' } }).lean();
          if (admin) {
            const isValid = await bcrypt.compare(credentials.password, admin.password);
            if (!isValid) return null;
            return {
              id: admin._id.toString(),
              email: admin.email,
              name: admin.name,
              role: 'admin',
            };
          }
          // Try judge (case-insensitive)
          const judge = await Judge.findOne({ email: { $regex: `^${credentials.email}$`, $options: 'i' } }).lean();
          console.log('Judge found:', judge);
          if (judge) {
            const isValid = await bcrypt.compare(credentials.password, judge.password);
            console.log('Password valid:', isValid);
            if (!isValid) return null;
            return {
              id: judge._id.toString(),
              email: judge.email,
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
