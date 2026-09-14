import { useState } from "react";
import { login } from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("demo1@ivy.homes");
  const [password, setPassword] = useState("a2c8cc4418");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      onLogin();
    } catch (err) {
      setError("Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "100px auto", textAlign: "center" }}>
      <h2>Login to Ivy Homes</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          required 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
