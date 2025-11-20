'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: {
        token: session.accessToken,
      },
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: {
        token: session.accessToken,
      },
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};