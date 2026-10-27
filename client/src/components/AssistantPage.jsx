import { useEffect, useState } from "react";
import { AlertTriangle, Bot, RefreshCw, Send, Sparkles } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";

export default function AssistantPage() {
  const [pets, setPets] = useState([]);
  const [provider, setProvider] = useState("openrouter");
  const [models, setModels] = useState({ openrouter: [], nvidia: [] });
  const [model, setModel] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [selectedPet, setSelectedPet] = useState("");
  const [advice, setAdvice] = useState("");
  const [modelError, setModelError] = useState("");
  const [error, setError] = useState("");
  const [loadingModels, setLoadingModels] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/pets").then(({ data }) => setPets(data)).catch((requestError) => setError(getErrorMessage(requestError)));
  }, []);

  useEffect(() => {
    refreshModels();
  }, [provider]);

  const currentModels = models[provider];
  const selected = pets.find((pet) => pet._id === selectedPet);

  async function refreshModels() {
    setLoadingModels(true);
    setModelError("");
    setModel("");
    try {
      const { data } = await api.get(`/ai/models/${provider}`);
      if (!Array.isArray(data.models) || !data.models.length) {
        throw new Error("No suitable models are currently listed by this provider. Try refreshing later.");
      }
      setModels((previous) => ({ ...previous, [provider]: data.models }));
      setModel(data.models[0].id);
    } catch (requestError) {
      setModels((previous) => ({ ...previous, [provider]: [] }));
      setModelError(getErrorMessage(requestError));
    } finally {
      setLoadingModels(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setAdvice("");
    try {
      const { data } = await api.post("/ai/chat", {
        provider, model, symptoms,
        pet: selected ? {
          name: selected.name, species: selected.species, breed: selected.breed,
          age: selected.age, weight: selected.weight, medicalNotes: selected.medicalNotes,
        } : undefined,
      });
      setAdvice(data.advice || "The selected model did not return a response. Try another model.");
    } catch (requestError) {
      const status = requestError.response?.status;
      if (status === 502 && /could not find|no longer serves/i.test(getErrorMessage(requestError))) {
        setModels((previous) => ({
          ...previous,
          [provider]: previous[provider].filter((item) => item.id !== model),
        }));
        setModel((previous) => previous === model
          ? models[provider].find((item) => item.id !== model)?.id || ""
          : previous);
        setError("That model is no longer available. It was removed from the list; choose another model or refresh the list.");
      } else {
        setError(getErrorMessage(requestError));
      }
    } finally {
      setBusy(false);
    }
  }

  return <div className="page-content assistant-page">
    <div className="page-heading"><div><span className="section-kicker">A HELPFUL FIRST STEP</span><h1>AI care assistant</h1><p>Share what you've noticed and get general, thoughtful guidance.</p></div><span className="assistant-badge"><Sparkles size={16} /> AI powered</span></div>
    <div className="assistant-layout">
      <section className="assistant-main">
        <div className="assistant-intro"><span className="assistant-orb"><Bot size={25} /></span><div><h2>Let's check in on your pet</h2><p>Every pet is different. A little context helps make general guidance more useful.</p></div></div>
        <form className="assistant-form" onSubmit={submit}>
          <label>Choose a pet <span className="optional-label">optional</span><select value={selectedPet} onChange={(e) => setSelectedPet(e.target.value)}><option value="">General question</option>{pets.map((pet) => <option key={pet._id} value={pet._id}>{pet.name} · {pet.species}</option>)}</select></label>
          <div className="provider-grid">
            <label>AI provider<select value={provider} onChange={(e) => {
              const next = e.target.value;
              setProvider(next);
              setModel(models[next][0]?.id || "");
              setModelError("");
            }}><option value="openrouter">OpenRouter</option><option value="nvidia">NVIDIA NIM</option></select></label>
            <label>Model<div className="model-select"><select value={model} onChange={(e) => setModel(e.target.value)} disabled={!currentModels.length}><option value="">{currentModels.length ? "Choose a model" : "Refresh to load models"}</option>{currentModels.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button type="button" className="icon-button refresh-button" onClick={refreshModels} disabled={loadingModels} aria-label="Refresh available models" title="Refresh models"><RefreshCw size={17} className={loadingModels ? "spin" : ""} /></button></div></label>
          </div>
          <div className="alert info-alert model-notice">Only up to two catalog-listed models are shown. OpenRouter models are filtered to free options. Availability can change at the provider.</div>
          {modelError && <div className="alert error-alert model-notice" role="alert">{modelError}</div>}
          <label>What have you noticed?<textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows="6" required maxLength="5000" placeholder="Describe symptoms, when they started, and anything that might help. For example: “Maple has been scratching one ear since yesterday...”" /><span className="character-count">{symptoms.length}/5000</span></label>
          {error && <div className="alert error-alert" role="alert">{error}</div>}
          <button className="button button-primary ask-button" disabled={busy || !model}>{busy ? <><span className="button-spinner" /> Thinking...</> : <><Send size={16} /> Ask for guidance</>}</button>
        </form>
        {advice && <section className="advice-card"><div className="advice-heading"><span className="assistant-orb small-orb"><Sparkles size={18} /></span><div><strong>Some things to consider</strong><span>General guidance · {model}</span></div></div><div className="advice-copy">{advice}</div></section>}
      </section>
      <aside className="assistant-aside">
        <div className="safety-card"><span className="safety-icon"><AlertTriangle size={19} /></span><h3>A gentle reminder</h3><p>This assistant can share general information, but it can't diagnose or replace care from a licensed veterinarian.</p><p>If your pet is struggling to breathe, collapsing, having seizures, or may have swallowed something toxic, contact an emergency veterinarian right away.</p></div>
        <div className="privacy-card"><strong>Your privacy matters</strong><p>Provider API keys stay on our server. Your question and selected pet details are sent to the AI provider to generate a response.</p></div>
      </aside>
    </div>
  </div>;
}
