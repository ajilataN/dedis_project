import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          🚍 TransportHub
        </Link>

        <div className="d-flex align-items-center gap-3">
          {user && (
            <>
              <span className="text-light small">
                {user.name} {user.surname}
              </span>
              <button className="btn btn-sm btn-outline-light" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
