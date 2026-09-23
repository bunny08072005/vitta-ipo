import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/?tab=upcoming', label: 'Upcoming' },
    { to: '/?tab=open', label: 'Open' },
    { to: '/?tab=listed', label: 'Listed' },
    { to: '/?tab=sme', label: 'SME' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="nav-logo" id="nav-logo">
          <img src="/logo.svg" alt="Vitta" className="logo-img" />
          <span className="logo-text">Vitta</span>
          <span className="logo-sub">IPO</span>
        </Link>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {links.map(link => (
            <Link key={link.label} to={link.to}
              className={`nav-link ${location.pathname + location.search === link.to ? 'active' : ''}`}
              id={`nav-${link.label.toLowerCase()}`}>
              {link.label}
            </Link>
          ))}
          <button className="theme-toggle mobile-only" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        <div className="nav-right">
          <button className="theme-toggle desktop-only" onClick={toggleTheme} aria-label="Toggle theme" id="theme-toggle">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
