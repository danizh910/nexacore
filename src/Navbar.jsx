// Navbar.jsx
import { useEffect, useState } from 'react'
import s from './Navbar.module.css'

function Logo() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <polygon points="17,2 30,9.5 30,24.5 17,32 4,24.5 4,9.5"
        fill="none" stroke="#00F2FF" strokeWidth="1.4"/>
      <polygon points="17,8 25,12.5 25,21.5 17,26 9,21.5 9,12.5"
        fill="none" stroke="#8A2BE2" strokeWidth="1.1" opacity="0.7"/>
      <circle cx="17" cy="17" r="3.5" fill="#00F2FF"/>
      {[0,1,2,3,4,5].map(i => {
        const a = (Math.PI / 3) * i - Math.PI / 6
        return (
          <line key={i}
            x1={17 + Math.cos(a) * 8} y1={17 + Math.sin(a) * 8}
            x2={17 + Math.cos(a) * 3.5} y2={17 + Math.sin(a) * 3.5}
            stroke="#00F2FF" strokeWidth="0.9" opacity="0.45"
          />
        )
      })}
    </svg>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const go = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <nav className={`${s.nav} ${scrolled ? s.scrolled : ''}`}>
      <div className={s.logo}>
        <Logo />
        <span>Nexa<em>Core</em> AI</span>
      </div>

      <ul className={`${s.links} ${open ? s.open : ''}`}>
        {[
          ['services', 'Services'],
          ['why', 'Über uns'],
          ['kontakt', 'Kontakt'],
        ].map(([id, label]) => (
          <li key={id}>
            <button onClick={() => go(id)}>{label}</button>
          </li>
        ))}
      </ul>

      <button className={s.cta} onClick={() => go('kontakt')}>
        Erstgespräch anfragen
      </button>

      <button
        className={s.burger}
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <span style={{ transform: open ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
        <span style={{ opacity: open ? 0 : 1 }} />
        <span style={{ transform: open ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
      </button>
    </nav>
  )
}
