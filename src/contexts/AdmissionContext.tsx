import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Application, ApplicationStatus, Program, AdminSettings, SelectionRun } from '@/types/admission';

interface AdmissionContextType {
  applications: Application[];
  programs: Program[];
  adminSettings: AdminSettings;
  currentSelectionRun: SelectionRun | null;
  addApplication: (app: Omit<Application, 'id' | 'status' | 'submittedAt' | 'updatedAt' | 'totalScore'>) => Application;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  updateAdminSettings: (settings: Partial<AdminSettings>) => void;
  triggerSelection: () => void;
  releaseResults: () => void;
  getApplicationByEmail: (email: string) => Application | undefined;
}

const defaultPrograms: Program[] = [
  { id: '1', name: 'Computer Science', code: 'CS', slots: 100, cutoff: 180, description: 'Bachelor of Science in Computer Science' },
  { id: '2', name: 'Business Administration', code: 'BA', slots: 150, cutoff: 170, description: 'Bachelor of Business Administration' },
  { id: '3', name: 'Engineering', code: 'ENG', slots: 80, cutoff: 185, description: 'Bachelor of Engineering' },
  { id: '4', name: 'Medicine', code: 'MED', slots: 50, cutoff: 195, description: 'Doctor of Medicine' },
  { id: '5', name: 'Law', code: 'LAW', slots: 60, cutoff: 175, description: 'Bachelor of Laws' },
];

const defaultSettings: AdminSettings = {
  applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  applicationsLocked: false,
};

const AdmissionContext = createContext<AdmissionContextType | undefined>(undefined);

export function AdmissionProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [programs] = useState<Program[]>(defaultPrograms);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(defaultSettings);
  const [currentSelectionRun, setCurrentSelectionRun] = useState<SelectionRun | null>(null);

  const addApplication = (app: Omit<Application, 'id' | 'status' | 'submittedAt' | 'updatedAt' | 'totalScore'>) => {
    const totalScore = (app.gpa * 25) + app.testScore;
    const newApp: Application = {
      ...app,
      id: crypto.randomUUID(),
      totalScore,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setApplications(prev => [...prev, newApp]);
    return newApp;
  };

  const updateApplicationStatus = (id: string, status: ApplicationStatus) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, status, updatedAt: new Date().toISOString() } : app
    ));
  };

  const updateAdminSettings = (settings: Partial<AdminSettings>) => {
    setAdminSettings(prev => ({ ...prev, ...settings }));
  };

  const getApplicationByEmail = (email: string) => {
    return applications.find(app => app.email.toLowerCase() === email.toLowerCase());
  };

  const triggerSelection = () => {
    // Lock applications
    setAdminSettings(prev => ({ ...prev, applicationsLocked: true }));

    // Run multi-round selection
    const rounds: { round: number; cutoff: number; candidatesSelected: number; slotsRemaining: number }[] = [];
    const cutoffs = [180, 170, 160, 150];
    
    let updatedApps = [...applications];
    
    programs.forEach(program => {
      let slotsRemaining = program.slots;
      const programApps = updatedApps
        .filter(app => app.programId === program.id && app.status === 'submitted')
        .sort((a, b) => b.totalScore - a.totalScore);

      cutoffs.forEach((cutoff, roundIndex) => {
        if (slotsRemaining <= 0) return;

        const eligibleApps = programApps.filter(app => 
          app.totalScore >= cutoff && 
          !updatedApps.find(ua => ua.id === app.id && (ua.status === 'admitted' || ua.status === 'waitlisted'))
        );

        eligibleApps.slice(0, slotsRemaining).forEach((app, index) => {
          updatedApps = updatedApps.map(ua => 
            ua.id === app.id 
              ? { 
                  ...ua, 
                  status: 'selection_pending' as ApplicationStatus, 
                  rank: index + 1,
                  admissionRound: roundIndex + 1,
                  scholarshipStatus: app.totalScore >= 190 ? 'eligible' : 'not_eligible'
                }
              : ua
          );
          slotsRemaining--;
        });

        rounds.push({
          round: roundIndex + 1,
          cutoff,
          candidatesSelected: eligibleApps.slice(0, slotsRemaining + eligibleApps.length).length,
          slotsRemaining
        });
      });

      // Mark remaining as waitlisted
      programApps.forEach(app => {
        const current = updatedApps.find(ua => ua.id === app.id);
        if (current && current.status === 'submitted') {
          updatedApps = updatedApps.map(ua =>
            ua.id === app.id ? { ...ua, status: 'selection_pending' as ApplicationStatus } : ua
          );
        }
      });
    });

    setApplications(updatedApps);
    setCurrentSelectionRun({
      id: crypto.randomUUID(),
      scheduledAt: new Date().toISOString(),
      executedAt: new Date().toISOString(),
      status: 'completed',
      rounds,
      cutoffsUsed: { default: 180 }
    });
  };

  const releaseResults = () => {
    setApplications(prev => prev.map(app => {
      if (app.status === 'selection_pending') {
        const program = programs.find(p => p.id === app.programId);
        if (app.rank && program && app.rank <= program.slots) {
          return { 
            ...app, 
            status: 'admitted' as ApplicationStatus,
            scholarshipStatus: app.totalScore >= 190 ? 'awarded' : 'not_eligible'
          };
        } else if (app.totalScore >= 150) {
          return { ...app, status: 'waitlisted' as ApplicationStatus };
        }
        return { ...app, status: 'rejected' as ApplicationStatus };
      }
      return app;
    }));

    if (currentSelectionRun) {
      setCurrentSelectionRun({ ...currentSelectionRun, status: 'released' });
    }
    setAdminSettings(prev => ({ ...prev, resultReleaseDate: new Date().toISOString() }));
  };

  return (
    <AdmissionContext.Provider value={{
      applications,
      programs,
      adminSettings,
      currentSelectionRun,
      addApplication,
      updateApplicationStatus,
      updateAdminSettings,
      triggerSelection,
      releaseResults,
      getApplicationByEmail,
    }}>
      {children}
    </AdmissionContext.Provider>
  );
}

export function useAdmission() {
  const context = useContext(AdmissionContext);
  if (context === undefined) {
    throw new Error('useAdmission must be used within an AdmissionProvider');
  }
  return context;
}
