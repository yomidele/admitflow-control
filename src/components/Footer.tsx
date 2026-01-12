import { GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">AdmitFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Automated admission management system for fair, transparent, and efficient student selection.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/apply" className="hover:text-foreground transition-colors">Apply Now</a></li>
              <li><a href="/status" className="hover:text-foreground transition-colors">Check Status</a></li>
              <li><a href="/programs" className="hover:text-foreground transition-colors">Programs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Technical Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Admission Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8">
          <p className="text-center text-xs text-muted-foreground">
            <strong>Legal Disclaimer:</strong> Admission and scholarship decisions are generated automatically based on predefined academic criteria and released only on official result dates.
          </p>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} AdmitFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
