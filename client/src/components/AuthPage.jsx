import { useState } from "react";
import { Heart, PawPrint, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/api";

export default function AuthPage() {
  const { signIn, authError } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(form, mode);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="brand light-brand"><span className="brand-mark"><PawPrint size={21} /></span> AV Vet</div>
        <div className="story-copy">
          <div className="eyebrow light-eyebrow"><Heart size={14} /> PET CARE MANAGEMENT</div>
          <h1>Pet care<br />made <em>simple.</em></h1>
          <p>Manage pet profiles, appointments, health records, and AI-assisted guidance in one place.</p>
        </div>
        <div className="story-footer"><ShieldCheck size={17} /> Your pet's information stays private and secure.</div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <div className="mobile-brand brand"><span className="brand-mark"><PawPrint size={19} /></span> AV Vet</div>
          <span className="section-kicker">WELCOME TO PAWLY</span>
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="auth-subtitle">{mode === "login" ? "Your pet's care journey is right where you left it." : "A happier, healthier routine starts here."}</p>
          {authError && <div className="alert error-alert" role="alert">{authError}</div>}
          <form onSubmit={submit} className="form-stack">
            {mode === "signup" && <label>Your name<input autoComplete="name" required maxLength="100" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jamie Parker" /></label>}
            <label>Email address<input type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
            <label>Password<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" /></label>
            {error && <div className="alert error-alert" role="alert">{error}</div>}
            <button className="button button-primary auth-submit" disabled={busy}>{busy ? "One moment..." : mode === "login" ? "Sign in to your account" : "Create your account"}</button>
          </form>
          <p className="auth-switch">{mode === "login" ? "New to AV Vet?" : "Already have an account?"}{" "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
          <div className="auth-note"><ShieldCheck size={16} /> Private by design. Your data is never sold.</div>
        </div>
      </section>
    </main>
  );
}
