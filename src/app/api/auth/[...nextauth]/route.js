import NextAuth from 'next-auth';
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
          console.log('Login attempt:', credentials.email);
          // Try admin first
          const admin = await Admin.findOne({ email: credentials.email });
          if (admin) {
            const isValid = await bcrypt.compare(credentials.password, admin.password);
            console.log('Admin found. Password valid?', isValid);
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
            console.log('Judge found. Password valid?', isValid);
            if (!isValid) throw new Error('Invalid password');
            return {
              id: judge._id.toString(),
              email: judge.email,
              name: judge.name,
              role: 'judge',
              category: judge.category,
            };
          }
          console.log('No user found for:', credentials.email);
          throw new Error('No user found with this email');
        } catch (error) {
          console.error('Authorize error:', error);
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
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
