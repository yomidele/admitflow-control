import { forwardRef } from 'react';
import { format } from 'date-fns';
import schoolLogo from '@/assets/school-logo.png';
import approvalStamp from '@/assets/approval-stamp.png';
import registrarSignature from '@/assets/registrar-signature.png';
import directorSignature from '@/assets/director-signature.png';

// School Information
const SCHOOL_NAME = "Greenfield Metropolitan University";
const SCHOOL_MOTTO = "Excellence Through Knowledge";
const SCHOOL_ADDRESS = "42 University Boulevard, Greenfield City, GC 10001";
const SCHOOL_PHONE = "+234 (801) 234-5678";
const SCHOOL_EMAIL = "admissions@greenfield.edu.ng";

interface AdmissionLetterProps {
  studentName: string;
  programName: string;
  programCode: string;
  matriculationNumber: string;
  passportPhotoUrl?: string;
  admissionRound?: number;
  scholarshipStatus?: string;
  dateOfAdmission: string;
}

export const AdmissionLetter = forwardRef<HTMLDivElement, AdmissionLetterProps>(({
  studentName,
  programName,
  programCode,
  matriculationNumber,
  passportPhotoUrl,
  admissionRound,
  scholarshipStatus,
  dateOfAdmission,
}, ref) => {
  const formattedDate = format(new Date(dateOfAdmission), 'MMMM d, yyyy');
  const academicYear = new Date().getFullYear();

  return (
    <div 
      ref={ref}
      className="relative mx-auto max-w-[800px] bg-white p-8 text-black overflow-hidden"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      {/* Watermark */}
      <div 
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <img 
          src={schoolLogo} 
          alt=""
          className="h-[500px] w-[500px] object-contain opacity-[0.04]"
        />
      </div>

      {/* Header with Logo */}
      <div className="mb-8 border-b-4 border-primary pb-6 text-center">
        <div className="flex items-center justify-center gap-6">
          <img 
            src={schoolLogo} 
            alt={`${SCHOOL_NAME} Logo`}
            className="h-24 w-24 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-primary md:text-3xl">{SCHOOL_NAME}</h1>
            <p className="mt-1 text-sm italic text-gray-600">"{SCHOOL_MOTTO}"</p>
            <p className="mt-1 text-xs text-gray-500">Established 1965</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-wide text-primary">
          Letter of Admission
        </h2>
        <p className="mt-2 text-gray-600">Academic Year {academicYear}/{academicYear + 1}</p>
      </div>

      {/* Photo and Details */}
      <div className="mb-8 flex gap-8">
        {/* Student Photo */}
        <div className="flex-shrink-0">
          {passportPhotoUrl ? (
            <img
              src={passportPhotoUrl}
              alt="Student passport photo"
              className="h-40 w-32 rounded border-2 border-gray-300 object-cover shadow-md"
            />
          ) : (
            <div className="flex h-40 w-32 items-center justify-center rounded border-2 border-gray-300 bg-gray-100">
              <span className="text-4xl text-gray-400">👤</span>
            </div>
          )}
        </div>

        {/* Student Info */}
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Student Name</p>
              <p className="font-semibold">{studentName}</p>
            </div>
            <div>
              <p className="text-gray-500">Matriculation Number</p>
              <p className="font-semibold text-primary">{matriculationNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Program of Study</p>
              <p className="font-semibold">{programName}</p>
            </div>
            <div>
              <p className="text-gray-500">Department Code</p>
              <p className="font-semibold">{programCode}</p>
            </div>
            <div>
              <p className="text-gray-500">Admission Round</p>
              <p className="font-semibold">Round {admissionRound || 1}</p>
            </div>
            <div>
              <p className="text-gray-500">Date of Admission</p>
              <p className="font-semibold">{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Letter Body */}
      <div className="mb-8 space-y-4 text-justify leading-relaxed">
        <p>Dear <strong>{studentName}</strong>,</p>
        
        <p>
          We are pleased to inform you that you have been offered admission to 
          <strong> {SCHOOL_NAME}</strong> for the <strong>{academicYear}/{academicYear + 1}</strong> academic session.
        </p>

        <p>
          You have been admitted to the <strong>{programName}</strong> program in the 
          Faculty of Sciences and Technology. Your unique matriculation number is 
          <strong> {matriculationNumber}</strong>. Please keep this number safe as it 
          will be required for all academic transactions throughout your time at the university.
        </p>

        {scholarshipStatus === 'awarded' && (
          <div className="my-4 rounded-lg border-2 border-accent bg-accent/10 p-4">
            <p className="font-semibold text-accent-foreground">
              🎓 Congratulations! You have been awarded a Merit Scholarship based on your 
              outstanding academic performance. Details of your scholarship package will be 
              communicated separately.
            </p>
          </div>
        )}

        <p>
          Please proceed to complete your registration by visiting the Admissions Office 
          with the following documents:
        </p>

        <ul className="ml-4 list-inside list-disc space-y-1">
          <li>Original copy of this admission letter</li>
          <li>Original and photocopy of your academic credentials</li>
          <li>Birth certificate or age declaration</li>
          <li>Valid identification document</li>
          <li>Four (4) passport-sized photographs</li>
          <li>Medical fitness certificate</li>
        </ul>

        <p>
          Registration for new students commences on the first Monday of the new academic session.
          Failure to register within the stipulated period may result in forfeiture of this admission.
        </p>

        <p>
          Once again, congratulations on your admission! We look forward to welcoming you 
          to our academic community.
        </p>
      </div>

      {/* Signatures with Blue Ink */}
      <div className="relative mb-8">
        <div className="flex justify-between">
          <div className="text-center">
            <img 
              src={registrarSignature} 
              alt="Registrar Signature"
              className="mx-auto h-16 w-auto object-contain"
            />
            <div className="mt-1 w-48 border-t border-gray-400"></div>
            <p className="mt-2 font-semibold">Prof. James O. Williams</p>
            <p className="text-sm text-gray-600">Registrar</p>
          </div>
          
          {/* Approval Stamp - positioned in center-right */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 rotate-[-8deg] opacity-90">
            <img 
              src={approvalStamp} 
              alt="Approval Stamp"
              className="h-28 w-28 object-contain"
            />
          </div>
          
          <div className="text-center">
            <img 
              src={directorSignature} 
              alt="Director Signature"
              className="mx-auto h-16 w-auto object-contain"
            />
            <div className="mt-1 w-48 border-t border-gray-400"></div>
            <p className="mt-2 font-semibold">Dr. Sarah M. Johnson</p>
            <p className="text-sm text-gray-600">Director of Admissions</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-4 text-center text-xs text-gray-500">
        <p className="font-semibold text-gray-700">{SCHOOL_NAME}</p>
        <p className="mt-1">
          {SCHOOL_ADDRESS} • Tel: {SCHOOL_PHONE} • Email: {SCHOOL_EMAIL}
        </p>
        <p className="mt-2">
          Verification Code: GMU-{matriculationNumber.replace(/\//g, '-')}-{academicYear}
        </p>
      </div>
    </div>
  );
});

AdmissionLetter.displayName = 'AdmissionLetter';
