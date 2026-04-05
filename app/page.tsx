"use client";

/**
 * MindBridge — Conversion-Optimised Landing Page
 *
 * Drop this file in as `app/page.tsx` (remove the default export rename below).
 * Norwegian copy, dark theme, electric-indigo accents, PWA install CTA.
 *
 * No external dependencies beyond React — uses inline styles + a <style> block.
 * Tailwind classes are NOT used so this file is portable before Tailwind is confirmed.
 *
 * PWA install prompt: relies on the browser `beforeinstallprompt` event.
 *   — if not available (iOS / already installed / desktop Chrome with no manifest)
 *     the button falls back to a friendly "Åpne i nettleser" scroll anchor.
 */

import React, { useEffect, useRef, useState } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:          "#0B0D14",
  surface:     "#12151F",
  surfaceHi:   "#181C2A",
  border:      "#1E2336",
  accent:      "#6366F1",   // indigo-500
  accentHover: "#4F52E0",
  accentGlow:  "rgba(99,102,241,0.25)",
  violet:      "#8B5CF6",
  textPrimary: "#F1F2F8",
  textSecondary:"#9499B8",
  textMuted:   "#5A5F7A",
  success:     "#22C55E",
  white:       "#FFFFFF",
};

// ─── Global styles injected once ─────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: ${C.bg};
    color: ${C.textPrimary};
    -webkit-font-smoothing: antialiased;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 ${C.accentGlow}; }
    50%       { box-shadow: 0 0 0 16px transparent; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes gradient-shift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .anim-fade-up  { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-fade-in  { animation: fadeIn 0.5s ease both; }
  .anim-float    { animation: float 4s ease-in-out infinite; }
  .anim-delay-1  { animation-delay: 0.1s; }
  .anim-delay-2  { animation-delay: 0.2s; }
  .anim-delay-3  { animation-delay: 0.3s; }
  .anim-delay-4  { animation-delay: 0.4s; }
  .anim-delay-5  { animation-delay: 0.5s; }

  /* Gradient text */
  .gradient-text {
    background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradient-shift 4s ease infinite;
  }

  /* Responsive grid helpers */
  .grid-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
  }
  .grid-pricing {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }
  .grid-proof {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  /* Section divider glow line */
  .divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, ${C.border} 20%, ${C.border} 80%, transparent 100%);
  }

  /* Nav */
  .nav-link {
    color: ${C.textSecondary};
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
  }
  .nav-link:hover { color: ${C.textPrimary}; }

  /* Button base */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
    border-radius: 10px;
    transition: all 0.2s;
    text-decoration: none;
    white-space: nowrap;
  }
  .btn-primary {
    background: ${C.accent};
    color: #fff;
    padding: 14px 28px;
    font-size: 15px;
    animation: pulse-glow 2.5s ease-in-out infinite;
  }
  .btn-primary:hover {
    background: ${C.accentHover};
    transform: translateY(-1px);
    box-shadow: 0 8px 24px ${C.accentGlow};
  }
  .btn-secondary {
    background: transparent;
    color: ${C.textSecondary};
    padding: 14px 28px;
    font-size: 15px;
    border: 1px solid ${C.border};
  }
  .btn-secondary:hover {
    border-color: ${C.accent};
    color: ${C.textPrimary};
    background: rgba(99,102,241,0.06);
  }
  .btn-outline {
    background: transparent;
    color: ${C.accent};
    padding: 12px 24px;
    font-size: 14px;
    border: 1px solid ${C.accent};
  }
  .btn-outline:hover {
    background: ${C.accent};
    color: #fff;
  }
  .btn-ghost {
    background: rgba(255,255,255,0.06);
    color: ${C.textPrimary};
    padding: 12px 24px;
    font-size: 14px;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .btn-ghost:hover {
    background: rgba(255,255,255,0.1);
  }

  /* Card */
  .card {
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 28px;
    transition: border-color 0.2s, transform 0.2s;
  }
  .card:hover {
    border-color: rgba(99,102,241,0.4);
    transform: translateY(-2px);
  }
  .card-featured {
    background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%);
    border-color: ${C.accent};
    position: relative;
    overflow: hidden;
  }
  .card-featured::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, ${C.accent}, ${C.violet});
  }

  /* Pricing check list */
  .check-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: ${C.textSecondary};
    margin-bottom: 10px;
  }
  .check-icon {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(34,197,94,0.15);
    color: ${C.success};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    flex-shrink: 0;
  }

  /* Footer links */
  .footer-link {
    color: ${C.textMuted};
    text-decoration: none;
    font-size: 13px;
    transition: color 0.2s;
  }
  .footer-link:hover { color: ${C.textSecondary}; }

  /* Metric badge */
  .metric-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.25);
    border-radius: 99px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    color: ${C.textPrimary};
  }

  /* Noise texture overlay for depth */
  .noise-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    border-radius: inherit;
  }

  /* Hero grid/mesh background */
  .hero-mesh {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 30% 40%, rgba(99,102,241,0.18) 0%, transparent 50%),
      radial-gradient(circle at 75% 20%, rgba(139,92,246,0.12) 0%, transparent 40%),
      linear-gradient(180deg, transparent 60%, ${C.bg} 100%);
    pointer-events: none;
  }
  .hero-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
    background-size: 64px 64px;
    pointer-events: none;
  }

  /* Mobile overrides */
  @media (max-width: 640px) {
    .hero-headline { font-size: clamp(28px, 8vw, 52px) !important; }
    .hero-actions  { flex-direction: column !important; }
    .hero-actions .btn { width: 100%; }
    .section-title { font-size: clamp(22px, 6vw, 40px) !important; }
    .nav-links { display: none !important; }
  }
`;

// ─── PWA Install hook ─────────────────────────────────────────────────────────
function usePWAInstall() {
  const [prompt, setPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const install = async () => {
    if (!prompt) return false;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
    return outcome === "accepted";
  };

  return { canInstall: !!prompt, install, installed };
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  id,
  children,
  style,
}: {
  id?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section
      id={id}
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "96px 24px",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ onInstall, canInstall }: { onInstall: () => void; canInstall: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 64,
        background: scrolled
          ? "rgba(11,13,20,0.9)"
          : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      {/* Logo */}
      <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${C.accent}, ${C.violet})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}
        >
          🧠
        </div>
        <span style={{ fontWeight: 700, fontSize: 17, color: C.textPrimary, letterSpacing: "-0.3px" }}>
          MindBridge
        </span>
      </a>

      {/* Links */}
      <div className="nav-links" style={{ display: "flex", gap: 32, alignItems: "center" }}>
        <a href="#features" className="nav-link">Funksjoner</a>
        <a href="#priser" className="nav-link">Priser</a>
        <a href="#om" className="nav-link">Om oss</a>
      </div>

      {/* CTA */}
      <button
        className="btn btn-primary"
        onClick={onInstall}
        style={{ padding: "9px 20px", fontSize: 13, borderRadius: 8, animation: "none" }}
      >
        {canInstall ? "Installer gratis" : "Kom i gang"}
      </button>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection({ onInstall, canInstall }: { onInstall: () => void; canInstall: boolean }) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div className="hero-grid" />
      <div className="hero-mesh" />

      <Section style={{ paddingTop: 128, paddingBottom: 80, position: "relative", zIndex: 1 }}>
        {/* Badge */}
        <div
          className="anim-fade-up"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(99,102,241,0.1)",
            border: `1px solid rgba(99,102,241,0.25)`,
            borderRadius: 99,
            padding: "6px 14px 6px 8px",
            marginBottom: 28,
          }}
        >
          <span
            style={{
              background: C.accent,
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 99,
              padding: "2px 8px",
              letterSpacing: "0.4px",
            }}
          >
            NY
          </span>
          <span style={{ fontSize: 13, color: C.textSecondary, fontWeight: 500 }}>
            AI-assistent for norske bedrifter — nå tilgjengelig
          </span>
        </div>

        {/* Headline */}
        <h1
          className="hero-headline anim-fade-up anim-delay-1"
          style={{
            fontSize: "clamp(36px, 5.5vw, 64px)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            maxWidth: 820,
            marginBottom: 24,
          }}
        >
          Spar{" "}
          <span className="gradient-text">5+ timer</span>
          {" "}i uken med AI som faktisk fungerer
        </h1>

        {/* Subheadline */}
        <p
          className="anim-fade-up anim-delay-2"
          style={{
            fontSize: 18,
            color: C.textSecondary,
            lineHeight: 1.7,
            maxWidth: 560,
            marginBottom: 40,
          }}
        >
          MindBridge gir deg en AI-assistent som passer inn i hverdagen din —
          ingen koding nødvendig.
        </p>

        {/* Actions */}
        <div
          className="hero-actions anim-fade-up anim-delay-3"
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}
        >
          <button className="btn btn-primary" onClick={onInstall} style={{ fontSize: 16, padding: "15px 32px" }}>
            <span>⚡</span>
            {canInstall ? "Installer MindBridge" : "Start gratis i dag"}
          </button>
          <a href="#funksjoner" className="btn btn-secondary" style={{ fontSize: 16 }}>
            Se hvordan det fungerer →
          </a>
        </div>

        {/* Metric badges */}
        <div
          className="anim-fade-up anim-delay-4"
          style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
        >
          {[
            { icon: "⏱", text: "5+ timer spart/uke" },
            { icon: "⚡", text: "< 5 min oppsett" },
            { icon: "🔒", text: "GDPR-kompatibel" },
          ].map((b) => (
            <span key={b.text} className="metric-badge">
              <span>{b.icon}</span> {b.text}
            </span>
          ))}
        </div>

        {/* Hero illustration placeholder */}
        <div
          className="anim-float anim-delay-2"
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "min(480px, 42vw)",
            aspectRatio: "4/3",
            background: `linear-gradient(135deg, ${C.surfaceHi} 0%, ${C.surface} 100%)`,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
          aria-hidden
        >
          {/* Mock chat UI */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF5F56" }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FEBC2E" }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#27C93F" }} />
            <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 8, fontWeight: 500 }}>
              MindBridge AI
            </span>
          </div>
          <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { role: "user", text: "Kan du hjelpe meg med ukesrapporten?" },
              { role: "ai",   text: "Selvfølgelig! Jeg har analysert dataene dine. Her er en sammendrag av ukens resultater..." },
              { role: "user", text: "Flott! Lag en presentasjon av dette." },
              { role: "ai",   text: "Ferdig! Presentasjonen er klar med 8 lysbilder. Vil du at jeg sender den direkte?" },
            ].map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "10px 14px",
                    borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    background: m.role === "user" ? C.accent : C.surfaceHi,
                    border: m.role === "ai" ? `1px solid ${C.border}` : "none",
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: C.textPrimary,
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {/* Typing indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, paddingLeft: 4 }}>
              {[0, 0.2, 0.4].map((d, i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: C.accent,
                    animation: `float ${0.8 + d}s ease-in-out infinite`,
                    animationDelay: `${d}s`,
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

// ─── Problem / Solution ───────────────────────────────────────────────────────
function ProblemSection() {
  return (
    <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <Section id="problem">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2
            className="section-title"
            style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 16 }}
          >
            Norske bedrifter drukner i{" "}
            <span className="gradient-text">repetitive oppgaver</span>
          </h2>
          <p style={{ color: C.textSecondary, fontSize: 17, maxWidth: 560, margin: "0 auto" }}>
            Mens du bruker tid på det kjedelige, taper du penger og energi du kunne
            brukt på vekst.
          </p>
        </div>

        {/* Pain points */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 64,
          }}
        >
          {[
            {
              icon: "📊",
              title: "Manuell databehandling",
              desc: "Timer brukt på å kopiere data mellom systemer og lage rapporter for hånd.",
            },
            {
              icon: "⏳",
              title: "Treige svartider",
              desc: "Kunder og kollegaer venter på svar mens du er opptatt med rutineoppgaver.",
            },
            {
              icon: "🔌",
              title: "Verktøy som ikke snakker",
              desc: "Apper og systemer som ikke integreres — du er limet som holder alt sammen.",
            },
          ].map((p) => (
            <div key={p.title} className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {p.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 15 }}>{p.title}</div>
                <div style={{ color: C.textSecondary, fontSize: 13, lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Solution bridge */}
        <div
          style={{
            background: `linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.06) 100%)`,
            border: `1px solid rgba(99,102,241,0.3)`,
            borderRadius: 20,
            padding: "40px 48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
          <div style={{ fontSize: 36, marginBottom: 16 }}>✨</div>
          <p
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: C.textPrimary,
              lineHeight: 1.5,
              maxWidth: 580,
              margin: "0 auto",
            }}
          >
            MindBridge automatiserer det kjedelige — så du kan fokusere på det
            som{" "}
            <span className="gradient-text">betyr noe</span>.
          </p>
        </div>
      </Section>
    </div>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: "💬",
      title: "AI-chat på norsk",
      desc: "Stiller spørsmål, gir svar og lærer av din bedrift. Full norsk støtte — ingen oversettelser nødvendig.",
      accent: "#6366F1",
    },
    {
      icon: "⚙️",
      title: "Workflow-automatisering",
      desc: "Integrer med verktøy du allerede bruker: e-post, kalender, CRM og mer. Sett opp én gang, spar tid for alltid.",
      accent: "#8B5CF6",
    },
    {
      icon: "🚀",
      title: "Enkel oppsett",
      desc: "Oppe og i gang på under 5 minutter. Ingen teknisk bakgrunn nødvendig — bare logg inn og start.",
      accent: "#06B6D4",
    },
    {
      icon: "📱",
      title: "Offline-støtte (PWA)",
      desc: "Fungerer som en native app direkte fra nettleseren. Installer på mobil eller desktop med ett klikk.",
      accent: "#22C55E",
    },
    {
      icon: "🔒",
      title: "GDPR-kompatibel",
      desc: "Dataene dine forblir dine. Ingen deling med tredjeparter, ingen overraskelser. Full etterlevelse av norsk lov.",
      accent: "#F59E0B",
    },
  ];

  return (
    <div id="funksjoner">
      <Section id="features">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: C.accent,
              display: "block",
              marginBottom: 12,
            }}
          >
            Funksjoner
          </span>
          <h2
            className="section-title"
            style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 16 }}
          >
            Alt du trenger for å jobbe{" "}
            <span className="gradient-text">smartere</span>
          </h2>
          <p style={{ color: C.textSecondary, fontSize: 17, maxWidth: 500, margin: "0 auto" }}>
            MindBridge kombinerer AI-kraft med enkelheten norske bedrifter trenger.
          </p>
        </div>

        <div className="grid-features">
          {features.map((f) => (
            <div key={f.title} className="card" style={{ position: "relative", overflow: "hidden" }}>
              {/* Icon */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: `${f.accent}18`,
                  border: `1px solid ${f.accent}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  marginBottom: 18,
                }}
              >
                {f.icon}
              </div>
              <div
                style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: C.textPrimary }}
              >
                {f.title}
              </div>
              <div style={{ color: C.textSecondary, fontSize: 14, lineHeight: 1.65 }}>
                {f.desc}
              </div>
              {/* Subtle corner glow */}
              <div
                style={{
                  position: "absolute",
                  bottom: -20,
                  right: -20,
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${f.accent}18 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─── Social Proof ─────────────────────────────────────────────────────────────
function SocialProofSection() {
  const testimonials = [
    {
      name: "Kari Nordmann",
      role: "Daglig leder, Nordmann AS",
      text: "MindBridge har spart oss for 8 timer i uken. Ukesrapportene skriver seg selv nå — rett og slett imponerende.",
      avatar: "KN",
      color: "#6366F1",
    },
    {
      name: "Ole Hansen",
      role: "Gründer, Hansen Digital",
      text: "Oppsett tok 3 minutter. Etter to uker skjønte jeg ikke hvordan vi klarte oss uten.",
      avatar: "OH",
      color: "#8B5CF6",
    },
    {
      name: "Ingrid Bakke",
      role: "Økonomisjef, Bakke Gruppen",
      text: "GDPR-etterlevelse var avgjørende for oss. MindBridge leverer på alle punkter — norsk og trygt.",
      avatar: "IB",
      color: "#06B6D4",
    },
  ];

  return (
    <div style={{ background: C.surfaceHi, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <Section id="om">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: C.violet,
              display: "block",
              marginBottom: 12,
            }}
          >
            Testimonials
          </span>
          <h2
            className="section-title"
            style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 16 }}
          >
            Betrodd av{" "}
            <span className="gradient-text">fremtidsrettede</span>
            {" "}norske bedrifter
          </h2>
        </div>

        <div className="grid-proof" style={{ marginBottom: 48 }}>
          {testimonials.map((t) => (
            <div key={t.name} className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Stars */}
              <div style={{ color: "#F59E0B", fontSize: 14, letterSpacing: 2 }}>★★★★★</div>
              <p style={{ color: C.textSecondary, fontSize: 14, lineHeight: 1.7, flex: 1 }}>
                "{t.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${t.color}, ${t.color}80)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  <div style={{ color: C.textMuted, fontSize: 12 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Metrics row */}
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "5+", label: "Timer spart/uke" },
            { value: "< 5 min", label: "Oppsett" },
            { value: "100%", label: "GDPR-kompatibel" },
            { value: "NB", label: "Norsk AI-støtte" },
          ].map((m) => (
            <div
              key={m.label}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "20px 28px",
                textAlign: "center",
                minWidth: 140,
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  background: `linear-gradient(135deg, ${C.accent}, ${C.violet})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: 4,
                }}
              >
                {m.value}
              </div>
              <div style={{ color: C.textMuted, fontSize: 12, fontWeight: 500 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function PricingSection({ onInstall, canInstall }: { onInstall: () => void; canInstall: boolean }) {
  const plans = [
    {
      name: "Gratis",
      price: "0",
      period: "for alltid",
      description: "Kom i gang i dag. Ingen kredittkort nødvendig.",
      cta: "Start gratis",
      ctaStyle: "btn-outline",
      featured: false,
      items: [
        "AI-chat (begrenset til 50 meldinger/dag)",
        "1 workflow-automatisering",
        "Norsk språkstøtte",
        "E-poststøtte",
      ],
    },
    {
      name: "Pro",
      price: "299",
      period: "NOK/mnd",
      description: "For deg som vil ta bedriften til neste nivå.",
      cta: "Start Pro",
      ctaStyle: "btn-primary",
      featured: true,
      badge: "Mest populær",
      items: [
        "Ubegrenset AI-chat",
        "Opptil 10 workflow-automatiseringer",
        "Prioritert support",
        "Alle integrasjoner",
        "Offline PWA-tilgang",
        "GDPR-rapport på forespørsel",
      ],
    },
    {
      name: "Business",
      price: "Kontakt oss",
      period: "",
      description: "Skreddersydd løsning for større team og spesielle behov.",
      cta: "Ta kontakt",
      ctaStyle: "btn-ghost",
      featured: false,
      items: [
        "Alt i Pro",
        "Custom integrasjoner",
        "Dedikert kundesuksess",
        "SLA-garanti",
        "On-premise alternativ",
        "Team-administrasjon",
      ],
    },
  ];

  return (
    <div id="priser">
      <Section>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: C.accent,
              display: "block",
              marginBottom: 12,
            }}
          >
            Priser
          </span>
          <h2
            className="section-title"
            style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 16 }}
          >
            Enkel prising,{" "}
            <span className="gradient-text">ingen overraskelser</span>
          </h2>
          <p style={{ color: C.textSecondary, fontSize: 17 }}>
            Start gratis. Oppgrader når du er klar.
          </p>
        </div>

        <div className="grid-pricing">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card ${plan.featured ? "card-featured" : ""}`}
              style={{ display: "flex", flexDirection: "column" }}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  style={{
                    display: "inline-block",
                    background: `linear-gradient(135deg, ${C.accent}, ${C.violet})`,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 99,
                    padding: "4px 12px",
                    marginBottom: 16,
                    alignSelf: "flex-start",
                    letterSpacing: "0.3px",
                  }}
                >
                  {plan.badge}
                </div>
              )}

              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 8 }}>
                {plan.price !== "Kontakt oss" ? (
                  <>
                    <span style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-1px", color: C.textPrimary }}>
                      {plan.price}
                    </span>
                    <span style={{ color: C.textMuted, fontSize: 14, paddingBottom: 6 }}>{plan.period}</span>
                  </>
                ) : (
                  <span style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, paddingBottom: 4 }}>
                    {plan.price}
                  </span>
                )}
              </div>
              <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
                {plan.description}
              </p>

              {/* Feature list */}
              <div style={{ flex: 1, marginBottom: 28 }}>
                {plan.items.map((item) => (
                  <div key={item} className="check-item">
                    <span className="check-icon">✓</span>
                    {item}
                  </div>
                ))}
              </div>

              <button
                className={`btn ${plan.ctaStyle}`}
                onClick={plan.featured ? onInstall : undefined}
                style={{ width: "100%", padding: "13px 20px", fontSize: 15 }}
              >
                {plan.featured && canInstall ? "Installer Pro gratis i 14 dager" : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${C.border}`,
        background: C.surface,
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "48px 24px 32px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: `linear-gradient(135deg, ${C.accent}, ${C.violet})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                🧠
              </div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>MindBridge</span>
            </div>
            <p style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.6, maxWidth: 220 }}>
              AI-automatisering for norske bedrifter — enkelt, trygt og effektivt.
            </p>
          </div>

          {/* Links */}
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14, color: C.textSecondary }}>
              Produkt
            </div>
            {["Funksjoner", "Priser", "Integrasjoner", "Oppdateringer"].map((l) => (
              <div key={l} style={{ marginBottom: 10 }}>
                <a href="#" className="footer-link">{l}</a>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14, color: C.textSecondary }}>
              Selskap
            </div>
            {["Om oss", "Blogg", "Karriere", "Presse"].map((l) => (
              <div key={l} style={{ marginBottom: 10 }}>
                <a href="#" className="footer-link">{l}</a>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14, color: C.textSecondary }}>
              Støtte
            </div>
            {["Kontakt", "Dokumentasjon", "Status", "Personvern"].map((l) => (
              <div key={l} style={{ marginBottom: 10 }}>
                <a href="#" className="footer-link">{l}</a>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" style={{ marginBottom: 24 }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ color: C.textMuted, fontSize: 12 }}>
            © 2026 Helkrypt AI. Alle rettigheter forbeholdt.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "LinkedIn", href: "#" },
              { label: "X (Twitter)", href: "#" },
            ].map((s) => (
              <a key={s.label} href={s.href} className="footer-link" style={{ fontSize: 12 }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { canInstall, install, installed } = usePWAInstall();

  const handleInstall = async () => {
    const ok = await install();
    if (!ok) {
      // Fallback — scroll to features or open app
      document.getElementById("funksjoner")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div style={{ background: C.bg, minHeight: "100vh" }}>
        <Nav onInstall={handleInstall} canInstall={canInstall && !installed} />
        <HeroSection onInstall={handleInstall} canInstall={canInstall && !installed} />
        <ProblemSection />
        <FeaturesSection />
        <SocialProofSection />
        <PricingSection onInstall={handleInstall} canInstall={canInstall && !installed} />
        <Footer />
      </div>
    </>
  );
}
