import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface AdmissionLetterData {
  studentName: string;
  programName: string;
  programCode: string;
  matriculationNumber: string;
  passportPhotoUrl?: string;
  admissionRound?: number;
  scholarshipStatus?: string;
  dateOfAdmission: string;
}

export async function generateAdmissionLetterPDF(data: AdmissionLetterData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = 20;

  const academicYear = new Date().getFullYear();
  const formattedDate = format(new Date(data.dateOfAdmission), 'MMMM d, yyyy');

  // Header
  doc.setFillColor(30, 58, 138); // Primary color
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AdmitFlow University', pageWidth / 2, 18, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Excellence in Education Since 1950', pageWidth / 2, 28, { align: 'center' });

  y = 50;

  // Title
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('LETTER OF ADMISSION', pageWidth / 2, y, { align: 'center' });
  
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(`Academic Year ${academicYear}/${academicYear + 1}`, pageWidth / 2, y, { align: 'center' });

  y += 15;

  // Student Details Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 45, 3, 3, 'FD');

  // Photo placeholder area
  const photoX = margin + 5;
  const photoY = y + 5;
  const photoWidth = 25;
  const photoHeight = 35;

  doc.setFillColor(229, 231, 235);
  doc.rect(photoX, photoY, photoWidth, photoHeight, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('PHOTO', photoX + photoWidth / 2, photoY + photoHeight / 2 + 2, { align: 'center' });

  // Student Info
  const infoX = photoX + photoWidth + 10;
  let infoY = y + 10;

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text('Student Name:', infoX, infoY);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(data.studentName, infoX + 30, infoY);

  infoY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Matriculation No:', infoX, infoY);
  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.text(data.matriculationNumber, infoX + 35, infoY);

  infoY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Program:', infoX, infoY);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(data.programName, infoX + 20, infoY);

  // Right column
  const rightX = pageWidth / 2 + 10;
  infoY = y + 10;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Dept. Code:', rightX, infoY);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(data.programCode, rightX + 25, infoY);

  infoY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Round:', rightX, infoY);
  doc.setTextColor(0, 0, 0);
  doc.text(`Round ${data.admissionRound || 1}`, rightX + 15, infoY);

  infoY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Date:', rightX, infoY);
  doc.setTextColor(0, 0, 0);
  doc.text(formattedDate, rightX + 12, infoY);

  y += 55;

  // Letter Body
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const letterLines = [
    `Dear ${data.studentName},`,
    '',
    `We are pleased to inform you that you have been offered admission to AdmitFlow University for the ${academicYear}/${academicYear + 1} academic session.`,
    '',
    `You have been admitted to the ${data.programName} program in the Faculty of Sciences and Technology. Your unique matriculation number is ${data.matriculationNumber}. Please keep this number safe as it will be required for all academic transactions throughout your time at the university.`,
  ];

  letterLines.forEach(line => {
    if (line === '') {
      y += 5;
    } else {
      const splitLines = doc.splitTextToSize(line, contentWidth);
      splitLines.forEach((splitLine: string) => {
        doc.text(splitLine, margin, y);
        y += 6;
      });
    }
  });

  // Scholarship Notice
  if (data.scholarshipStatus === 'awarded') {
    y += 5;
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(217, 119, 6);
    doc.roundedRect(margin, y, contentWidth, 15, 2, 2, 'FD');
    
    doc.setTextColor(146, 64, 14);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const scholarshipText = '🎓 Congratulations! You have been awarded a Merit Scholarship based on your outstanding academic performance.';
    const scholarshipLines = doc.splitTextToSize(scholarshipText, contentWidth - 10);
    scholarshipLines.forEach((line: string, index: number) => {
      doc.text(line, margin + 5, y + 6 + index * 5);
    });
    y += 20;
  }

  y += 5;

  // Requirements
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  const requirementsIntro = 'Please proceed to complete your registration by visiting the Admissions Office with the following documents:';
  const reqIntroLines = doc.splitTextToSize(requirementsIntro, contentWidth);
  reqIntroLines.forEach((line: string) => {
    doc.text(line, margin, y);
    y += 6;
  });

  y += 3;
  const requirements = [
    '• Original copy of this admission letter',
    '• Original and photocopy of your academic credentials',
    '• Birth certificate or age declaration',
    '• Valid identification document',
    '• Four (4) passport-sized photographs',
    '• Medical fitness certificate',
  ];

  requirements.forEach(req => {
    doc.text(req, margin + 5, y);
    y += 6;
  });

  y += 5;

  const closingLines = [
    'Registration for new students commences on the first Monday of the new academic session. Failure to register within the stipulated period may result in forfeiture of this admission.',
    '',
    'Once again, congratulations on your admission! We look forward to welcoming you to our academic community.',
  ];

  closingLines.forEach(line => {
    if (line === '') {
      y += 5;
    } else {
      const splitLines = doc.splitTextToSize(line, contentWidth);
      splitLines.forEach((splitLine: string) => {
        doc.text(splitLine, margin, y);
        y += 6;
      });
    }
  });

  y += 15;

  // Signatures
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 50, y);
  doc.line(pageWidth - margin - 50, y, pageWidth - margin, y);

  y += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Prof. James O. Williams', margin, y);
  doc.text('Dr. Sarah M. Johnson', pageWidth - margin, y, { align: 'right' });

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Registrar', margin, y);
  doc.text('Director of Admissions', pageWidth - margin, y, { align: 'right' });

  // Footer
  y = doc.internal.pageSize.getHeight() - 25;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);

  y += 8;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    'AdmitFlow University • 123 Academic Avenue, Education City • Tel: +1 (555) 123-4567 • Email: admissions@admitflow.edu',
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  y += 5;
  doc.setFont('helvetica', 'italic');
  doc.text(
    '"This is a computer-generated admission letter and is valid without signature."',
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  y += 5;
  doc.setFont('helvetica', 'normal');
  const verificationCode = `Verification Code: AF-${data.matriculationNumber.replace(/\//g, '-')}-${academicYear}`;
  doc.text(verificationCode, pageWidth / 2, y, { align: 'center' });

  return doc.output('blob');
}
