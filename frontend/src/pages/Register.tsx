import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type RegisterForm = {
  name: string;
  surname: string;
  email: string;
  password: string;
  has_drivers_licence: boolean;
  location: {
    country: string;
    city: string;
    postal_code: string;
    street: string;
    street_number: string;
  };
};

export default function Register() {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    surname: "",
    email: "",
    password: "",
    has_drivers_licence: false,
    location: {
      country: "",
      city: "",
      postal_code: "",
      street: "",
      street_number: "",
    },
  });

  const [error, setError] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("location.")) {
      const key = name.split(".")[1] as keyof RegisterForm["location"];
      setForm((p) => ({ ...p, location: { ...p.location, [key]: value } }));
    } else {
      setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value } as RegisterForm));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/register", form);
      login(res.data);
      nav("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Register failed");
      } else {
        setError("Register failed");
      }
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto" }}>
      <h2>Register (Employee for now)</h2>
      <form onSubmit={onSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={onChange} />
        <br />
        <input name="surname" placeholder="Surname" value={form.surname} onChange={onChange} />
        <br />
        <input name="email" placeholder="Email" value={form.email} onChange={onChange} />
        <br />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} />
        <br />

        <label>
          <input name="has_drivers_licence" type="checkbox" checked={form.has_drivers_licence} onChange={onChange} />
          Has driver’s licence
        </label>

        <h4>Location</h4>
        <input name="location.country" placeholder="Country" value={form.location.country} onChange={onChange} />
        <br />
        <input name="location.city" placeholder="City" value={form.location.city} onChange={onChange} />
        <br />
        <input
          name="location.postal_code"
          placeholder="Postal code"
          value={form.location.postal_code}
          onChange={onChange}
        />
        <br />
        <input name="location.street" placeholder="Street" value={form.location.street} onChange={onChange} />
        <br />
        <input
          name="location.street_number"
          placeholder="Street number"
          value={form.location.street_number}
          onChange={onChange}
        />
        <br />

        <button type="submit">Create account</button>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>
    </div>
  );
}
