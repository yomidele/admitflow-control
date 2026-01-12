import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmission } from '@/contexts/AdmissionContext';
import { Search, FileText, Calendar, Award, Download, AlertCircle } from 'lucide-react';

export default function StatusPage() {
  const location = useLocation();
  const { getApplicationByEmail, programs, adminSettings } = useAdmission();
  const [email, setEmail] = useState((location.state as { email?: string })?.email || '');
  const [searchedEmail, setSearchedEmail] = useState('');
  const application = searchedEmail ? getApplicationByEmail(searchedEmail) : null;

  const handleSearch = () => {
    setSearchedEmail(email.trim());
  };

  const selectedProgram = application ? programs.find(p => p.id === application.programId) : null;

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
          message: `Processing results. Results will be released on ${adminSettings.resultReleaseDate ? formatDate(adminSettings.resultReleaseDate) : 'the scheduled date'}.`,
        };
      case 'admitted':
        return {
          type: 'success',
          message: `Congratulations! You have been admitted to ${selectedProgram?.name}. ${application.scholarshipStatus === 'awarded' ? 'You have also been awarded a scholarship!' : ''}`,
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
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {searchedEmail && !application && (
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
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{application.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{application.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Program</p>
                      <p className="font-medium">{selectedProgram?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Admission Type</p>
                      <p className="font-medium capitalize">{application.admissionType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Score</p>
                      <p className="font-semibold text-accent-foreground">{application.totalScore.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted On</p>
                      <p className="font-medium">{formatDate(application.submittedAt)}</p>
                    </div>

                    {application.rank && application.status === 'admitted' && (
                      <div>
                        <p className="text-sm text-muted-foreground">Merit Rank</p>
                        <p className="font-semibold">#{application.rank}</p>
                      </div>
                    )}

                    {application.admissionRound && (
                      <div>
                        <p className="text-sm text-muted-foreground">Admission Round</p>
                        <p className="font-medium">Round {application.admissionRound}</p>
                      </div>
                    )}
                  </div>

                  {/* Scholarship Status */}
                  {application.scholarshipStatus && application.status === 'admitted' && (
                    <div className="mt-6 rounded-lg border border-accent/20 bg-accent/5 p-4">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-semibold">Scholarship Status</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {application.scholarshipStatus === 'awarded' 
                              ? 'Congratulations! You have been awarded a merit scholarship.'
                              : application.scholarshipStatus === 'eligible'
                              ? 'You are eligible for scholarship consideration.'
                              : 'Not eligible for scholarship.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Download Admission Letter */}
                  {application.status === 'admitted' && (
                    <div className="mt-6">
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4" />
                        Download Admission Letter
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
                        <p className="text-sm text-muted-foreground">{formatDate(application.submittedAt)}</p>
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
                            ? formatDate(application.updatedAt)
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

      <Footer />
    </div>
  );
}
