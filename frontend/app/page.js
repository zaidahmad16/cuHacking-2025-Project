"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import {
  MapPin, Phone, Clock, X, Heart, RotateCcw, Info,
  Search, Bookmark, Home, SlidersHorizontal, LogOut
} from "lucide-react";

const API = "https://cuhacking-2025-project.onrender.com";

/* ===================== AUTH SCREEN ===================== */
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login" ? { email, password } : { email, password, name };
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-bg" />
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="auth-logo">
          <img src="/shelter-logo.png" alt="ShelterMatch Ottawa Logo" className="auth-logo-img" style={{ width: 64, height: 64, marginBottom: 8 }} />
          <h1>ShelterMatch</h1>
          <p>Ottawa's shelter discovery platform</p>
        </div>

        {error && (
          <motion.div className="auth-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {mode === "register" && (
              <motion.div
                key="name"
                className="form-group"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label>Full Name</label>
                <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} />
          </div>
          <motion.button
            className="btn-primary"
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
          </motion.button>
        </form>

        <div className="auth-switch">
          {mode === "login" ? (
            <>Don&apos;t have an account?{" "}<button onClick={() => { setMode("register"); setError(""); }}>Sign Up</button></>
          ) : (
            <>Already have an account?{" "}<button onClick={() => { setMode("login"); setError(""); }}>Log In</button></>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ===================== FILTER MODAL ===================== */
function FilterModal({ filters, setFilters, onClose, onApply }) {
  const [local, setLocal] = useState({ ...filters });

  const religions = ["Any", "Christian", "Catholic", "Islam", "Jewish", "Sikh", "Indigenous Spiritual Practices", "None"];
  const demographics = ["All Races", "Indigenous", "Black", "African", "Caribbean", "Middle Eastern", "South Asian", "East Asian"];
  const interestOptions = [
    "Meals", "Medical Help", "Counseling", "Mental Health", "Addiction Recovery",
    "Job Training", "Education", "Women's Services", "Youth Programs", "Childcare",
    "Cultural Support", "Cultural Healing", "Indigenous Programs", "Immigration Help",
    "Language Classes", "LGBTQ+ Support", "Harm Reduction", "Spiritual Support",
    "Halal Meals", "Kosher Meals", "Vegetarian Meals", "Drop-In"
  ];

  const toggleInterest = (interest) => {
    setLocal((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <motion.div
        className="filter-modal"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>🔍 Find the Right Shelter</h3>

        <div className="filter-section">
          <label>Gender</label>
          <select value={local.gender} onChange={(e) => setLocal({ ...local, gender: e.target.value })}>
            <option value="All">All</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Youth">Youth (16-24)</option>
          </select>
        </div>

        <div className="filter-section">
          <label>Religion / Faith</label>
          <select value={local.religion} onChange={(e) => setLocal({ ...local, religion: e.target.value })}>
            {religions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="filter-section">
          <label>Race / Background</label>
          <div className="filter-tags">
            {demographics.map((d) => (
              <motion.button
                key={d}
                className={`filter-tag ${local.demographics === d ? "selected" : ""}`}
                onClick={() => setLocal({ ...local, demographics: local.demographics === d ? "" : d })}
                whileTap={{ scale: 0.95 }}
              >
                {d}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label>Services &amp; Interests</label>
          <div className="filter-tags">
            {interestOptions.map((i) => (
              <motion.button
                key={i}
                className={`filter-tag ${local.interests.includes(i) ? "selected" : ""}`}
                onClick={() => toggleInterest(i)}
                whileTap={{ scale: 0.95 }}
              >
                {i}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn-reset" onClick={() => setLocal({ gender: "All", religion: "Any", demographics: "", interests: [] })}>
            Reset All
          </button>
          <button className="btn-apply" onClick={() => { setFilters(local); onApply(local); onClose(); }}>
            Apply Filters
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ===================== DETAIL SHEET ===================== */
function DetailSheet({ shelter, onClose }) {
  if (!shelter) return null;
  const beds = shelter.availableBeds ?? 0;
  const statusClass = beds > 10 ? "bed-green" : beds > 3 ? "bed-yellow" : "bed-red";
  const statusText = beds > 10 ? "Available" : beds > 0 ? "Limited" : "Full";

  return (
    <div className="detail-overlay" onClick={onClose}>
      <motion.div
        className="detail-sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="detail-close" onClick={onClose}>✕</button>
        <img src={shelter.image} alt={shelter.name} className="detail-image" />
        <div className="detail-body">
          <h2>{shelter.name}</h2>
          <span className={`bed-status ${statusClass}`}>● {statusText} — {beds} beds</span>
          <p style={{ marginTop: 14 }}>{shelter.description}</p>

          <div className="detail-row"><MapPin size={16} /> {shelter.location}</div>
          <div className="detail-row"><Phone size={16} /> {shelter.phone}</div>
          <div className="detail-row"><Clock size={16} /> {shelter.hours}</div>
          <div className="detail-row"><Info size={16} /> Accepts: {shelter.gender}</div>
          {shelter.religion && shelter.religion !== "None" && (
            <div className="detail-row"><span>🙏</span> {shelter.religion}</div>
          )}

          <div className="detail-tags">
            {(shelter.amenities || []).map((a) => <span key={a} className="detail-tag">{a}</span>)}
          </div>
          {shelter.interests && (
            <div className="detail-tags">
              {shelter.interests.map((i) => <span key={i} className="detail-tag">{i}</span>)}
            </div>
          )}

          <div className="detail-actions">
            <motion.button
              className="detail-btn-directions"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shelter.location)}`, "_blank")}
            >
              📍 Get Directions
            </motion.button>
            <motion.button
              className="detail-btn-call"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(`tel:${shelter.phone}`)}
            >
              📞 Call Shelter
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ===================== SWIPE CARD ===================== */
function SwipeCard({ shelter, isFront, onSwipeLeft, onSwipeRight, onTap }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-18, 18]);
  const bgLeft = useTransform(x, [-150, 0], ["rgba(244,63,94,0.15)", "rgba(244,63,94,0)"]);
  const bgRight = useTransform(x, [0, 150], ["rgba(34,197,94,0)", "rgba(34,197,94,0.15)"]);
  const saveOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [0, -100], [0, 1]);

  const beds = shelter.availableBeds ?? 0;
  const statusClass = beds > 10 ? "bed-green" : beds > 3 ? "bed-yellow" : "bed-red";
  const statusLabel = beds > 10 ? "Available" : beds > 0 ? "Limited" : "Full";

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 120) onSwipeRight();
    else if (info.offset.x < -120) onSwipeLeft();
  };

  return (
    <motion.div
      className="swipe-card"
      style={{
        x: isFront ? x : 0,
        rotate: isFront ? rotate : 0,
        zIndex: isFront ? 5 : 1,
      }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={isFront ? handleDragEnd : undefined}
      animate={{
        scale: isFront ? 1 : 0.94,
        y: isFront ? 0 : 12,
        opacity: isFront ? 1 : 0.7,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={isFront ? onTap : undefined}
    >
      <img src={shelter.image} alt={shelter.name} className="card-image" draggable={false} />

      {isFront && (
        <>
          <motion.div className="stamp stamp-save" style={{ opacity: saveOpacity }}>SAVE</motion.div>
          <motion.div className="stamp stamp-skip" style={{ opacity: skipOpacity }}>SKIP</motion.div>
        </>
      )}

      <div className="card-gradient">
        <h2 className="card-name">{shelter.name}</h2>
        <div className="card-meta">
          <MapPin size={13} strokeWidth={2.5} /> {shelter.location}
        </div>
        <div className="card-meta">
          <span className={`bed-status ${statusClass}`}>● {statusLabel} — {beds} beds</span>
        </div>
        <div className="card-tags">
          {(shelter.amenities || []).slice(0, 3).map((a) => (
            <span key={a} className="card-tag">{a}</span>
          ))}
          {shelter.religion && shelter.religion !== "None" && (
            <span className="card-tag">🙏 {shelter.religion}</span>
          )}
          {shelter.gender && shelter.gender !== "All" && (
            <span className="card-tag">👤 {shelter.gender}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ===================== SAVED TAB ===================== */
function SavedTab({ user }) {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/saved-shelters?userId=${user.id}`)
      .then((r) => r.json())
      .then(setSaved)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  const removeShelter = async (id) => {
    await fetch(`${API}/saved-shelters/${id}?userId=${user.id}`, { method: "DELETE" });
    setSaved((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="saved-list">
      {saved.length === 0 ? (
        <div className="empty-state">
          <Bookmark size={48} strokeWidth={1.5} />
          <p>No saved shelters yet.<br />Swipe right to save shelters!</p>
        </div>
      ) : (
        saved.map((s, idx) => {
          const beds = s.availableBeds ?? 0;
          const cls = beds > 10 ? "bed-green" : beds > 3 ? "bed-yellow" : "bed-red";
          return (
            <motion.div
              key={s.id}
              className="saved-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <img src={s.image} alt={s.name} />
              <div className="saved-info">
                <h4>{s.name}</h4>
                <p>{s.location}</p>
                <span className={`bed-status ${cls}`} style={{ marginTop: 4, display: "inline-flex" }}>
                  ● {beds} beds
                </span>
              </div>
              <div className="saved-actions" style={{ flexDirection: "column" }}>
                <button
                  className="saved-action-btn btn-directions"
                  title="Directions"
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.location)}`, "_blank")}
                >📍</button>
                <button className="saved-action-btn btn-call" title="Call" onClick={() => window.open(`tel:${s.phone}`)}>📞</button>
                <button className="saved-action-btn btn-remove" title="Remove" onClick={() => removeShelter(s.id)}>✕</button>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}

/* ===================== MAIN APP ===================== */
export default function HomePage() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("discover");
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ gender: "All", religion: "Any", demographics: "", interests: [] });
  const [detailShelter, setDetailShelter] = useState(null);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const fetchShelters = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.gender && f.gender !== "All") params.set("gender", f.gender);
      if (f.religion && f.religion !== "Any") params.set("religion", f.religion);
      if (f.demographics) params.set("demographics", f.demographics);
      if (f.interests.length > 0) params.set("interests", f.interests.join(","));
      const url = `${API}/shelters${params.toString() ? "?" + params.toString() : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setShelters(data);
      let count = 0;
      if (f.gender !== "All") count++;
      if (f.religion !== "Any") count++;
      if (f.demographics) count++;
      count += f.interests.length;
      setActiveFiltersCount(count);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (user) fetchShelters(filters);
  }, [user, fetchShelters]);

  const handleSwipeRight = async () => {
    const shelter = shelters[shelters.length - 1];
    if (!shelter) return;
    setShelters((prev) => prev.slice(0, prev.length - 1));
    try {
      await fetch(`${API}/swipe-right`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, shelterId: shelter.id }),
      });
    } catch (err) { console.error(err); }
  };

  const handleSwipeLeft = async () => {
    const shelter = shelters[shelters.length - 1];
    if (!shelter) return;
    setShelters((prev) => prev.slice(0, prev.length - 1));
    try {
      await fetch(`${API}/swipe-left`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, shelterId: shelter.id }),
      });
    } catch (err) { console.error(err); }
  };

  if (!user) return <AuthScreen onLogin={setUser} />;

  return (
    <div style={{ minHeight: "100dvh", background: "#0c1222", display: "flex", justifyContent: "center" }}>
      <div className="app-shell">
        {/* HEADER */}
        <div className="top-header">
          <div className="logo">
            <img src="/shelter-logo.png" alt="ShelterMatch Ottawa Logo" style={{ width: 36, height: 36, verticalAlign: 'middle', marginRight: 8 }} />
            <span style={{ fontWeight: 700, fontSize: 22, verticalAlign: 'middle' }}>ShelterMatch</span>
          </div>
          <div className="header-actions">
            <button className="header-btn" onClick={() => setShowFilters(true)} style={{ position: "relative" }}>
              <SlidersHorizontal size={18} />
              {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
            </button>
            <button className="header-btn" onClick={() => setUser(null)} title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* ACTIVE FILTER CHIPS */}
        <AnimatePresence>
          {activeFiltersCount > 0 && (
            <motion.div
              className="filter-bar"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {filters.gender !== "All" && <span className="filter-chip active">{filters.gender}</span>}
              {filters.religion !== "Any" && <span className="filter-chip active">{filters.religion}</span>}
              {filters.demographics && <span className="filter-chip active">{filters.demographics}</span>}
              {filters.interests.map((i) => <span key={i} className="filter-chip active">{i}</span>)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB CONTENT */}
        {tab === "discover" && (
          <>
            <div className="cards-viewport">
              {loading ? (
                <div className="loading-spinner"><div className="spinner" /></div>
              ) : shelters.length === 0 ? (
                <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Search size={48} strokeWidth={1.5} />
                  <p>No shelters match your filters.<br />Try adjusting your preferences.</p>
                </motion.div>
              ) : (
                shelters.map((shelter, index) => (
                  <SwipeCard
                    key={shelter.id}
                    shelter={shelter}
                    isFront={index === shelters.length - 1}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onTap={() => setDetailShelter(shelter)}
                  />
                ))
              )}
            </div>

            <div className="bottom-controls">
              <motion.button
                className="action-btn action-sm"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fetchShelters(filters)}
              >
                <RotateCcw size={18} className="icon-undo" />
              </motion.button>
              <motion.button
                className="action-btn action-lg skip-btn"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                onClick={handleSwipeLeft}
              >
                <X size={28} className="icon-skip" />
              </motion.button>
              <motion.button
                className="action-btn action-sm"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { if (shelters.length) setDetailShelter(shelters[shelters.length - 1]); }}
              >
                <Info size={18} className="icon-info" />
              </motion.button>
              <motion.button
                className="action-btn action-lg save-btn"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                onClick={handleSwipeRight}
              >
                <Heart size={28} className="icon-save" />
              </motion.button>
            </div>
          </>
        )}

        {tab === "saved" && <SavedTab user={user} />}

        {/* BOTTOM TABS */}
        <div className="bottom-tabs">
          <button className={`tab-btn ${tab === "discover" ? "active" : ""}`} onClick={() => setTab("discover")}>
            <Home size={22} /> Discover
          </button>
          <button className={`tab-btn ${tab === "saved" ? "active" : ""}`} onClick={() => setTab("saved")}>
            <Bookmark size={22} /> Saved
          </button>
        </div>

        {/* MODALS */}
        <AnimatePresence>
          {showFilters && (
            <FilterModal
              filters={filters}
              setFilters={setFilters}
              onClose={() => setShowFilters(false)}
              onApply={(f) => fetchShelters(f)}
            />
          )}
          {detailShelter && (
            <DetailSheet shelter={detailShelter} onClose={() => setDetailShelter(null)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
