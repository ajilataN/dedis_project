import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
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
  location: LocationForm;
};

type CompanyAdminRegisterForm = EmployeeRegisterForm & {
  company: {
    name: string;
    location: LocationForm;
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

    if (name === "company.name") {
      setForm((p) => ({ ...p, company: { ...p.company, name: value } }));
      return;
    }

    if (name.startsWith("company.location.")) {
      const key = name.split(".")[2] as keyof LocationForm;
      setForm((p) => ({
        ...p,
        company: { ...p.company, location: { ...p.company.location, [key]: value } },
      }));
      return;
    }

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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h4 mb-0">Create account</h2>
                <Link to="/login" className="text-decoration-none">
                  Back to login
                </Link>
              </div>

              {/* Mode switch */}
              <ul className="nav nav-pills mb-4">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${mode === "EMPLOYEE" ? "active" : ""}`}
                    onClick={() => setMode("EMPLOYEE")}
                  >
                    Employee
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${mode === "COMPANY_ADMIN" ? "active" : ""}`}
                    onClick={() => setMode("COMPANY_ADMIN")}
                  >
                    Company admin (create company)
                  </button>
                </li>
              </ul>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <h5 className="mb-2">Account</h5>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Name</label>
                      <input className="form-control" name="name" value={form.name} onChange={onChange} required />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Surname</label>
                      <input className="form-control" name="surname" value={form.surname} onChange={onChange} required />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        className="form-control"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        required
                        autoComplete="email"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Password</label>
                      <input
                        className="form-control"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={onChange}
                        required
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          id="hasDrivers"
                          name="has_drivers_licence"
                          type="checkbox"
                          checked={form.has_drivers_licence}
                          onChange={onChange}
                        />
                        <label className="form-check-label" htmlFor="hasDrivers">
                          Has driver’s licence
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="mb-3">
                  <h5 className="mb-2">Your location</h5>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Country</label>
                      <input
                        className="form-control"
                        name="location.country"
                        value={form.location.country}
                        onChange={onChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">City</label>
                      <input
                        className="form-control"
                        name="location.city"
                        value={form.location.city}
                        onChange={onChange}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Postal code</label>
                      <input
                        className="form-control"
                        name="location.postal_code"
                        value={form.location.postal_code}
                        onChange={onChange}
                        required
                      />
                    </div>

                    <div className="col-md-5">
                      <label className="form-label">Street</label>
                      <input
                        className="form-control"
                        name="location.street"
                        value={form.location.street}
                        onChange={onChange}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Street no.</label>
                      <input
                        className="form-control"
                        name="location.street_number"
                        value={form.location.street_number}
                        onChange={onChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {mode === "COMPANY_ADMIN" && (
                  <>
                    <hr className="my-4" />

                    <div className="mb-3">
                      <h5 className="mb-2">Company</h5>

                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label">Company name</label>
                          <input
                            className="form-control"
                            name="company.name"
                            value={form.company.name}
                            onChange={onChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <h6 className="mb-2">Company main address (HQ)</h6>

                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">Country</label>
                            <input
                              className="form-control"
                              name="company.location.country"
                              value={form.company.location.country}
                              onChange={onChange}
                              required
                            />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">City</label>
                            <input
                              className="form-control"
                              name="company.location.city"
                              value={form.company.location.city}
                              onChange={onChange}
                              required
                            />
                          </div>

                          <div className="col-md-4">
                            <label className="form-label">Postal code</label>
                            <input
                              className="form-control"
                              name="company.location.postal_code"
                              value={form.company.location.postal_code}
                              onChange={onChange}
                              required
                            />
                          </div>

                          <div className="col-md-5">
                            <label className="form-label">Street</label>
                            <input
                              className="form-control"
                              name="company.location.street"
                              value={form.company.location.street}
                              onChange={onChange}
                              required
                            />
                          </div>

                          <div className="col-md-3">
                            <label className="form-label">Street no.</label>
                            <input
                              className="form-control"
                              name="company.location.street_number"
                              value={form.company.location.street_number}
                              onChange={onChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <button className="btn btn-primary w-100 mt-2" type="submit">
                  Create account
                </button>

                <p className="text-center text-muted mt-3 mb-0">
                  Already have an account? <Link to="/login">Login</Link>
                </p>
              </form>
            </div>
          </div>

          <p className="text-center text-muted small mt-3 mb-0">
            Employee Transport Platform
          </p>
        </div>
      </div>
    </div>
  );
}
