import { useEffect, useState } from "react";
import { Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import {
  CalendarDays, ChevronDown, ClipboardList, Home, LogOut, Menu, PawPrint,
  Sparkles, X,
} from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import { AppointmentsPage, PetsPage, RecordsPage } from "./components/ManagementPages";
import AssistantPage from "./components/AssistantPage";
import api, { getErrorMessage } from "./lib/api";

const navigation = [
  { path: "/", label: "Overview", icon: Home, end: true },
  { path: "/pets", label: "My pets", icon: PawPrint },
  { path: "/appointments", label: "Appointments", icon: CalendarDays },
  { path: "/records", label: "Health records", icon: ClipboardList },
  { path: "/assistant", label: "AI care assistant", icon: Sparkles, special: true },
];

function ProtectedApp() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signoutError, setSignoutError] = useState("");
  const [addPetRequest, setAddPetRequest] = useState(0);
  const navigate = useNavigate();

  useEffect(() => { setMenuOpen(false); }, [navigate]);

  async function signOut() {
    try {
      await api.post("/auth/logout");
      window.location.assign("/");
    } catch (error) {
      setSignoutError(getErrorMessage(error));
    }
  }

  if (loading) return <div className="loading-screen"><span className="loading-paw"><PawPrint size={25} /></span><span>Getting things ready...</span></div>;
  if (!user) return <AuthPage />;

  return <div className="app-shell">
    {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand"><span className="brand-mark"><PawPrint size={19} /></span><span>AV Vet</span><button className="icon-button mobile-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={19} /></button></div>
      <div className="workspace-label">PET MANAGEMENT</div>
      <nav className="main-nav" aria-label="Main navigation">
        {navigation.map(({ path, label, icon: Icon, end, special }) => <NavLink key={path} to={path} end={end} className={({ isActive }) => `nav-link ${isActive ? "nav-active" : ""} ${special ? "nav-special" : ""}`} onClick={() => setMenuOpen(false)}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{special && <span className="nav-new">AI</span>}</NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-user"><span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span><div className="user-meta"><strong>{user.name}</strong><span>Pet parent</span></div><button className="icon-button signout-icon" onClick={signOut} aria-label="Sign out"><LogOut size={17} /></button></div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={21} /></button><div className="breadcrumb"><span>My space</span><span className="breadcrumb-dot">/</span><strong>Looking after them</strong></div><div className="topbar-right"><span className="today-label">{new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span><div className="profile-wrap"><button className="profile-button" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}><span className="user-avatar small-user">{user.name.charAt(0).toUpperCase()}</span><ChevronDown size={15} /></button>{profileOpen && <div className="profile-menu"><strong>{user.name}</strong><span>{user.email}</span><button onClick={signOut}><LogOut size={15} /> Sign out</button></div>}</div></div></header>
      {signoutError && <div className="signout-error alert error-alert">{signoutError}</div>}
      <div className="route-content">
        <Routes>
          <Route path="/" element={<Dashboard user={user} onNavigate={(path) => navigate(`/${path === "overview" ? "" : path}`)} onAddPet={() => { setAddPetRequest((value) => value + 1); navigate("/pets"); }} />} />
          <Route path="/pets" element={<PetsPage onAddRequest={addPetRequest} />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <footer className="app-footer"><span>AV Vet · Pet care management</span><span>For medical concerns, contact a veterinarian.</span></footer>
    </main>
  </div>;
}

export default function App() {
  return <AuthProvider><ProtectedApp /></AuthProvider>;
}
