// frontend/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

interface BackendUser {
  id: number | string;
  email: string;
  name?: string;
  role?: string;
  accessToken?: string;
}

export const authOptions = {
  providers: [
    // Existing email/password provider
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          const contentType = res.headers.get('content-type');
          if (!contentType?.includes('application/json')) {
            const text = await res.text();
            console.error('Non-JSON response:', text);
            throw new Error('Invalid response from server');
          }

          const data = await res.json();

          if (!res.ok) {
            console.error('Login failed:', data);
            throw new Error(data.error || 'Login failed');
          }

          const userData = data.user || data;
          return {
            id: userData.id.toString(),
            email: userData.email,
            name: userData.name || userData.email.split('@')[0],
            role: userData.role || 'user',
            accessToken: data.access_token || userData.accessToken,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
    // Kitchen code provider
    CredentialsProvider({
      id: 'kitchen',
      name: 'Kitchen',
      credentials: {
        code: { label: 'Kitchen Code', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.code) {
          console.log('Missing kitchen code');
          return null;
        }

        // In a real app, validate the kitchen code against your backend
        const KITCHEN_CODE = process.env.KITCHEN_CODE || 'kitchen123';
        
        if (credentials.code !== KITCHEN_CODE) {
          console.log('Invalid kitchen code');
          return null;
        }

        return {
          id: 'kitchen',
          email: 'kitchen@restaurant.com',
          name: 'Kitchen Staff',
          role: 'kitchen',
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as any;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },

  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
