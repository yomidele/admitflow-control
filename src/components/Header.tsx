import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/apply', label: 'Apply Now' },
    { path: '/status', label: 'Check Status' },
    { path: '/admin', label: 'Admin' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold text-foreground">AdmitFlow</span>
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
          </nav>
        </div>
      )}
    </header>
  );
}
