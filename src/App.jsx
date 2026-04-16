// App.jsx — NexaCore AI
import { useEffect, useRef, lazy, Suspense } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Navbar from './Navbar'
import s from './App.module.css'

gsap.registerPlugin(ScrollTrigger)
const HexCore3D = lazy(() => import('./HexCore3D'))

/* ── Icon ─────────────────────────────────────────────── */
function Icon({ d, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

/* ── Service Card ─────────────────────────────────────── */
function ServiceCard({ tag, title, desc, features, icon, featured }) {
  return (
    <div className={`${s.card} ${featured ? s.featured : ''}`}>
      <div className={s.cardIcon}><Icon d={icon} /></div>
      <span className={s.cardTag}>{tag}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
      <ul className={s.feats}>
        {features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
    </div>
  )
}

/* ── Process Step ─────────────────────────────────────── */
function Step({ num, title, desc }) {
  return (
    <div className={s.step}>
      <div className={s.stepNum}>{num}</div>
      <div>
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
    </div>
  )
}

/* ── App ──────────────────────────────────────────────── */
export default function App() {
  const sp        = useRef(0)
  const scrollVel = useRef(0)
  const heroRef   = useRef()
  const canvasRef = useRef()
  const textRef   = useRef()
  const badgeRef  = useRef()
  const svcRef    = useRef()
  const whyRef    = useRef()

  /* Track scroll velocity for 3D rotation */
  useEffect(() => {
    const onWheel = e => { scrollVel.current += e.deltaY * 0.0009 }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  /* Lenis smooth scroll */
  useEffect(() => {
    let lenis
    import('lenis').then(mod => {
      const Lenis = mod.default ?? mod
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf) }
      requestAnimationFrame(raf)
      lenis.on('scroll', () => ScrollTrigger.update())
    }).catch(() => {})
    return () => lenis?.destroy()
  }, [])

  /* GSAP animations */
  useEffect(() => {
    const ctx = gsap.context(() => {

      // Pin hero — 250% extra scroll = full animation visible before moving on
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: '+=250%',
        pin: true,
        scrub: 1.5,
        onUpdate: self => { sp.current = self.progress },
      })

      // Badge fades out in first 25% of scroll
      gsap.to(badgeRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=62%',
          scrub: true,
        },
        y: -28, opacity: 0,
      })

      // Hero text fades out in first 50%
      gsap.to(textRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=125%',
          scrub: true,
        },
        y: -60, opacity: 0,
      })

      // Service cards stagger
      const cards = svcRef.current?.querySelectorAll('[data-card]')
      if (cards?.length) {
        gsap.fromTo(cards,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, stagger: 0.14, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: svcRef.current, start: 'top 78%' },
          }
        )
      }

      // Why points slide
      const pts = whyRef.current?.querySelectorAll('[data-why]')
      if (pts?.length) {
        gsap.fromTo(pts,
          { x: -35, opacity: 0 },
          {
            x: 0, opacity: 1, stagger: 0.1, duration: 0.65, ease: 'power2.out',
            scrollTrigger: { trigger: whyRef.current, start: 'top 78%' },
          }
        )
      }
    })
    return () => ctx.revert()
  }, [])

  const go = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className={s.app}>
      <Navbar />

      {/* ══ HERO ════════════════════════════════════════ */}
      <section className={s.hero} ref={heroRef} id="hero">
        <div className={s.heroBg}>
          <div className={s.grid} />
          <div className={s.orb1} />
          <div className={s.orb2} />
        </div>

        {/* Full-screen 3D canvas */}
        <div className={s.canvas} ref={canvasRef}>
          <Suspense fallback={<div className={s.canvasFb} />}>
            <HexCore3D scrollProgress={sp} scrollVelocity={scrollVel} />
          </Suspense>
        </div>

        {/* Gradient overlay — makes text readable over 3D */}
        <div className={s.heroOverlay} />

        {/* Badge — top center */}
        <div className={s.heroTop} ref={badgeRef}>
          <div className={s.badge}>
            <span className={s.dot} />
            IT-Agentur · DACH-Region · DSGVO-konform
          </div>
        </div>

        {/* Text — bottom center */}
        <div className={s.heroText} ref={textRef}>
          <h1>
            Ihr digitaler Vorsprung<br />
            <span className={s.cyan}>beginnt hier.</span>
          </h1>

          <p className={s.heroSub}>
            Wir entwickeln leistungsstarke Websites, smarte Automatisierungen
            und KI-Chatbots — maßgeschneidert für KMUs in der DACH-Region.
          </p>

          <div className={s.btns}>
            <button className="btn-primary" onClick={() => go('kontakt')}>
              Kostenloses Erstgespräch
            </button>
            <button className="btn-ghost" onClick={() => go('services')}>
              Unsere Leistungen
            </button>
          </div>

          <div className={s.stats}>
            <div className={s.stat}>
              <span className={s.statN}>100%</span>
              <span className={s.statL}>DSGVO-konform</span>
            </div>
            <div className={s.statD} />
            <div className={s.stat}>
              <span className={s.statN}>DACH</span>
              <span className={s.statL}>Heimatmarkt</span>
            </div>
            <div className={s.statD} />
            <div className={s.stat}>
              <span className={s.statN}>3-in-1</span>
              <span className={s.statL}>Web · Auto · KI</span>
            </div>
          </div>
        </div>

        <div className={s.scrollHint}>
          <span>Scroll</span>
          <div className={s.scrollLine} />
        </div>
      </section>

      {/* ══ SERVICES ════════════════════════════════════ */}
      <section className={s.services} id="services" ref={svcRef}>
        <div className={s.inner}>
          <div className={s.sHead}>
            <p className="section-label">Was wir bieten</p>
            <h2>Drei Kernleistungen.<br />Ein Ansprechpartner.</h2>
            <p className={s.sub}>
              Kein Outsourcing, kein Wirrwarr aus verschiedenen Anbietern.
              Alles aus einer Hand — von der ersten Idee bis zum laufenden Betrieb.
            </p>
          </div>
          <div className={s.sGrid}>
            <div data-card=""><ServiceCard featured
              tag="Hauptleistung" title="Webdesign & Entwicklung"
              icon="M2 3h20v14H2z M8 21h8M12 17v4 M7 8h10M7 11h6"
              desc="Moderne, konversionsorientierte Websites, die Ihr Unternehmen professionell repräsentieren — rund um die Uhr für Sie im Einsatz."
              features={[
                'Individuelles Design ohne Templates',
                'Scroll-Animationen & interaktive Elemente',
                'Optimiert für Ladegeschwindigkeit & SEO',
                'CMS-Integration für einfache Pflege',
                'Responsive für alle Endgeräte',
              ]}
            /></div>
            <div data-card=""><ServiceCard
              tag="Effizienz" title="Prozessautomatisierung"
              icon="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5"
              desc="Wiederkehrende Aufgaben automatisieren, Workflows digitalisieren und Ihrem Team mehr Zeit für das Wesentliche verschaffen."
              features={[
                'E-Mail & Dokumenten-Automatisierung',
                'CRM- und Tool-Integrationen',
                'Digitale Formulare & Workflows',
                'Systemverbindungen ohne Code-Chaos',
              ]}
            /></div>
            <div data-card=""><ServiceCard
              tag="Kundenservice" title="KI-Chatbots"
              icon="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z M8 10h8M8 13h5"
              desc="Intelligente Chatbots, die Ihre Kunden rund um die Uhr betreuen — auf der Website, per WhatsApp oder im Backoffice."
              features={[
                'FAQ-Automatisierung & Lead-Qualifikation',
                'Mehrsprachige Kommunikation',
                'Integration in bestehende Systeme',
                'Übergabe an Mitarbeiter bei Bedarf',
              ]}
            /></div>
          </div>
        </div>
      </section>

      {/* ══ WHY ═════════════════════════════════════════ */}
      <section className={s.why} id="why" ref={whyRef}>
        <div className={s.inner}>
          <div className={s.whyGrid}>
            <div className={s.whyLeft}>
              <p className="section-label">Warum NexaCore</p>
              <h2>IT-Kompetenz,<br />die wirklich liefert.</h2>
              <p className={s.sub} style={{ marginTop: '1rem' }}>
                Wir sind kein Design-Studio mit KI-Buzzwords.
                Ein kleines IT-Team das versteht was es baut — und liefert was es verspricht.
              </p>
              <div className={s.whyPts}>
                {[
                  ['01','Echter IT-Hintergrund','Fundiertes Fachwissen statt schicker Präsentationen. Wir programmieren, was wir versprechen.'],
                  ['02','Mittelstand ist unsere Sprache','Keine Enterprise-Overhead-Kosten. Wir liefern, was KMUs wirklich brauchen — klar und direkt.'],
                  ['03','DSGVO & Datenschutz first','Hosting in der DACH-Region. Ihre Daten bleiben dort, wo sie hingehören.'],
                  ['04','Alles aus einer Hand','Ein Ansprechpartner für Web, Automatisierung und KI. Kein Ping-Pong zwischen Agenturen.'],
                ].map(([n, t, d]) => (
                  <div key={n} className={s.whyPt} data-why="">
                    <span className={s.whyN}>{n}</span>
                    <div>
                      <h4>{t}</h4>
                      <p>{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={s.processCard}>
              <p className={s.processLbl}>Unser Prozess</p>
              <Step num="1" title="Erstgespräch & Analyse"
                desc="Wir verstehen Ihr Unternehmen und Ihre Ziele — kostenlos und unverbindlich." />
              <Step num="2" title="Konzept & Angebot"
                desc="Klares Konzept, transparente Kosten — kein Kleingedrucktes." />
              <Step num="3" title="Entwicklung & Testing"
                desc="Agile Umsetzung mit regelmäßigen Updates. Sie sind immer im Bilde." />
              <Step num="4" title="Launch & Betreuung"
                desc="Wir begleiten Sie auch nach dem Launch — Support, Updates, Weiterentwicklung." />
            </div>
          </div>
        </div>
      </section>

      {/* ══ INDUSTRIES ══════════════════════════════════ */}
      <section className={s.ind}>
        <div className={s.inner}>
          <p className="section-label">Unsere Kunden</p>
          <h2 className={s.indTitle}>Für KMUs quer durch alle Branchen.</h2>
          <div className={s.indGrid}>
            {[
              ['Handel & Retail', 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10'],
              ['Handwerk & Gewerbe', 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z'],
              ['Gastronomie', 'M18 8h1a4 4 0 010 8h-1 M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z M6 1v3M10 1v3M14 1v3'],
              ['Gesundheit & Pflege', 'M22 12h-4l-3 9L9 3l-3 9H2'],
              ['Dienstleister', 'M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16'],
              ['Beratung & Recht', 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5'],
            ].map(([label, d]) => (
              <div key={label} className={s.indCard}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d={d} />
                </svg>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═════════════════════════════════════════ */}
      <div className={s.cta}>
        <div className={s.ctaBg} />
        <div className={s.ctaC}>
          <p className="section-label" style={{ textAlign: 'center' }}>Jetzt starten</p>
          <h2>Bereit für Ihren<br /><span className={s.cyan}>digitalen Vorsprung?</span></h2>
          <p>Kostenloses Erstgespräch — 30 Minuten, kein Druck, klare Antworten.</p>
          <button className="btn-primary"
            style={{ fontSize: '14px', padding: '14px 36px' }}
            onClick={() => go('kontakt')}>
            Gespräch vereinbaren →
          </button>
        </div>
      </div>

      {/* ══ CONTACT ═════════════════════════════════════ */}
      <section className={s.contact} id="kontakt">
        <div className={s.inner}>
          <div className={s.contactGrid}>
            <div>
              <p className="section-label">Kontakt</p>
              <h2 className={s.contactH}>Schreiben<br />Sie uns.</h2>
              <p className={s.sub}>Wir melden uns innerhalb von 24 Stunden.</p>
              <div className={s.cItems}>
                {[
                  { l: 'E-Mail', v: 'hello@nexacore.ai',
                    d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6' },
                  { l: 'Region', v: 'DACH-Region · Remote & vor Ort',
                    d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M15 10a3 3 0 11-6 0 3 3 0 016 0z' },
                  { l: 'Reaktionszeit', v: 'Innerhalb von 24 Stunden',
                    d: 'M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z M12 6v6l4 2' },
                ].map(({ l, v, d }) => (
                  <div key={l} className={s.cItem}>
                    <div className={s.cIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="#00F2FF" strokeWidth="1.7" strokeLinecap="round">
                        <path d={d} />
                      </svg>
                    </div>
                    <div>
                      <span className={s.cLbl}>{l}</span>
                      <p>{v}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form className={s.form} onSubmit={e => e.preventDefault()}>
              <div className={s.fRow}>
                <div className={s.fg}><label>Vorname</label><input type="text" placeholder="Max" /></div>
                <div className={s.fg}><label>Nachname</label><input type="text" placeholder="Mustermann" /></div>
              </div>
              <div className={s.fg}><label>E-Mail</label><input type="email" placeholder="max@musterfirma.de" /></div>
              <div className={s.fg}><label>Unternehmen</label><input type="text" placeholder="Muster GmbH" /></div>
              <div className={s.fg}>
                <label>Ich interessiere mich für</label>
                <select>
                  <option>Webdesign & Entwicklung</option>
                  <option>Prozessautomatisierung</option>
                  <option>KI-Chatbot</option>
                  <option>Kostenloses Erstgespräch</option>
                  <option>Alles davon</option>
                </select>
              </div>
              <div className={s.fg}>
                <label>Nachricht (optional)</label>
                <textarea placeholder="Kurze Beschreibung Ihres Projekts..." rows={4} />
              </div>
              <button type="submit" className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}>
                Anfrage absenden →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════ */}
      <footer className={s.footer}>
        <div className={s.fLogo}>
          <svg width="24" height="24" viewBox="0 0 34 34" fill="none">
            <polygon points="17,2 30,9.5 30,24.5 17,32 4,24.5 4,9.5"
              fill="none" stroke="#00F2FF" strokeWidth="1.4"/>
            <circle cx="17" cy="17" r="3.5" fill="#00F2FF"/>
          </svg>
          <span>Nexa<em>Core</em> AI</span>
        </div>
        <p className={s.fCopy}>© 2025 NexaCore AI · DACH-Region · DSGVO-konform</p>
        <nav className={s.fNav}>
          <a href="#hero">Impressum</a>
          <a href="#hero">Datenschutz</a>
          <a href="#hero">AGB</a>
        </nav>
      </footer>
    </div>
  )
}
