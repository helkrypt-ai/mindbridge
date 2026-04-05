"use client";

/**
 * MindBridge — Mental Health Landing Page
 *
 * Drop this file in as `app/page.tsx`.
 * English copy, dark organic theme, soft sage-green accents, PWA install CTA.
 *
 * No external dependencies beyond React — uses inline styles + a <style> block.
 * PWA install prompt: relies on the browser `beforeinstallprompt` event.
 */

import React, { useEffect, useRef, useState } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:            "#080C14",
  surface:       "#0E1420",
  surfaceHi:     "#141C2C",
  surfaceBorder: "#1A2438",
  accent:        "#6EE7B7",   // sage-mint
  accentDim:     "#34D399",
  accentGlow:    "rgba(110,231,183,0.12)",
  accentGlowSoft:"rgba(110,231,183,0.06)",
  rose:          "#FDA4AF",   // soft dusty rose
  amber:         "#FCD34D",
  textPrimary:   "#E8EDF5",
  textSecondary: "#8A96B0",
  textMuted:     "#4A5368",
  white:         "#FFFFFF",
};

// ─── Global styles ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
    background: ${C.bg};
    color: ${C.textPrimary};
    -webkit-font-smoothing: antialiased;
    line-height: 1.6;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.surfaceBorder}; border-radius: 3px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes breathe {
    0%, 100% { transform: scale(1) translateY(0); opacity: 0.4; }
    50%       { transform: scale(1.08) translateY(-6px); opacity: 0.65; }
  }
  @keyframes drift {
    0%   { transform: translateX(0px) translateY(0px); }
    33%  { transform: translateX(8px) translateY(-12px); }
    66%  { transform: translateX(-6px) translateY(-4px); }
    100% { transform: translateX(0px) translateY(0px); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .fade-up   { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-2 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.12s both; }
  .fade-up-3 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.24s both; }
  .fade-up-4 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.36s both; }
  .fade-in   { animation: fadeIn 1s ease both; }

  .serif { font-family: 'Lora', Georgia, serif; }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${C.accent};
    color: #080C14;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 15px;
    padding: 13px 28px;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    transition: all 0.25s ease;
    text-decoration: none;
    letter-spacing: 0.01em;
  }
  .btn-primary:hover {
    background: #A7F3D0;
    transform: translateY(-1px);
    box-shadow: 0 8px 32px ${C.accentGlow};
  }

  .btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: ${C.textSecondary};
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 15px;
    padding: 13px 24px;
    border-radius: 100px;
    border: 1px solid ${C.surfaceBorder};
    cursor: pointer;
    transition: all 0.25s ease;
    text-decoration: none;
    letter-spacing: 0.01em;
  }
  .btn-ghost:hover {
    border-color: ${C.accent};
    color: ${C.accent};
    background: ${C.accentGlowSoft};
  }

  .card {
    background: ${C.surface};
    border: 1px solid ${C.surfaceBorder};
    border-radius: 20px;
    padding: 32px;
    transition: all 0.3s ease;
  }
  .card:hover {
    border-color: rgba(110,231,183,0.25);
    background: ${C.surfaceHi};
    transform: translateY(-3px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${C.accentGlowSoft};
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
  }

  .grid-features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .grid-pricing {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .grid-testimonials {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .grid-steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }

  @media (max-width: 900px) {
    .grid-features, .grid-pricing, .grid-testimonials, .grid-steps {
      grid-template-columns: 1fr;
    }
    .hero-ctas { flex-direction: column; align-items: flex-start; }
  }
  @media (max-width: 640px) {
    .nav-links { display: none; }
    .grid-pricing { grid-template-columns: 1fr; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Wrap = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", ...style }}>
    {children}
  </div>
);

const Section = ({ children, style, id }: { children: React.ReactNode; style?: React.CSSProperties; id?: string }) => (
  <section id={id} style={{ padding: "100px 0", position: "relative", ...style }}>
    {children}
  </section>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: C.accentGlow,
    border: `1px solid rgba(110,231,183,0.2)`,
    borderRadius: 100,
    padding: "6px 16px",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: C.accent,
    marginBottom: 24,
  }}>
    {children}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled]             = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pwaInstalled, setPwaInstalled]     = useState(false);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    // Inject global CSS
    if (!styleRef.current) {
      const el = document.createElement("style");
      el.innerHTML = GLOBAL_CSS;
      document.head.appendChild(el);
      styleRef.current = el;
    }
    // Scroll listener
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    // PWA install
    const onBeforeInstall = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    if (window.matchMedia("(display-mode: standalone)").matches) setPwaInstalled(true);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") { setPwaInstalled(true); setDeferredPrompt(null); }
  };

  return (
    <>
      {/* ── Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(8,12,20,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.surfaceBorder}` : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        <Wrap style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 34, height: 34,
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`,
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>🌿</div>
            <span style={{
              fontFamily: "'Lora', Georgia, serif",
              fontWeight: 600, fontSize: 20,
              color: C.textPrimary, letterSpacing: "-0.3px",
            }}>MindBridge</span>
          </a>

          {/* Nav links */}
          <div className="nav-links" style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {[["Features", "#features"], ["How it works", "#how-it-works"], ["Pricing", "#pricing"]].map(([label, href]) => (
              <a key={label} href={href} style={{
                color: C.textSecondary, textDecoration: "none", fontSize: 15,
                fontWeight: 400, transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = C.textPrimary)}
              onMouseLeave={e => (e.currentTarget.style.color = C.textSecondary)}>
                {label}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {!pwaInstalled && (
              <button className="btn-ghost" onClick={handleInstall} style={{ fontSize: 13, padding: "9px 18px" }}>
                {deferredPrompt ? "Install app" : "Open"}
              </button>
            )}
            <a href="/login" className="btn-primary" style={{ fontSize: 14, padding: "10px 22px" }}>
              Log in
            </a>
          </div>
        </Wrap>
      </nav>

      {/* ── Hero ── */}
      <Section style={{ paddingTop: 160, paddingBottom: 120, overflow: "hidden" }}>
        {/* Ambient orbs */}
        <div className="orb" style={{
          width: 600, height: 600,
          background: `radial-gradient(circle, rgba(110,231,183,0.15) 0%, transparent 70%)`,
          top: -100, right: -150,
          animation: "breathe 8s ease-in-out infinite",
        }} />
        <div className="orb" style={{
          width: 400, height: 400,
          background: `radial-gradient(circle, rgba(253,164,175,0.08) 0%, transparent 70%)`,
          bottom: -50, left: -100,
          animation: "drift 12s ease-in-out infinite",
        }} />

        <Wrap style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="fade-in" style={{ marginBottom: 28 }}>
            <SectionLabel>✦ Your personal reflection companion</SectionLabel>
          </div>

          <h1 className="fade-up serif" style={{
            fontSize: "clamp(44px, 7vw, 76px)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            marginBottom: 28,
            color: C.white,
          }}>
            A safe space<br />
            <em style={{ color: C.accent, fontStyle: "italic" }}>for your thoughts</em>
          </h1>

          <p className="fade-up-2" style={{
            fontSize: "clamp(17px, 2.5vw, 20px)",
            color: C.textSecondary,
            maxWidth: 560,
            margin: "0 auto 48px",
            lineHeight: 1.7,
            fontWeight: 300,
          }}>
            MindBridge helps you understand your own thoughts and feelings — at your own pace, on your own terms.
          </p>

          <div className="fade-up-3 hero-ctas" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/register" className="btn-primary">
              Start free →
            </a>
            <a href="#how-it-works" className="btn-ghost">
              See how it works
            </a>
          </div>

          {/* Trust note */}
          <div className="fade-up-4" style={{
            marginTop: 56,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}>
            {[
              ["🔒", "Private and encrypted"],
              ["🌍", "AI in your language"],
              ["💚", "No personal data trading"],
            ].map(([icon, text]) => (
              <div key={text} style={{
                display: "flex", alignItems: "center", gap: 7,
                color: C.textMuted, fontSize: 13,
              }}>
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </Wrap>
      </Section>

      {/* ── Problem section ── */}
      <Section style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.surface}, ${C.surfaceHi})`,
          border: `1px solid ${C.surfaceBorder}`,
          borderRadius: 28,
          padding: "64px 48px",
          maxWidth: 900,
          margin: "0 auto",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 220, height: 220,
            background: `radial-gradient(circle, ${C.accentGlow} 0%, transparent 70%)`,
            borderRadius: "50%",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <SectionLabel>Everyday life is complex</SectionLabel>
            <h2 className="serif" style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 600,
              lineHeight: 1.25,
              marginBottom: 24,
              color: C.white,
              letterSpacing: "-0.5px",
            }}>
              Many of us lack a safe space<br />
              <em style={{ color: C.accent, fontStyle: "italic" }}>to process everyday life</em>
            </h2>
            <p style={{
              fontSize: 18, color: C.textSecondary,
              lineHeight: 1.75, maxWidth: 620, fontWeight: 300,
            }}>
              Thoughts pile up. Feelings are hard to put into words. We talk to others, but we also need a place where we can be honest with ourselves — without worrying about what others think.
            </p>
            <p style={{
              fontSize: 18, color: C.textSecondary,
              lineHeight: 1.75, maxWidth: 620, fontWeight: 300, marginTop: 16,
            }}>
              MindBridge is the safe, private space you perhaps never knew you needed.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Features ── */}
      <Section id="features">
        <Wrap>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <SectionLabel>Features</SectionLabel>
            <h2 className="serif" style={{
              fontSize: "clamp(30px, 4vw, 48px)",
              fontWeight: 600, letterSpacing: "-0.8px",
              color: C.white, lineHeight: 1.2,
            }}>
              Tools for your inner world
            </h2>
          </div>

          <div className="grid-features">
            {[
              {
                icon: "📔",
                title: "Journaling",
                desc: "Write freely about your day. AI helps you spot patterns in your thoughts over time — without judgment, just curiosity.",
                color: C.accent,
              },
              {
                icon: "🌤",
                title: "Mood tracking",
                desc: "Log how you're feeling. See connections between mood, sleep, and activities over weeks and months.",
                color: C.rose,
              },
              {
                icon: "💡",
                title: "Personal insights",
                desc: "Discover tendencies in your thoughts and feelings with empathic AI analysis. Understand yourself better, step by step.",
                color: C.amber,
              },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} className="card" style={{ position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", top: -30, right: -30,
                  width: 100, height: 100,
                  background: `radial-gradient(circle, ${color}1A 0%, transparent 70%)`,
                  borderRadius: "50%",
                }} />
                <div style={{
                  fontSize: 36, marginBottom: 20,
                  background: `${color}18`,
                  width: 60, height: 60, borderRadius: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {icon}
                </div>
                <h3 style={{
                  fontFamily: "'Lora', serif",
                  fontSize: 22, fontWeight: 600,
                  color: C.white, marginBottom: 12,
                }}>
                  {title}
                </h3>
                <p style={{ color: C.textSecondary, lineHeight: 1.7, fontSize: 15, fontWeight: 300 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </Wrap>
      </Section>

      {/* ── How it works ── */}
      <Section id="how-it-works" style={{ paddingTop: 60 }}>
        <div style={{
          background: C.surface,
          borderTop: `1px solid ${C.surfaceBorder}`,
          borderBottom: `1px solid ${C.surfaceBorder}`,
          padding: "80px 0",
        }}>
          <Wrap>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <SectionLabel>How it works</SectionLabel>
              <h2 className="serif" style={{
                fontSize: "clamp(30px, 4vw, 48px)",
                fontWeight: 600, letterSpacing: "-0.8px",
                color: C.white, lineHeight: 1.2,
              }}>
                Three simple steps
              </h2>
            </div>

            <div className="grid-steps">
              {[
                {
                  number: "01",
                  title: "Write",
                  desc: "Open the app and write what's on your mind — a sentence, a page, whatever you want. No rules, no right answers.",
                  icon: "✍️",
                },
                {
                  number: "02",
                  title: "Reflect",
                  desc: "AI reads what you've written and asks gentle, open questions that help you explore your thoughts more deeply.",
                  icon: "🌀",
                },
                {
                  number: "03",
                  title: "Understand",
                  desc: "Over time you build a picture of yourself — who you are, what affects you, and what makes you feel good.",
                  icon: "🌱",
                },
              ].map(({ number, title, desc, icon }) => (
                <div key={title} style={{ textAlign: "center", padding: "0 16px" }}>
                  <div style={{
                    fontSize: 40, marginBottom: 20,
                    width: 72, height: 72, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${C.accentGlow}, transparent)`,
                    border: `1px solid rgba(110,231,183,0.2)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px",
                  }}>
                    {icon}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
                    color: C.accent, textTransform: "uppercase" as const,
                    marginBottom: 10,
                  }}>
                    Step {number}
                  </div>
                  <h3 className="serif" style={{
                    fontSize: 24, fontWeight: 600,
                    color: C.white, marginBottom: 14,
                  }}>
                    {title}
                  </h3>
                  <p style={{ color: C.textSecondary, lineHeight: 1.7, fontSize: 15, fontWeight: 300 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </Wrap>
        </div>
      </Section>

      {/* ── Pricing ── */}
      <Section id="pricing">
        <Wrap>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="serif" style={{
              fontSize: "clamp(30px, 4vw, 48px)",
              fontWeight: 600, letterSpacing: "-0.8px",
              color: C.white, lineHeight: 1.2, marginBottom: 16,
            }}>
              Start free, grow at your own pace
            </h2>
            <p style={{ color: C.textSecondary, fontSize: 16, fontWeight: 300 }}>
              No hidden costs. Cancel anytime.
            </p>
          </div>

          <div className="grid-pricing">
            {/* Free */}
            <div className="card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Free</span>
              </div>
              <div style={{ marginBottom: 24 }}>
                <span className="serif" style={{ fontSize: 44, fontWeight: 700, color: C.white }}>$0</span>
                <span style={{ color: C.textSecondary, marginLeft: 4, fontSize: 15 }}>USD/mo</span>
              </div>
              <ul style={{ listStyle: "none", marginBottom: 32, flex: 1 }}>
                {[
                  "Daily journaling",
                  "Mood log — 7 days",
                  "30 AI reflections per month",
                  "Basic insights",
                ].map(item => (
                  <li key={item} style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    color: C.textSecondary, fontSize: 14, marginBottom: 12, lineHeight: 1.5,
                  }}>
                    <span style={{ color: C.accent, flexShrink: 0, marginTop: 2 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="/register" className="btn-ghost" style={{ textAlign: "center", justifyContent: "center" }}>
                Get started
              </a>
            </div>

            {/* Pro */}
            <div style={{
              background: `linear-gradient(160deg, ${C.surfaceHi}, ${C.surface})`,
              border: `1.5px solid rgba(110,231,183,0.35)`,
              borderRadius: 20,
              padding: 32,
              display: "flex", flexDirection: "column",
              position: "relative", overflow: "hidden",
              boxShadow: `0 0 60px ${C.accentGlowSoft}`,
            }}>
              <div style={{
                position: "absolute", top: -40, right: -40,
                width: 160, height: 160,
                background: `radial-gradient(circle, rgba(110,231,183,0.1) 0%, transparent 70%)`,
                borderRadius: "50%",
              }} />
              <div style={{
                position: "absolute", top: 16, right: 16,
                background: C.accent, color: "#080C14",
                fontSize: 11, fontWeight: 700,
                padding: "4px 10px", borderRadius: 100,
                textTransform: "uppercase" as const, letterSpacing: "0.06em",
              }}>
                Recommended
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.accent, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Pro</span>
              </div>
              <div style={{ marginBottom: 24 }}>
                <span className="serif" style={{ fontSize: 44, fontWeight: 700, color: C.white }}>$29</span>
                <span style={{ color: C.textSecondary, marginLeft: 4, fontSize: 15 }}>USD/mo</span>
              </div>
              <ul style={{ listStyle: "none", marginBottom: 32, flex: 1 }}>
                {[
                  "Unlimited journaling",
                  "Full mood tracking with history",
                  "Unlimited AI reflections",
                  "Deep personal insights",
                  "Journal export (PDF/JSON)",
                  "Priority support",
                ].map(item => (
                  <li key={item} style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    color: C.textSecondary, fontSize: 14, marginBottom: 12, lineHeight: 1.5,
                  }}>
                    <span style={{ color: C.accent, flexShrink: 0, marginTop: 2 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="/register?plan=pro" className="btn-primary" style={{ textAlign: "center", justifyContent: "center" }}>
                Start Pro
              </a>
            </div>

            {/* Business */}
            <div className="card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Business</span>
              </div>
              <div style={{ marginBottom: 24 }}>
                <span className="serif" style={{ fontSize: 30, fontWeight: 700, color: C.white, lineHeight: 1.4 }}>
                  Custom<br />pricing
                </span>
              </div>
              <p style={{ color: C.textSecondary, fontSize: 14, lineHeight: 1.6, marginBottom: 24, fontWeight: 300, flex: 1 }}>
                For companies, HR departments, and organizations that want to offer employees or members a safe tool for mental well-being.
              </p>
              <ul style={{ listStyle: "none", marginBottom: 32 }}>
                {[
                  "Team dashboard",
                  "GDPR-compliant setup",
                  "Dedicated account manager",
                ].map(item => (
                  <li key={item} style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    color: C.textSecondary, fontSize: 14, marginBottom: 12, lineHeight: 1.5,
                  }}>
                    <span style={{ color: C.accent, flexShrink: 0, marginTop: 2 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@mindbridge.no" className="btn-ghost" style={{ textAlign: "center", justifyContent: "center" }}>
                Contact us
              </a>
            </div>
          </div>
        </Wrap>
      </Section>

      {/* ── Testimonials ── */}
      <Section style={{ paddingTop: 60 }}>
        <div style={{
          background: C.surfaceHi,
          borderTop: `1px solid ${C.surfaceBorder}`,
          borderBottom: `1px solid ${C.surfaceBorder}`,
          padding: "80px 0",
        }}>
          <Wrap>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <SectionLabel>What users say</SectionLabel>
              <h2 className="serif" style={{
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: 600, letterSpacing: "-0.5px", color: C.white,
              }}>
                Real experiences
              </h2>
            </div>

            <div className="grid-testimonials">
              {[
                {
                  quote: "I've never been good at keeping a journal, but MindBridge makes it so approachable. It feels like talking to a friend who never judges you.",
                  name: "Karin L.",
                  detail: "User since January",
                },
                {
                  quote: "After a few weeks of mood tracking I finally understood the connection between sleep and anxiety. It's been a revelation.",
                  name: "Thomas B.",
                  detail: "Pro user",
                },
                {
                  quote: "I sought professional help after using MindBridge for three months. The app helped me put words to things I didn't know I needed to say.",
                  name: "Marte E.",
                  detail: "User since March",
                },
              ].map(({ quote, name, detail }) => (
                <div key={name} className="card" style={{ position: "relative" }}>
                  <div style={{
                    fontSize: 48, lineHeight: 1,
                    color: C.accent, opacity: 0.3,
                    fontFamily: "Georgia, serif",
                    marginBottom: 16,
                  }}>
                    "
                  </div>
                  <p style={{
                    color: C.textSecondary, fontSize: 15, lineHeight: 1.75,
                    fontWeight: 300, fontStyle: "italic",
                    marginBottom: 24,
                  }}>
                    {quote}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%",
                      background: `linear-gradient(135deg, ${C.accentGlow}, rgba(110,231,183,0.05))`,
                      border: `1px solid rgba(110,231,183,0.2)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16,
                    }}>
                      🌿
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: C.textPrimary }}>{name}</div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>{detail}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Wrap>
        </div>
      </Section>

      {/* ── Final CTA ── */}
      <Section style={{ paddingTop: 80, paddingBottom: 100 }}>
        <Wrap>
          <div style={{
            textAlign: "center",
            background: `linear-gradient(160deg, ${C.surface} 0%, ${C.surfaceHi} 100%)`,
            border: `1px solid ${C.surfaceBorder}`,
            borderRadius: 32,
            padding: "80px 48px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 500, height: 300,
              background: `radial-gradient(ellipse, ${C.accentGlowSoft} 0%, transparent 70%)`,
              pointerEvents: "none",
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 48, marginBottom: 24 }}>🌱</div>
              <h2 className="serif" style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 600, letterSpacing: "-0.8px",
                color: C.white, lineHeight: 1.2, marginBottom: 20,
              }}>
                Begin the journey into yourself
              </h2>
              <p style={{
                color: C.textSecondary, fontSize: 17,
                maxWidth: 480, margin: "0 auto 40px",
                lineHeight: 1.7, fontWeight: 300,
              }}>
                Free to start. No credit card required. Your data belongs to you — always.
              </p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <a href="/register" className="btn-primary">
                  Start free →
                </a>
                {!pwaInstalled && (
                  <button className="btn-ghost" onClick={handleInstall}>
                    {deferredPrompt ? "📱 Install as app" : "Learn more"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Wrap>
      </Section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: `1px solid ${C.surfaceBorder}`,
        padding: "40px 0",
        background: C.bg,
      }}>
        <Wrap>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>🌿</span>
              <span style={{
                fontFamily: "'Lora', serif",
                fontWeight: 600, fontSize: 16, color: C.textSecondary,
              }}>MindBridge</span>
            </div>
            <div style={{
              display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center",
            }}>
              {[["Privacy", "/privacy"], ["Terms", "/terms"], ["hello@mindbridge.no", "mailto:hello@mindbridge.no"]].map(([label, href]) => (
                <a key={label} href={href} style={{
                  color: C.textMuted, fontSize: 13,
                  textDecoration: "none", transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = C.textSecondary)}
                onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}>
                  {label}
                </a>
              ))}
            </div>
            <p style={{ color: C.textMuted, fontSize: 12 }}>
              © {new Date().getFullYear()} MindBridge — Helkrypt AI AS
            </p>
          </div>
        </Wrap>
      </footer>
    </>
  );
}
