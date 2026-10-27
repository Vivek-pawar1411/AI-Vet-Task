import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, ClipboardList, PawPrint, Plus, Sparkles } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

export default function Dashboard({ user, onNavigate, onAddPet }) {
  const [data, setData] = useState({ pets: [], appointments: [], prescriptions: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/pets"), api.get("/appointments"), api.get("/prescriptions")])
      .then(([pets, appointments, prescriptions]) => setData({
        pets: pets.data, appointments: appointments.data, prescriptions: prescriptions.data,
      }))
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, []);

  const upcoming = data.appointments.filter((item) => new Date(item.date) >= new Date() && item.status !== "cancelled")
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  return (
    <div className="page-content">
      {error && <div className="alert error-alert">{error}</div>}
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="eyebrow">PET CARE DASHBOARD</span>
          <h1>{greeting()}, {user.name.split(" ")[0]}</h1>
          <p>Manage your pets, appointments, and health records.</p>
          <button className="button button-primary" onClick={onAddPet}><Plus size={16} /> Add a pet</button>
        </div>
      </section>
      <section className="stat-grid">
        <Stat icon={PawPrint} label="Little companions" value={data.pets.length} tint="green" />
        <Stat icon={CalendarDays} label="Upcoming visits" value={data.appointments.filter((a) => new Date(a.date) >= new Date() && a.status !== "cancelled").length} tint="peach" />
        <Stat icon={ClipboardList} label="Health records" value={data.prescriptions.length} tint="blue" />
      </section>
      <div className="dashboard-grid">
        <section className="content-card pets-overview">
          <div className="card-heading"><div><span className="section-kicker">PETS</span><h2>Pet profiles</h2></div><button className="text-button" onClick={() => onNavigate("pets")}>View all <ArrowUpRight size={15} /></button></div>
          {data.pets.length ? <div className="mini-pet-list">{data.pets.slice(0, 3).map((pet) => <div className="mini-pet" key={pet._id}><PetAvatar pet={pet} /><div><strong>{pet.name}</strong><span>{pet.breed || pet.species}</span></div><ArrowUpRight className="mini-arrow" size={16} /></div>)}</div> : <EmptyState icon={PawPrint} title="Your crew starts here" text="Add a pet profile to keep their care details close." action="Add first pet" onClick={onAddPet} />}
        </section>
        <section className="content-card visit-card">
          <div className="card-heading"><div><span className="section-kicker">ON THE CALENDAR</span><h2>Next visit</h2></div><CalendarDays className="heading-icon" size={20} /></div>
          {upcoming ? <div className="next-visit"><div className="date-tile"><strong>{new Date(upcoming.date).toLocaleDateString(undefined, { day: "2-digit" })}</strong><span>{new Date(upcoming.date).toLocaleDateString(undefined, { month: "short" })}</span></div><div className="visit-info"><strong>{upcoming.clinicName}</strong><span>{upcoming.pet?.name || "Your pet"} · {new Date(upcoming.date).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span><span className="status-pill">{upcoming.status}</span></div></div> : <EmptyState icon={CalendarDays} title="A clear calendar" text="Book a check-up whenever your pet needs one." action="Schedule a visit" onClick={() => onNavigate("appointments")} />}
        </section>
      </div>
      <button className="ai-promo" onClick={() => onNavigate("assistant")}><span className="ai-promo-icon"><Sparkles size={21} /></span><span><strong>A question about your pet?</strong><small>Get general guidance from your AI care assistant.</small></span><ArrowUpRight size={18} /></button>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tint }) {
  return <div className="stat-card"><span className={`stat-icon ${tint}`}><Icon size={20} /></span><div><strong>{value}</strong><span>{label}</span></div></div>;
}

export function PetAvatar({ pet }) {
  const emoji = /cat/i.test(pet.species) ? "🐱" : /bird/i.test(pet.species) ? "🐦" : /rabbit/i.test(pet.species) ? "🐰" : "🐶";
  return <span className="pet-avatar">{emoji}</span>;
}

export function EmptyState({ icon: Icon, title, text, action, onClick }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={21} /></span><strong>{title}</strong><p>{text}</p>{action && <button className="text-button" onClick={onClick}>{action} <ArrowUpRight size={15} /></button>}</div>;
}
