import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert, Menu, X, PhoneCall, Sun, Moon, Globe,
  User as UserIcon, LogOut, LayoutDashboard, PlusCircle
} from 'lucide-react';
import { useAuthStore } from '../../lib/store/authStore';
import { useThemeStore } from '../../lib/store/themeStore';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const navLinks = [
    { name: t('live_situation'), path: '/situation' },
    { name: t('official_alerts'), path: '/alerts' },
    { name: t('emergency_services'), path: '/emergency-services' },
    { name: t('shelters'), path: '/shelters' },
    { name: t('ngos'), path: '/ngos' },
    { name: t('volunteers'), path: '/volunteer' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-bg/90 backdrop-blur-md border-b border-border shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent p-0.5 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-surface rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-accent animate-pulse" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-text-primary block leading-none">
              DISASTER<span className="text-accent">360</span>
            </span>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest block">
              Response Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link text-sm font-medium ${
                location.pathname === link.path ? 'active text-accent' : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center bg-surface border border-border rounded-lg p-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-text-muted mx-1" />
            <button
              onClick={() => changeLanguage('en')}
              className={`px-1.5 py-0.5 rounded ${i18n.language === 'en' ? 'bg-primary text-white font-bold' : 'text-text-muted hover:text-text-primary'}`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('hi')}
              className={`px-1.5 py-0.5 rounded ${i18n.language === 'hi' ? 'bg-primary text-white font-bold' : 'text-text-muted hover:text-text-primary'}`}
            >
              HI
            </button>
            <button
              onClick={() => changeLanguage('te')}
              className={`px-1.5 py-0.5 rounded ${i18n.language === 'te' ? 'bg-primary text-white font-bold' : 'text-text-muted hover:text-text-primary'}`}
            >
              TE
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-border bg-surface text-text-secondary hover:text-text-primary transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-primary" />}
          </button>

          {/* Emergency SOS Call 112 */}
          <a
            href="tel:112"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger/15 border border-danger/40 text-danger text-xs font-bold hover:bg-danger hover:text-white transition-all shadow-sm"
            title="Call National Emergency Number 112"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
            <span>112 SOS</span>
          </a>

          {/* Report Incident CTA */}
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/report')}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            {t('report_incident')}
          </Button>

          {/* Auth Menu */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(user?.role === 'platform_admin' ? '/admin' : user?.role === 'field_responder' ? '/responder' : '/dashboard')}
                leftIcon={<LayoutDashboard className="w-4 h-4" />}
              >
                {t('dashboard')}
              </Button>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 text-text-muted hover:text-danger rounded-lg transition-colors"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                {t('login')}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="tel:112"
            className="px-2.5 py-1 rounded-md bg-danger text-white text-xs font-bold flex items-center gap-1"
          >
            <PhoneCall className="w-3 h-3" />
            112
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-border bg-surface text-text-primary"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface border-b border-border px-4 py-6 animate-slide-down shadow-2xl">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`py-2 text-base font-medium rounded-lg px-3 ${
                  location.pathname === link.path ? 'bg-primary/10 text-accent font-bold' : 'text-text-primary hover:bg-surface-2'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="border-t border-border pt-4 mt-2 flex flex-col gap-3">
              <Button
                variant="primary"
                onClick={() => navigate('/report')}
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="w-full"
              >
                {t('report_incident')}
              </Button>

              {isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    leftIcon={<LayoutDashboard className="w-4 h-4" />}
                    className="w-full"
                  >
                    {t('dashboard')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    leftIcon={<LogOut className="w-4 h-4" />}
                    className="w-full text-danger"
                  >
                    {t('logout')}
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
                    {t('login')}
                  </Button>
                  <Button variant="primary" onClick={() => navigate('/register')} className="w-full">
                    {t('register')}
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
