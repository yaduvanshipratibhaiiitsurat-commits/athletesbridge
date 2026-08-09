import { AuthProvider, useAuth, isAthlete, isSponsor } from '@/lib/auth';
import { RouterProvider, useRouter } from '@/lib/router';
import { ToastProvider } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Feedback';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Landing } from '@/pages/Landing';
import { About } from '@/pages/About';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { AthleteDashboard } from '@/pages/athlete/AthleteDashboard';
import { AthleteProfile } from '@/pages/athlete/AthleteProfile';
import { EditProfile } from '@/pages/athlete/EditProfile';
import { Achievements } from '@/pages/athlete/Achievements';
import { AthleteRequests } from '@/pages/athlete/AthleteRequests';
import { Opportunities } from '@/pages/athlete/Opportunities';
import { SponsorDashboard } from '@/pages/sponsor/SponsorDashboard';
import { Discover } from '@/pages/sponsor/Discover';
import { SponsorAthleteProfile } from '@/pages/sponsor/SponsorAthleteProfile';
import { Shortlist } from '@/pages/sponsor/Shortlist';
import { SponsorRequests } from '@/pages/sponsor/SponsorRequests';
import { SponsorProfile } from '@/pages/sponsor/SponsorProfile';
import { EditSponsorProfile } from '@/pages/sponsor/EditSponsorProfile';
import { NotFound } from '@/pages/NotFound';

function ProtectedRoute({
  role,
  children,
}: {
  role: 'athlete' | 'sponsor';
  children: React.ReactNode;
}) {
  const { profile, loading } = useAuth();
  const { navigate } = useRouter();

  if (loading) return <PageLoader />;
  if (!profile) {
    navigate('/login');
    return null;
  }
  if (profile.role !== role) {
    navigate(profile.role === 'athlete' ? '/athlete/dashboard' : '/sponsor/dashboard');
    return null;
  }
  return <>{children}</>;
}

function Routes() {
  const { path } = useRouter();
  const { profile, loading } = useAuth();

  const showChrome = !path.startsWith('/login') && !path.startsWith('/register');

  let content: React.ReactNode;
  if (path === '/') content = <Landing />;
  else if (path === '/about') content = <About />;
  else if (path === '/login')
    content = loading ? <PageLoader /> : profile ? <RedirectToDashboard /> : <Login />;
  else if (path === '/register')
    content = loading ? <PageLoader /> : profile ? <RedirectToDashboard /> : <Register />;
  else if (path === '/athlete/dashboard')
    content = (
      <ProtectedRoute role="athlete">
        <AthleteDashboard />
      </ProtectedRoute>
    );
  else if (path === '/athlete/profile')
    content = (
      <ProtectedRoute role="athlete">
        <AthleteProfile />
      </ProtectedRoute>
    );
  else if (path === '/athlete/profile/edit')
    content = (
      <ProtectedRoute role="athlete">
        <EditProfile />
      </ProtectedRoute>
    );
  else if (path === '/athlete/achievements')
    content = (
      <ProtectedRoute role="athlete">
        <Achievements />
      </ProtectedRoute>
    );
  else if (path === '/athlete/requests')
    content = (
      <ProtectedRoute role="athlete">
        <AthleteRequests />
      </ProtectedRoute>
    );
  else if (path === '/athlete/opportunities')
    content = (
      <ProtectedRoute role="athlete">
        <Opportunities />
      </ProtectedRoute>
    );
  else if (path === '/sponsor/dashboard')
    content = (
      <ProtectedRoute role="sponsor">
        <SponsorDashboard />
      </ProtectedRoute>
    );
  else if (path === '/sponsor/discover')
    content = (
      <ProtectedRoute role="sponsor">
        <Discover />
      </ProtectedRoute>
    );
  else if (path === '/sponsor/shortlist')
    content = (
      <ProtectedRoute role="sponsor">
        <Shortlist />
      </ProtectedRoute>
    );
  else if (path === '/sponsor/requests')
    content = (
      <ProtectedRoute role="sponsor">
        <SponsorRequests />
      </ProtectedRoute>
    );
  else if (path === '/sponsor/profile')
    content = (
      <ProtectedRoute role="sponsor">
        <SponsorProfile />
      </ProtectedRoute>
    );
  else if (path === '/sponsor/profile/edit')
    content = (
      <ProtectedRoute role="sponsor">
        <EditSponsorProfile />
      </ProtectedRoute>
    );
  else if (path.startsWith('/sponsor/athlete/')) {
    const id = path.split('/').pop();
    content = (
      <ProtectedRoute role="sponsor">
        <SponsorAthleteProfile athleteId={id!} />
      </ProtectedRoute>
    );
  } else content = <NotFound />;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {showChrome && <Header />}
      <main className="flex-1">{content}</main>
      {showChrome && <Footer />}
    </div>
  );
}

function RedirectToDashboard() {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  if (profile) navigate(profile.role === 'athlete' ? '/athlete/dashboard' : '/sponsor/dashboard');
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <RouterProvider>
        <AuthProvider>
          <Routes />
        </AuthProvider>
      </RouterProvider>
    </ToastProvider>
  );
}
