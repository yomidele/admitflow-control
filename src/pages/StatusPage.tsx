import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StatusBadge } from '@/components/StatusBadge';
import { AdmissionLetter } from '@/components/AdmissionLetter';
import { generateAdmissionLetterPDF } from '@/lib/generatePdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Search, FileText, Calendar, Award, Download, AlertCircle, Eye, Loader2 } from 'lucide-react';

export default function StatusPage() {
  const location = useLocation();
  const [email, setEmail] = useState((location.state as { email?: string })?.email || '');
  const [searchedEmail, setSearchedEmail] = useState((location.state as { email?: string })?.email || '');
  const [showLetterPreview, setShowLetterPreview] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Fetch application by email
  const { data: application, isLoading } = useQuery({
    queryKey: ['application-status', searchedEmail],
    queryFn: async () => {
      if (!searchedEmail) return null;
      
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          programs:program_id (
            id,
            name,
            code,
            slots,
            cutoff
          )
        `)
        .eq('email', searchedEmail.toLowerCase())
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!searchedEmail,
  });

  // Fetch admin settings
  const { data: adminSettings } = useQuery({
    queryKey: ['admin-settings-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('result_release_date')
        .single();
      
      if (error && error.code !== 'PGRST116') return null;
      return data;
    },
  });

  const handleSearch = () => {
    setSearchedEmail(email.trim().toLowerCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusMessage = () => {
    if (!application) return null;

    switch (application.status) {
      case 'submitted':
      case 'under_review':
        return {
          type: 'info',
          message: 'Your application is under review. Results will be announced on the official result date.',
        };
      case 'selection_pending':
        return {
          type: 'warning',
          message: `Processing results. Results will be released on ${adminSettings?.result_release_date ? formatDate(adminSettings.result_release_date) : 'the scheduled date'}.`,
        };
      case 'admitted':
        return {
          type: 'success',
          message: `Congratulations! You have been admitted to ${application.programs?.name}. ${application.scholarship_status === 'awarded' ? 'You have also been awarded a scholarship!' : ''}`,
        };
      case 'waitlisted':
        return {
          type: 'warning',
          message: 'You have been placed on the waitlist. You will be notified if a seat becomes available.',
        };
      case 'rejected':
        return {
          type: 'error',
          message: 'Unfortunately, your application was not successful this time. We encourage you to apply again next year.',
        };
      default:
        return null;
    }
  };

  const handleDownloadPDF = async () => {
    if (!application || !application.matriculation_number) {
      return;
    }

    setGeneratingPdf(true);
    try {
      const pdfBlob = await generateAdmissionLetterPDF({
        studentName: application.full_name,
        programName: application.programs?.name || 'Unknown Program',
        programCode: application.programs?.code || 'N/A',
        matriculationNumber: application.matriculation_number,
        passportPhotoUrl: application.passport_photo_url,
        admissionRound: application.admission_round,
        scholarshipStatus: application.scholarship_status,
        dateOfAdmission: application.updated_at || new Date().toISOString(),
      });

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Admission_Letter_${application.matriculation_number.replace(/\//g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold md:text-4xl">Check Application Status</h1>
            <p className="mt-2 text-muted-foreground">
              Enter your email address to view your application status
            </p>
          </div>

          <Card className="mb-8 shadow-card">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="email" className="sr-only">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {searchedEmail && !application && !isLoading && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p>No application found for this email address. Please check your email and try again.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {application && (
            <>
              {/* Status Alert */}
              {statusMessage && (
                <Card className={`mb-6 ${
                  statusMessage.type === 'success' ? 'border-success/20 bg-success/5' :
                  statusMessage.type === 'warning' ? 'border-warning/20 bg-warning/5' :
                  statusMessage.type === 'error' ? 'border-destructive/20 bg-destructive/5' :
                  'border-info/20 bg-info/5'
                }`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className={`h-5 w-5 ${
                        statusMessage.type === 'success' ? 'text-success' :
                        statusMessage.type === 'warning' ? 'text-warning' :
                        statusMessage.type === 'error' ? 'text-destructive' :
                        'text-info'
                      }`} />
                      <p className="font-medium">{statusMessage.message}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Application Details */}
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Application Details
                      </CardTitle>
                      <CardDescription>
                        Application ID: {application.id.slice(0, 8).toUpperCase()}
                      </CardDescription>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-6">
                    {application.passport_photo_url && (
                      <div className="flex-shrink-0">
                        <img
                          src={application.passport_photo_url}
                          alt="Passport photo"
                          className="h-32 w-24 rounded-lg object-cover shadow-md"
                        />
                      </div>
                    )}
                    
                    <div className="grid flex-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{application.full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{application.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Program</p>
                        <p className="font-medium">{application.programs?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Admission Type</p>
                        <p className="font-medium capitalize">{application.admission_type?.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Score</p>
                        <p className="font-semibold text-accent-foreground">{application.total_score}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Submitted On</p>
                        <p className="font-medium">{formatDate(application.submitted_at)}</p>
                      </div>

                      {application.matriculation_number && application.status === 'admitted' && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-muted-foreground">Matriculation Number</p>
                          <p className="font-bold text-primary text-lg">{application.matriculation_number}</p>
                        </div>
                      )}

                      {application.rank && application.status === 'admitted' && (
                        <div>
                          <p className="text-sm text-muted-foreground">Merit Rank</p>
                          <p className="font-semibold">#{application.rank}</p>
                        </div>
                      )}

                      {application.admission_round && (
                        <div>
                          <p className="text-sm text-muted-foreground">Admission Round</p>
                          <p className="font-medium">Round {application.admission_round}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scholarship Status */}
                  {application.scholarship_status && application.status === 'admitted' && (
                    <div className="mt-6 rounded-lg border border-accent/20 bg-accent/5 p-4">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-semibold">Scholarship Status</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {application.scholarship_status === 'awarded' 
                              ? 'Congratulations! You have been awarded a merit scholarship.'
                              : application.scholarship_status === 'eligible'
                              ? 'You are eligible for scholarship consideration.'
                              : 'Not eligible for scholarship.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Download/View Admission Letter */}
                  {application.status === 'admitted' && application.matriculation_number && (
                    <div className="mt-6 flex gap-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowLetterPreview(true)}
                      >
                        <Eye className="h-4 w-4" />
                        View Admission Letter
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={handleDownloadPDF}
                        disabled={generatingPdf}
                      >
                        {generatingPdf ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Download PDF
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="mt-6 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Application Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground">
                        ✓
                      </div>
                      <div>
                        <p className="font-medium">Application Submitted</p>
                        <p className="text-sm text-muted-foreground">{formatDate(application.submitted_at)}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        application.status !== 'submitted' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {application.status !== 'submitted' ? '✓' : '2'}
                      </div>
                      <div>
                        <p className="font-medium">Under Review</p>
                        <p className="text-sm text-muted-foreground">Application being processed</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        ['admitted', 'waitlisted', 'rejected'].includes(application.status) 
                          ? 'bg-success text-success-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {['admitted', 'waitlisted', 'rejected'].includes(application.status) ? '✓' : '3'}
                      </div>
                      <div>
                        <p className="font-medium">Results Announced</p>
                        <p className="text-sm text-muted-foreground">
                          {['admitted', 'waitlisted', 'rejected'].includes(application.status)
                            ? formatDate(application.updated_at)
                            : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      {/* Admission Letter Preview Modal */}
      <Dialog open={showLetterPreview} onOpenChange={setShowLetterPreview}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Admission Letter
            </DialogTitle>
            <DialogDescription>
              Your official admission letter
            </DialogDescription>
          </DialogHeader>
          
          {application && (
            <>
              <div className="border rounded-lg overflow-hidden">
                <AdmissionLetter
                  studentName={application.full_name}
                  programName={application.programs?.name || 'Unknown Program'}
                  programCode={application.programs?.code || 'N/A'}
                  matriculationNumber={application.matriculation_number || 'N/A'}
                  passportPhotoUrl={application.passport_photo_url}
                  admissionRound={application.admission_round}
                  scholarshipStatus={application.scholarship_status}
                  dateOfAdmission={application.updated_at || new Date().toISOString()}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowLetterPreview(false)}>
                  Close
                </Button>
                <Button 
                  onClick={handleDownloadPDF}
                  disabled={generatingPdf}
                >
                  {generatingPdf ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
