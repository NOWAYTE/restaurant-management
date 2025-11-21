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

    // Extract user data from the response
    const userData = data.user || data;
    
    console.log('Login response data:', {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      fullResponse: data
    });

    // Return the user object in the expected format
    const user = {
      id: userData.id.toString(),
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      role: userData.role || 'user',
    };

    console.log('Returning user:', user);
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        console.log('JWT initial sign in - user:', user);
        return {
          ...token,
          id: user.id,
          role: user.role || 'user',
        };
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback - token:', token);
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        console.log('Session updated with user data:', { 
          id: session.user.id, 
          role: session.user.role 
        });
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };