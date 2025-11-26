// frontend/app/admin/reservations/page.tsx
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

interface Reservation {
    id: number;
    name: string;
    phone: string;
    party_size: number;
    date: string;
    time: string;
    created_at: string;
}

export default function AdminReservations() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/reservations");
                if (!response.ok) throw new Error("Failed to fetch reservations");
                const data = await response.json();
                setReservations(data);
            } catch (err) {
                setError("Error loading reservations");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, []);

    if (loading) {
        return <div className="p-4">Loading reservations...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Upcoming Reservations</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 border">Name</th>
                            <th className="py-2 px-4 border">Phone</th>
                            <th className="py-2 px-4 border">Party Size</th>
                            <th className="py-2 px-4 border">Date</th>
                            <th className="py-2 px-4 border">Time</th>
                            <th className="py-2 px-4 border">Booked On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.length > 0 ? (
                            reservations.map((reservation) => (
                                <tr key={reservation.id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border">{reservation.name}</td>
                                    <td className="py-2 px-4 border">{reservation.phone}</td>
                                    <td className="py-2 px-4 border text-center">{reservation.party_size}</td>
                                    <td className="py-2 px-4 border">{new Date(reservation.date).toLocaleDateString()}</td>
                                    <td className="py-2 px-4 border">{reservation.time}</td>
                                    <td className="py-2 px-4 border">
                                        {new Date(reservation.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-4 text-center text-gray-500">
                                    No reservations found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}