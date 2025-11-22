import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type LocationForm = {
  country: string;
  city: string;
  postal_code: string;
  street: string;
  street_number: string;
};

type RegisterMode = "EMPLOYEE" | "COMPANY_ADMIN";

type EmployeeRegisterForm = {
  name: string;
  surname: string;
  email: string;
  password: string;
  has_drivers_licence: boolean;
  location: LocationForm; // employee home location
};

type CompanyAdminRegisterForm = EmployeeRegisterForm & {
  company: {
    name: string;
    location: LocationForm; // company main location
  };
};

const emptyLocation = (): LocationForm => ({
  country: "",
  city: "",
  postal_code: "",
  street: "",
  street_number: "",
});

export default function Register() {
  const [mode, setMode] = useState<RegisterMode>("EMPLOYEE");

  const [form, setForm] = useState<CompanyAdminRegisterForm>({
    name: "",
    surname: "",
    email: "",
    password: "",
    has_drivers_licence: false,
    location: emptyLocation(),
    company: {
      name: "",
      location: emptyLocation(),
    },
  });

  const [error, setError] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("location.")) {
      const key = name.split(".")[1] as keyof LocationForm;
      setForm((p) => ({ ...p, location: { ...p.location, [key]: value } }));
      return;
    }

    // company name
    if (name === "company.name") {
      setForm((p) => ({ ...p, company: { ...p.company, name: value } }));
      return;
    }

    // company location fields
    if (name.startsWith("company.location.")) {
      const key = name.split(".")[2] as keyof LocationForm;
      setForm((p) => ({ ...p, company: { ...p.company, location: { ...p.company.location, [key]: value } } }));
      return;
    }

    // regular fields
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value } as CompanyAdminRegisterForm));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "EMPLOYEE") {
        const payload: EmployeeRegisterForm = {
          name: form.name,
          surname: form.surname,
          email: form.email,
          password: form.password,
          has_drivers_licence: form.has_drivers_licence,
          location: form.location,
        };

        const res = await api.post("/auth/register-employee", payload);
        login(res.data);
        nav("/dashboard");
        return;
      }

      // COMPANY_ADMIN
      const payload: CompanyAdminRegisterForm = form;
      const res = await api.post("/auth/register-company", payload);
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
    <div style={{ maxWidth: 560, margin: "40px auto" }}>
      <h2>Register</h2>

      {/* Mode switch */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setMode("EMPLOYEE")}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            background: mode === "EMPLOYEE" ? "#eaeaea" : "white",
            cursor: "pointer",
          }}
        >
          Employee
        </button>

        <button
          type="button"
          onClick={() => setMode("COMPANY_ADMIN")}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            background: mode === "COMPANY_ADMIN" ? "#eaeaea" : "white",
            cursor: "pointer",
          }}
        >
          Company admin (create company)
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <h4>Account</h4>
        <input name="name" placeholder="Name" value={form.name} onChange={onChange} />
        <br />
        <input name="surname" placeholder="Surname" value={form.surname} onChange={onChange} />
        <br />
        <input name="email" placeholder="Email" value={form.email} onChange={onChange} />
        <br />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} />
        <br />

        <label>
          <input
            name="has_drivers_licence"
            type="checkbox"
            checked={form.has_drivers_licence}
            onChange={onChange}
          />
          Has driver’s licence
        </label>

        <h4>Your location</h4>
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

        {mode === "COMPANY_ADMIN" && (
          <>
            <h4>Company</h4>
            <input
              name="company.name"
              placeholder="Company name"
              value={form.company.name}
              onChange={onChange}
            />
            <br />

            <h4>Company main address (HQ)</h4>
            <input
              name="company.location.country"
              placeholder="Country"
              value={form.company.location.country}
              onChange={onChange}
            />
            <br />
            <input
              name="company.location.city"
              placeholder="City"
              value={form.company.location.city}
              onChange={onChange}
            />
            <br />
            <input
              name="company.location.postal_code"
              placeholder="Postal code"
              value={form.company.location.postal_code}
              onChange={onChange}
            />
            <br />
            <input
              name="company.location.street"
              placeholder="Street"
              value={form.company.location.street}
              onChange={onChange}
            />
            <br />
            <input
              name="company.location.street_number"
              placeholder="Street number"
              value={form.company.location.street_number}
              onChange={onChange}
            />
            <br />
          </>
        )}

        <button type="submit" style={{ marginTop: 10 }}>
          Create account
        </button>

        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>
    </div>
  );
}
