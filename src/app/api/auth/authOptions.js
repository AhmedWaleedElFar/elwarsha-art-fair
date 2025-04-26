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
          await connectDB();
          // Try admin first
          const admin = await Admin.findOne({ email: credentials.email });
          if (admin) {
            const isValid = await bcrypt.compare(credentials.password, admin.password);
            if (!isValid) throw new Error('Invalid password');
            return {
              id: admin._id.toString(),
              email: admin.email,
              name: admin.name,
              role: 'admin',
            };
          }
          // Try judge
          const judge = await Judge.findOne({ email: credentials.email });
          if (judge) {
            const isValid = await bcrypt.compare(credentials.password, judge.password);
            if (!isValid) throw new Error('Invalid password');
            return {
              id: judge._id.toString(),
              email: judge.email,
              name: judge.name,
              role: 'judge',
              category: judge.category,
            };
          }
          throw new Error('No user found with this email');
        } catch (error) {
          throw new Error(error.message);
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
          token.category = user.category;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        if (token.role === 'judge') {
          session.user.category = token.category;
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
