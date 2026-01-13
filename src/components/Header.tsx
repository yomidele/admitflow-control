import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';
import schoolLogo from '@/assets/school-logo.png';

// School Information - centralized for consistency
export const SCHOOL_NAME = "Greenfield Metropolitan University";
export const SCHOOL_SHORT_NAME = "GMU";

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/apply', label: 'Apply Now' },
    { path: '/status', label: 'Check Status' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <img 
            src={schoolLogo} 
            alt={`${SCHOOL_NAME} Logo`}
            className="h-12 w-12 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold text-foreground">{SCHOOL_SHORT_NAME}</span>
            <span className="text-xs text-muted-foreground">Admission Portal</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path}>
              <Button
                variant={isActive(link.path) ? 'secondary' : 'ghost'}
                size="sm"
                className={isActive(link.path) ? 'font-medium' : ''}
              >
                {link.label}
              </Button>
            </Link>
          ))}
          <div className="ml-2 border-l border-border pl-3">
            <Link to="/admin/login">
              <Button
                variant={location.pathname.startsWith('/admin') ? 'default' : 'outline'}
                size="sm"
                className="gap-1.5"
              >
                <Shield className="h-4 w-4" />
                Admin Portal
              </Button>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border md:hidden">
          <nav className="container flex flex-col gap-2 py-4">
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={isActive(link.path) ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            <div className="mt-2 border-t border-border pt-2">
              <Link 
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={location.pathname.startsWith('/admin') ? 'default' : 'outline'}
                  className="w-full justify-start gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Admin Portal
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
