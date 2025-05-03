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
          console.log('Authorizing with credentials:', { username: credentials.username });
          await connectDB();
          
          // Try admin first
          console.log('Checking admin credentials...');
          const admin = await Admin.findOne({ username: credentials.username }).lean();
          if (admin) {
            console.log('Admin found, checking password...');
            const isValid = await bcrypt.compare(credentials.password, admin.password);
            console.log('Admin password valid:', isValid);
            if (!isValid) return null;
            return {
              id: admin._id.toString(),
              username: admin.username,
              name: admin.name,
              role: 'admin',
            };
          }
          
          // Try judge
          console.log('Checking judge credentials...');
          const judge = await Judge.findOne({ username: credentials.username }).lean();
          console.log('Judge found:', judge ? 'Yes' : 'No');
          
          if (judge) {
            console.log('Judge password from DB (first 5 chars):', judge.password.substring(0, 5));
            console.log('Comparing passwords...');
            const isValid = await bcrypt.compare(credentials.password, judge.password);
            console.log('Judge password valid:', isValid);
            
            if (!isValid) return null;
            
            const userData = {
              id: judge._id.toString(),
              username: judge.username,
              firstName: judge.firstName || '',
              name: judge.name,
              role: 'judge',
              categories: judge.categories,
            };
            
            console.log('Returning judge user data:', userData);
            return userData;
          }
          
          console.log('No user found with username:', credentials.username);
          return null; // No user found
        } catch (error) {
          console.error('Error in authorize function:', error);
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
