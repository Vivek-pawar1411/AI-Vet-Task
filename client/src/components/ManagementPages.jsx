import { useEffect, useState } from "react";
import { CalendarDays, ClipboardList, Edit3, PawPrint, Plus, Stethoscope, Trash2 } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import Modal from "./Modal";
import { EmptyState, PetAvatar } from "./Dashboard";

const blankPet = { name: "", species: "Dog", breed: "", age: "", weight: "", medicalNotes: "" };
const blankAppointment = { pet: "", clinicName: "", clinicAddress: "", date: "", reason: "" };
const blankPrescription = { pet: "", medication: "", dosage: "", instructions: "", prescribedBy: "", prescribedAt: "", expiresAt: "" };
const localDateTimeValue = (date) => {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 16);
};

function useRecords(path) {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const refresh = async () => {
    try { setRecords((await api.get(path)).data); setError(""); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
  };
  useEffect(() => { refresh(); }, [path]);
  return { records, error, setError, refresh };
}

function RecordForm({ title, fields, value, onChange, onClose, onSave, busy, error }) {
  return <Modal title={title} onClose={onClose}>
    <form className="form-stack modal-form" onSubmit={onSave}>
      {fields.map((field) => <label key={field.key}>{field.label}
        {field.type === "select" ? <select required={field.required !== false} value={value[field.key] ?? ""} onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}>
          <option value="">Choose {field.label.toLowerCase()}</option>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select> : field.type === "textarea" ? <textarea required={field.required} maxLength={field.maxLength} rows="3" value={value[field.key] ?? ""} onChange={(e) => onChange({ ...value, [field.key]: e.target.value })} placeholder={field.placeholder || ""} /> :
          <input required={field.required} type={field.type || "text"} min={field.min} max={field.max} maxLength={field.maxLength} step={field.step} value={value[field.key] ?? ""} onChange={(e) => onChange({ ...value, [field.key]: e.target.value })} placeholder={field.placeholder || ""} />}
      </label>)}
      {error && <div className="alert error-alert" role="alert">{error}</div>}
      <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? "Saving..." : "Save changes"}</button></div>
    </form>
  </Modal>;
}

function PetForm({ initial, onClose, onDone }) {
  const [value, setValue] = useState(initial || blankPet);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event) {
    event.preventDefault(); setBusy(true); setError("");
    const body = { ...value, age: value.age === "" ? null : Number(value.age), weight: value.weight === "" ? null : Number(value.weight) };
    try {
      if (initial?._id) await api.patch(`/pets/${initial._id}`, body);
      else await api.post("/pets", body);
      onDone();
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  }
  return <RecordForm title={initial?._id ? `Edit ${initial.name}'s profile` : "Add a pet"} fields={[
    { key: "name", label: "Pet name", required: true, maxLength: 100, placeholder: "e.g. Maple" },
    { key: "species", label: "Species", type: "select", required: true, options: ["Dog", "Cat", "Bird", "Rabbit", "Other"].map((item) => ({ value: item, label: item })) },
    { key: "breed", label: "Breed", maxLength: 100, required: false, placeholder: "e.g. Golden retriever" },
    { key: "age", label: "Age (years)", type: "number", min: 0, max: 100, step: 0.1, required: false },
    { key: "weight", label: "Weight (kg)", type: "number", min: 0, max: 1000, step: 0.1, required: false },
    { key: "medicalNotes", label: "Medical notes", type: "textarea", maxLength: 5000, required: false, placeholder: "Allergies, ongoing conditions, or helpful care notes" },
  ]} value={value} onChange={setValue} onClose={onClose} onSave={save} busy={busy} error={error} />;
}

function AppointmentForm({ initial, pets, onClose, onDone }) {
  const [value, setValue] = useState(initial ? { ...initial, pet: initial.pet?._id || initial.pet, date: localDateTimeValue(initial.date) } : { ...blankAppointment, pet: pets[0]?._id || "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const body = { ...value, date: new Date(value.date).toISOString() };
      if (initial?._id) await api.patch(`/appointments/${initial._id}`, body);
      else await api.post("/appointments", body);
      onDone();
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  }
  return <RecordForm title={initial ? "Edit appointment" : "Schedule a visit"} fields={[
    { key: "pet", label: "Pet", type: "select", required: true, options: pets.map((pet) => ({ value: pet._id, label: pet.name })) },
    { key: "clinicName", label: "Clinic name", required: true, maxLength: 150 },
    { key: "clinicAddress", label: "Clinic address", required: false, maxLength: 300 },
    { key: "date", label: "Date and time", type: "datetime-local", required: true, min: initial ? undefined : localDateTimeValue(new Date()) },
    { key: "reason", label: "Reason for visit", type: "textarea", required: false, maxLength: 2000 },
  ]} value={value} onChange={setValue} onClose={onClose} onSave={save} busy={busy} error={error} />;
}

function PrescriptionForm({ initial, pets, onClose, onDone }) {
  const [value, setValue] = useState(initial ? { ...initial, pet: initial.pet?._id || initial.pet, prescribedAt: initial.prescribedAt ? new Date(initial.prescribedAt).toISOString().slice(0, 10) : "", expiresAt: initial.expiresAt ? new Date(initial.expiresAt).toISOString().slice(0, 10) : "" } : { ...blankPrescription, pet: pets[0]?._id || "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (initial?._id) await api.patch(`/prescriptions/${initial._id}`, value);
      else await api.post("/prescriptions", value);
      onDone();
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  }
  return <RecordForm title={initial ? "Edit health record" : "Add health record"} fields={[
    { key: "pet", label: "Pet", type: "select", required: true, options: pets.map((pet) => ({ value: pet._id, label: pet.name })) },
    { key: "medication", label: "Medication / record title", required: true, maxLength: 150 },
    { key: "dosage", label: "Dosage / summary", required: true, maxLength: 150 },
    { key: "prescribedBy", label: "Prescribed by", required: false, maxLength: 150 },
    { key: "prescribedAt", label: "Date", type: "date", required: false },
    { key: "expiresAt", label: "Expires on", type: "date", required: false },
    { key: "instructions", label: "Instructions / notes", type: "textarea", required: false, maxLength: 2000 },
  ]} value={value} onChange={setValue} onClose={onClose} onSave={save} busy={busy} error={error} />;
}

function PageHeading({ kicker, title, description, action, onAction, disabled }) {
  return <div className="page-heading"><div><span className="section-kicker">{kicker}</span><h1>{title}</h1><p>{description}</p></div><button className="button button-primary" onClick={onAction} disabled={disabled}><Plus size={16} /> {action}</button></div>;
}

export function PetsPage({ onAddRequest }) {
  const { records: pets, error, setError, refresh } = useRecords("/pets");
  const [editing, setEditing] = useState(undefined);
  async function remove(pet) {
    if (!window.confirm(`Remove ${pet.name}'s profile? Their appointment and health history will remain.`)) return;
    try { await api.delete(`/pets/${pet._id}`); refresh(); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
  }
  useEffect(() => { if (onAddRequest) setEditing({}); }, [onAddRequest]);
  return <div className="page-content">
    <PageHeading kicker="THE WHOLE CREW" title="Pet profiles" description="Every little detail that helps you give them their best life." action="Add a pet" onAction={() => setEditing({})} />
    {error && <div className="alert error-alert">{error}</div>}
    {pets.length ? <div className="pet-grid">{pets.map((pet) => <article className="pet-card content-card" key={pet._id}><div className="pet-card-top"><PetAvatar pet={pet} /><div className="record-actions"><button className="icon-button" aria-label={`Edit ${pet.name}`} onClick={() => setEditing(pet)}><Edit3 size={16} /></button><button className="icon-button danger-icon" aria-label={`Remove ${pet.name}`} onClick={() => remove(pet)}><Trash2 size={16} /></button></div></div><h2>{pet.name}</h2><p className="pet-subtitle">{pet.breed || pet.species} <span>·</span> {pet.species}</p><div className="pet-facts">{pet.age != null && <span>{pet.age} years</span>}{pet.weight != null && <span>{pet.weight} kg</span>}</div><div className="pet-notes"><strong>Care notes</strong><p>{pet.medicalNotes || "No medical notes yet."}</p></div></article>)}</div> : <div className="content-card"><EmptyState icon={PawPrint} title="No pet profiles yet" text="Add a profile to keep each pet's care and health details organized." action="Add your first pet" onClick={() => setEditing({})} /></div>}
    {editing !== undefined && <PetForm initial={editing._id ? editing : null} onClose={() => setEditing(undefined)} onDone={() => { setEditing(undefined); refresh(); }} />}
  </div>;
}

export function AppointmentsPage() {
  const { records: appointments, error, setError, refresh } = useRecords("/appointments");
  const { records: pets } = useRecords("/pets");
  const [editing, setEditing] = useState(undefined);
  async function remove(item) {
    if (!window.confirm("Delete this appointment?")) return;
    try { await api.delete(`/appointments/${item._id}`); refresh(); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
  }
  return <div className="page-content">
    <PageHeading kicker="CARE ON THE CALENDAR" title="Appointments" description="Keep upcoming check-ups and clinic visits within reach." action="Schedule a visit" onAction={() => setEditing({})} disabled={!pets.length} />
    {!pets.length && <div className="alert info-alert">Add a pet profile before scheduling an appointment.</div>}
    {error && <div className="alert error-alert">{error}</div>}
    {appointments.length ? <section className="content-card table-card"><div className="table-scroll"><table><thead><tr><th>Pet & visit</th><th>Date & time</th><th>Clinic</th><th>Status</th><th>Actions</th></tr></thead><tbody>{appointments.map((item) => <tr key={item._id}><td><strong>{item.pet?.name || "Pet"}</strong><span className="table-secondary">{item.reason || "Check-up"}</span></td><td>{new Date(item.date).toLocaleDateString()}<span className="table-secondary">{new Date(item.date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span></td><td><strong>{item.clinicName}</strong><span className="table-secondary">{item.clinicAddress || "Address not added"}</span></td><td><span className={`status-pill status-${item.status}`}>{item.status}</span></td><td><div className="record-actions"><button className="icon-button" aria-label="Edit appointment" onClick={() => setEditing(item)}><Edit3 size={16} /></button><button className="icon-button danger-icon" aria-label="Delete appointment" onClick={() => remove(item)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div></section> : <div className="content-card"><EmptyState icon={CalendarDays} title="No visits on the calendar" text="When it's time for a check-up, schedule it here." action={pets.length ? "Schedule a visit" : null} onClick={() => setEditing({})} /></div>}
    {editing !== undefined && <AppointmentForm initial={editing._id ? editing : null} pets={pets} onClose={() => setEditing(undefined)} onDone={() => { setEditing(undefined); refresh(); }} />}
  </div>;
}

export function RecordsPage() {
  const { records: prescriptions, error, setError, refresh } = useRecords("/prescriptions");
  const { records: pets } = useRecords("/pets");
  const [editing, setEditing] = useState(undefined);
  async function remove(item) {
    if (!window.confirm("Delete this health record?")) return;
    try { await api.delete(`/prescriptions/${item._id}`); refresh(); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
  }
  return <div className="page-content">
    <PageHeading kicker="THE DETAILS THAT MATTER" title="Health records" description="Prescriptions and care notes, safely kept in one place." action="Add a record" onAction={() => setEditing({})} disabled={!pets.length} />
    {!pets.length && <div className="alert info-alert">Add a pet profile before creating a health record.</div>}
    {error && <div className="alert error-alert">{error}</div>}
    {prescriptions.length ? <div className="records-grid">{prescriptions.map((item) => <article className="record-card content-card" key={item._id}><div className="record-card-heading"><span className="record-symbol"><ClipboardList size={19} /></span><span className={`status-pill ${item.expiresAt && new Date(item.expiresAt) < new Date() ? "status-cancelled" : "status-confirmed"}`}>{item.expiresAt && new Date(item.expiresAt) < new Date() ? "expired" : "on file"}</span></div><h2>{item.medication}</h2><p className="pet-subtitle">{item.pet?.name || "Pet"} · {item.dosage}</p>{item.instructions && <p className="record-instructions">{item.instructions}</p>}<div className="record-meta"><span>{item.prescribedBy ? `By ${item.prescribedBy}` : "Prescriber not listed"}</span><span>{item.prescribedAt ? new Date(item.prescribedAt).toLocaleDateString() : ""}</span></div><div className="record-actions record-card-actions"><button className="text-button" onClick={() => setEditing(item)}><Edit3 size={15} /> Edit</button><button className="icon-button danger-icon" aria-label="Delete health record" onClick={() => remove(item)}><Trash2 size={16} /></button></div></article>)}</div> : <div className="content-card"><EmptyState icon={Stethoscope} title="Your records, ready when you are" text="Add prescriptions and care notes to keep your pet's health history together." action={pets.length ? "Add a health record" : null} onClick={() => setEditing({})} /></div>}
    {editing !== undefined && <PrescriptionForm initial={editing._id ? editing : null} pets={pets} onClose={() => setEditing(undefined)} onDone={() => { setEditing(undefined); refresh(); }} />}
  </div>;
}
