export type ApplicationStatus = 
  | 'submitted'
  | 'under_review'
  | 'selection_pending'
  | 'admitted'
  | 'waitlisted'
  | 'rejected';

export type AdmissionType = 'regular' | 'early_decision' | 'transfer';

export interface Program {
  id: string;
  name: string;
  code: string;
  slots: number;
  cutoff: number;
  description: string;
}

export interface Application {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  programId: string;
  admissionType: AdmissionType;
  gpa: number;
  testScore: number;
  totalScore: number;
  status: ApplicationStatus;
  rank?: number;
  admissionRound?: number;
  scholarshipStatus?: 'eligible' | 'awarded' | 'not_eligible';
  submittedAt: string;
  updatedAt: string;
}

export interface SelectionRule {
  id: string;
  programId: string;
  round: number;
  cutoff: number;
  slots: number;
}

export interface SelectionRun {
  id: string;
  scheduledAt: string;
  executedAt?: string;
  status: 'scheduled' | 'running' | 'completed' | 'released';
  rounds: SelectionRound[];
  cutoffsUsed: Record<string, number>;
}

export interface SelectionRound {
  round: number;
  cutoff: number;
  candidatesSelected: number;
  slotsRemaining: number;
}

export interface AdminSettings {
  applicationDeadline: string;
  applicationsLocked: boolean;
  resultReleaseDate?: string;
  selectionScheduled?: string;
}
