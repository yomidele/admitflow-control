import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FeatureCard } from '@/components/FeatureCard';
import { CountdownTimer } from '@/components/CountdownTimer';
import { useAdmission } from '@/contexts/AdmissionContext';
import { 
  GraduationCap, 
  Shield, 
  Clock, 
  BarChart3, 
  Bell, 
  FileCheck,
  ArrowRight,
  CheckCircle2,
  Users,
  Award
} from 'lucide-react';

export default function Index() {
  const { adminSettings, programs } = useAdmission();

  const features = [
    {
      icon: Shield,
      title: 'Fair & Transparent',
      description: 'Automated selection based on predefined academic criteria. No human interference in ranking.',
    },
    {
      icon: Clock,
      title: 'Timely Process',
      description: 'Clear deadlines and scheduled result releases. Know exactly when to expect outcomes.',
    },
    {
      icon: BarChart3,
      title: 'Multi-Round Selection',
      description: 'Progressive cutoff system ensures maximum slots are filled fairly.',
    },
    {
      icon: Bell,
      title: 'Instant Notifications',
      description: 'Receive email updates at every stage of your application journey.',
    },
    {
      icon: FileCheck,
      title: 'Document Verification',
      description: 'Secure document upload with automated verification checks.',
    },
    {
      icon: Award,
      title: 'Scholarship Integration',
      description: 'Automatic scholarship consideration for qualifying candidates.',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Applications Processed' },
    { value: '5K+', label: 'Students Admitted' },
    { value: '15+', label: 'Programs Offered' },
    { value: '99.9%', label: 'System Uptime' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        </div>
        
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-in">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground backdrop-blur-sm">
                <GraduationCap className="h-4 w-4" />
                Admissions Open for 2026
              </span>
            </div>
            
            <h1 className="animate-slide-up mt-6 font-display text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl">
              Your Future Starts with a{' '}
              <span className="text-gradient-gold">Fair Admission</span>
            </h1>
            
            <p className="animate-slide-up mt-6 text-lg text-primary-foreground/80 md:text-xl">
              Experience a fully automated, transparent admission process. No bias, no delays — just merit-based selection with clear timelines.
            </p>
            
            <div className="animate-slide-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/apply">
                <Button variant="hero" size="xl">
                  Apply Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/status">
                <Button variant="heroOutline" size="xl">
                  Check Application Status
                </Button>
              </Link>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="animate-fade-in mt-16 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-8 backdrop-blur-sm">
            <CountdownTimer 
              targetDate={adminSettings.applicationDeadline} 
              label="Application Deadline" 
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-muted/30 py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-bold text-primary md:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Why Choose Our Admission System?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Built for fairness, designed for efficiency. Our automated system ensures every applicant is evaluated objectively.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Available Programs
            </h2>
            <p className="mt-4 text-muted-foreground">
              Choose from our diverse range of undergraduate and graduate programs.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <div
                key={program.id}
                className="rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {program.code}
                  </span>
                  <span className="text-sm text-muted-foreground">{program.slots} slots</span>
                </div>
                <h3 className="font-display text-lg font-semibold">{program.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{program.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Cutoff Score: {program.cutoff}+</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-muted-foreground">
              A simple, transparent process from application to admission.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              { step: 1, title: 'Submit Application', description: 'Fill out the online form with your academic details and documents.' },
              { step: 2, title: 'Application Review', description: 'Your application is locked and queued for the selection process.' },
              { step: 3, title: 'Automated Selection', description: 'Merit-based ranking with multi-round cutoff evaluation.' },
              { step: 4, title: 'Results Released', description: 'Receive your admission status and next steps via email.' },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground shadow-gold">
                  {item.step}
                </div>
                {index < 3 && (
                  <div className="absolute left-[calc(50%+40px)] top-8 hidden h-0.5 w-[calc(100%-80px)] bg-border md:block" />
                )}
                <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-hero-gradient py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              Ready to Begin Your Journey?
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Join thousands of successful applicants who trusted our fair, automated admission process.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/apply">
                <Button variant="hero" size="xl">
                  Start Your Application
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
