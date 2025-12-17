import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import CardNav from '../ui/CardNav';
import { useAuthStore } from '../../store/authStore';

export const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { user } = useAuthStore();

  const navItems = [
    {
      label: 'Explore',
      bgColor: '#5227FF',
      textColor: '#fff',
      href: '/explore',
      links: [
        { label: 'All Creators', ariaLabel: 'Browse all creators' },
        { label: 'Featured', ariaLabel: 'Featured creators' },
      ],
    },
    {
      label: 'Categories',
      bgColor: '#7C3AED',
      textColor: '#fff',
      href: '/categories',
      links: [
        { label: 'Art & Design', ariaLabel: 'Art and Design category' },
        { label: 'Technology', ariaLabel: 'Technology category' },
        { label: 'Music', ariaLabel: 'Music category' },
      ],
    },
    {
      label: 'Trending',
      bgColor: '#FF9FFC',
      textColor: '#000',
      href: '/trending',
      links: [
        { label: 'This Week', ariaLabel: 'Trending this week' },
        { label: 'Rising Stars', ariaLabel: 'Rising star creators' },
      ],
    },
  ];

  // Determine CTA based on user status
  const ctaConfig = user
    ? { label: 'Dashboard', href: '/dashboard' }
    : { label: 'Get Started', href: '/login' };

  return (
    <div className={`min-h-screen ${isHomePage ? 'bg-transparent' : 'bg-gray-50'}`}>
      {isHomePage ? (
        <CardNav
          items={navItems}
          menuColor="#1F2937"
          buttonBgColor="#5227FF"
          buttonTextColor="#fff"
          ease="power3.out"
          ctaLabel={ctaConfig.label}
          ctaHref={ctaConfig.href}
        />
      ) : (
        <Navbar transparent={false} />
      )}
      <main>
        <Outlet />
      </main>
    </div>
  );
};
