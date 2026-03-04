import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDriverAuth } from "../context/DriverAuthContext";

const DriverLayout = () => {
  const { user, logout } = useDriverAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/driver/login");
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Driver Panel</h2>
        <nav>
          <NavLink to="/driver/available">Available Orders</NavLink>
          <NavLink to="/driver/my-deliveries">My Deliveries</NavLink>
        </nav>
      </aside>
      <main className="content">
        <header className="header">
          <div>
            <p>{user?.name}</p>
            <small>{user?.email}</small>
          </div>
          <button onClick={handleLogout}>Logout</button>
        </header>
        <Outlet />
        <footer>
          <Link to="/driver/available">Driver Operations</Link>
        </footer>
      </main>
    </div>
  );
};

export default DriverLayout;
