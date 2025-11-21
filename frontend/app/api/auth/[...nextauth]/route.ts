// frontend/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },

      // app/api/auth/[...nextauth]/route.ts
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    console.log('Missing credentials');
    return null;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    // Handle non-JSON responses
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

    console.log('User authenticated:', { id: data.id, email: data.email });
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/unauthorized',
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST };