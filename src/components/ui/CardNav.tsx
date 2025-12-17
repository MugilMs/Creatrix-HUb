import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Logo } from './Logo';
import './CardNav.css';

interface NavLink {
  label: string;
  ariaLabel: string;
  href?: string;
}

interface NavItem {
  label: string;
  bgColor: string;
  textColor: string;
  links: NavLink[];
  href?: string;
}

interface CardNavProps {
  items: NavItem[];
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  ease?: string;
  onCtaClick?: () => void;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function CardNav({
  items,
  menuColor = '#000',
  buttonBgColor = '#111',
  buttonTextColor = '#fff',
  ease = 'power3.out',
  onCtaClick,
  ctaLabel = 'Get Started',
  ctaHref = '/login',
}: CardNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const navigate = useNavigate();

  const closedHeight = 60;
  const openHeight = typeof window !== 'undefined' && window.innerWidth <= 768 
    ? 60 + items.length * 80 + 16 
    : 280;

  useEffect(() => {
    if (!navRef.current || !contentRef.current) return;

    const cards = cardsRef.current.filter(Boolean);

    if (isOpen) {
      gsap.to(navRef.current, {
        height: openHeight,
        duration: 0.5,
        ease,
      });

      gsap.to(contentRef.current, {
        opacity: 1,
        duration: 0.3,
        delay: 0.1,
      });

      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, delay: 0.1 + i * 0.08, ease }
        );
      });
    } else {
      gsap.to(navRef.current, {
        height: closedHeight,
        duration: 0.4,
        ease,
      });

      gsap.to(contentRef.current, {
        opacity: 0,
        duration: 0.2,
      });

      cards.forEach((card) => {
        gsap.to(card, { y: 10, opacity: 0, duration: 0.2 });
      });
    }
  }, [isOpen, ease, openHeight]);

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else if (ctaHref) {
      navigate(ctaHref);
    }
  };

  return (
    <div className="card-nav-container">
      <nav
        ref={navRef}
        className={`card-nav ${isOpen ? 'open' : ''}`}
        style={{ height: closedHeight }}
      >
        <div className="card-nav-top">
          <div
            className={`hamburger-menu ${isOpen ? 'open' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            style={{ color: menuColor }}
            role="button"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </div>

          <Link to="/" className="logo-container" style={{ textDecoration: 'none' }}>
            <Logo size="sm" showText={true} />
          </Link>

          <button
            className="card-nav-cta-button"
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
            onClick={handleCtaClick}
          >
            {ctaLabel}
          </button>
        </div>

        <div ref={contentRef} className="card-nav-content" style={{ opacity: 0 }}>
          {items.map((item, index) => (
            <Link
              key={item.label}
              ref={(el) => { cardsRef.current[index] = el; }}
              to={item.href || '#'}
              className="nav-card"
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-card-label">{item.label}</span>
              <div className="nav-card-links">
                {item.links.map((link) => (
                  <span
                    key={link.label}
                    className="nav-card-link"
                    aria-label={link.ariaLabel}
                  >
                    {link.label}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
