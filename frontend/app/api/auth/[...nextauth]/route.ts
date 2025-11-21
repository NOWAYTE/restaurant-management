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

export const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
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
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          // Ensure JSON response
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await res.text();
            console.error('Non-JSON response:', text);
            throw new Error('Invalid response from server');
          }

          const data = await res.json();

          if (!res.ok) {
            console.error('Login failed:', data);
            throw new Error(data.error || 'Login failed');
          }

          const userData: BackendUser = data.user || data;

          // Return user object with access token
          const user = {
            id: userData.id.toString(),
            email: userData.email,
            name: userData.name || userData.email.split('@')[0],
            role: userData.role || 'user',
            accessToken: userData.accessToken || '', // <--- important
          };

          return user;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // Store user info and access token in JWT
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          accessToken: user.accessToken,
        };
      }
      return token;
    },

    // Add id, role, and access token to session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/unauthorized',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
