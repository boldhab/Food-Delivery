import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDriverAuth } from "../context/DriverAuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useDriverAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Login successful");
      navigate("/driver/available");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Login failed");
    }
  };

  return (
    <div className="centered">
      <form className="card" onSubmit={handleSubmit}>
        <h1>Driver Login</h1>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
