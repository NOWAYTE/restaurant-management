"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface Reservation {
  id: number;
  name: string;
  phone: string;
  party_size: number;
  date: string;
  time: string;
}

interface FormState {
  name: string;
  phone: string;
  party_size: string | number;
  date: string;
  time: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    party_size: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/reservations")
      .then((res) => setReservations(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await axios.post("http://localhost:5000/api/reservations", {
      ...form,
      party_size: Number(form.party_size),
    });

    window.location.reload();
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Reservations</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded"
      >
        <input className="border p-2"
          name="name" placeholder="Name" required onChange={handleChange} />

        <input className="border p-2"
          name="phone" placeholder="Phone" required onChange={handleChange} />

        <input className="border p-2"
          name="party_size" placeholder="Party Size" required type="number" onChange={handleChange} />

        <input className="border p-2"
          name="date" type="date" required onChange={handleChange} />

        <input className="border p-2"
          name="time" type="time" required onChange={handleChange} />

        <button className="col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Book
        </button>
      </form>

      <div className="mt-8 space-y-3">
        {reservations.map((r) => (
          <div
            key={r.id}
            className="border p-3 rounded shadow-sm bg-white flex justify-between"
          >
            <span>
              {r.name} — {r.date} at {r.time}
            </span>
            <span>Party: {r.party_size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

