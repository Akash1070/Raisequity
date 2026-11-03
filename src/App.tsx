import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "./components/layout/Layout";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { Loader2 } from "lucide-react";

// Critical Entry Pages (Eagerly Loaded for Fast First Paint)
import Home from "./pages/Home";
import Login from "./pages/Login";

// Lazy-Loaded Public Pages
const Founders = lazy(() => import("./pages/Founders"));
const Investors = lazy(() => import("./pages/Investors"));
const ServiceProviders = lazy(() => import("./pages/ServiceProviders"));
const LaunchDirectory = lazy(() => import("./pages/Launch/LaunchDirectory"));
const LaunchDetailTeaser = lazy(() => import("./pages/Launch/LaunchDetailTeaser"));
const LaunchSubmit = lazy(() => import("./pages/Launch/LaunchSubmit"));
const InvestorTeaser = lazy(() => import("./pages/Teaser/InvestorTeaser"));
const ServiceTeaser = lazy(() => import("./pages/Teaser/ServiceTeaser"));
const BlogIndex = lazy(() => import("./pages/Blog/BlogIndex"));
const BlogDetail = lazy(() => import("./pages/Blog/BlogDetail"));
const ExpertProfile = lazy(() => import("./pages/ExpertProfile"));
const ExpertCategory = lazy(() => import("./pages/ExpertCategory"));

// Lazy-Loaded Dashboard & Onboarding Pages
const Onboarding = lazy(() => import("./pages/Dashboard/Onboarding"));
const InvestorOnboarding = lazy(() => import("./pages/Dashboard/InvestorOnboarding"));
const AgencyOnboarding = lazy(() => import("./pages/Dashboard/AgencyOnboarding"));
const Feed = lazy(() => import("./pages/Dashboard/Feed"));
const Matches = lazy(() => import("./pages/Dashboard/Matches"));
const Coaching = lazy(() => import("./pages/Dashboard/Coaching"));
const DashboardInvestors = lazy(() => import("./pages/Dashboard/Investors"));
const ServicesDirectory = lazy(() => import("./pages/Dashboard/ServicesDirectory"));
const Settings = lazy(() => import("./pages/Dashboard/Settings"));
const Bookings = lazy(() => import("./pages/Dashboard/Bookings"));
const MyLaunch = lazy(() => import("./pages/Dashboard/MyLaunch"));
const Messages = lazy(() => import("./pages/Messages"));
const Grants = lazy(() => import("./pages/Grants"));
const Credits = lazy(() => import("./pages/Credits"));
const Network = lazy(() => import("./pages/Network"));

// Lazy-Loaded Investor Dashboard Pages
const InvestorDashboardLayout = lazy(() => import("./components/dashboard/InvestorDashboardLayout"));
const DealFeed = lazy(() => import("./pages/InvestorDashboard/DealFeed"));
const RequestedIntros = lazy(() => import("./pages/InvestorDashboard/RequestedIntros"));
const Portfolio = lazy(() => import("./pages/InvestorDashboard/Portfolio"));
const RecommendedFounders = lazy(() => import("./pages/InvestorDashboard/RecommendedFounders"));
const InvestorCoaching = lazy(() => import("./pages/InvestorDashboard/InvestorCoaching"));
const InvestorMatches = lazy(() => import("./pages/InvestorDashboard/InvestorMatches"));

// Lazy-Loaded Agency Dashboard Pages
const AgencyDashboardLayout = lazy(() => import("./components/dashboard/AgencyDashboardLayout"));
const AgencyRfpFeed = lazy(() => import("./pages/AgencyDashboard/RfpFeed"));
const AgencyDealFlow = lazy(() => import("./pages/AgencyDashboard/AgencyDealFlow"));
const AgencyCredits = lazy(() => import("./pages/AgencyDashboard/AgencyCredits"));
const ActiveEscrows = lazy(() => import("./pages/AgencyDashboard/ActiveEscrows"));
const AgencyProfile = lazy(() => import("./pages/AgencyDashboard/AgencyProfile"));
const CommunityFeedPage = lazy(() => import("./pages/CommunityFeedPage"));

// Lazy-Loaded Admin Pages
const AdminOverview = lazy(() => import("./pages/Admin/Overview"));
const AdminUsers = lazy(() => import("./pages/Admin/AdminUsers"));
const AdminCompanies = lazy(() => import("./pages/Admin/AdminCompanies"));
const AdminInvestors = lazy(() => import("./pages/Admin/AdminInvestors"));
const AdminMatches = lazy(() => import("./pages/Admin/AdminMatches"));
const AdminAgreements = lazy(() => import("./pages/Admin/AdminAgreements"));
const AdminGrants = lazy(() => import("./pages/Admin/AdminGrants"));
const AdminCredits = lazy(() => import("./pages/Admin/AdminCredits"));
const AdminExperts = lazy(() => import("./pages/Admin/AdminExperts"));
const AdminConfig = lazy(() => import("./pages/Admin/AdminConfig"));
const AdminReferrals = lazy(() => import("./pages/Admin/AdminReferrals"));
const AdminContent = lazy(() => import("./pages/Admin/AdminContent"));
const AdminNetwork = lazy(() => import("./pages/Admin/AdminNetwork"));
const AdminLaunches = lazy(() => import("./pages/Admin/AdminLaunches"));
const SubscriptionCheckoutModal = lazy(() => import("./components/subscription/SubscriptionCheckoutModal"));

// Loading Spinner Fallback Component
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center p-8 text-emerald-500">
    <Loader2 className="animate-spin" size={32} />
  </div>
);

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ========== PUBLIC ROUTES (3 Primary Pillars) ========== */}
          <Route element={<Layout><Outlet /></Layout>}>
            <Route path="/" element={<Home />} />
            <Route path="/founders" element={<Founders />} />
            <Route path="/investors" element={<Investors />} />
            <Route path="/service-providers" element={<ServiceProviders />} />
            <Route path="/launch" element={<LaunchDirectory />} />
            <Route path="/launch/submit" element={<LaunchSubmit />} />
            <Route path="/launch/:slug" element={<LaunchDetailTeaser />} />
            <Route path="/investors/teaser/:id" element={<InvestorTeaser />} />
            <Route path="/services/teaser/:id" element={<ServiceTeaser />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/expert/:id" element={<ExpertProfile />} />
            <Route path="/experts/category/:categoryId" element={<ExpertCategory />} />
            
            {/* Subpages redirects */}
            <Route path="/scouts" element={<Navigate to="/founders" replace />} />
            <Route path="/partnerships" element={<Navigate to="/service-providers" replace />} />
            <Route path="/credits" element={<Navigate to="/dashboard/credits" replace />} />
            <Route path="/grants" element={<Navigate to="/dashboard/grants" replace />} />
            <Route path="/accelerators" element={<Navigate to="/dashboard/programs" replace />} />
            <Route path="/programs" element={<Navigate to="/dashboard/programs" replace />} />
            <Route path="/launches" element={<Navigate to="/dashboard/launches" replace />} />
            <Route path="/network" element={<Navigate to="/founders" replace />} />
            <Route path="/about" element={<Navigate to="/" replace />} />
          </Route>

          {/* ========== AUTH ROUTES ========== */}
          <Route path="/login" element={<Login />} />

          {/* ========== ROLE DASHBOARD ALIAS ALIGNMENT ========== */}
          <Route path="/founder/dashboard" element={<Navigate to="/dashboard/feed" replace />} />
          <Route path="/investor/dashboard" element={<Navigate to="/investor-dashboard/deals" replace />} />
          <Route path="/services/dashboard" element={<Navigate to="/agency-dashboard/rfps" replace />} />
          <Route path="/agency/dashboard" element={<Navigate to="/agency-dashboard/rfps" replace />} />

          {/* ========== ONBOARDING ROUTES (Role-Specific) ========== */}
          <Route path="/onboarding" element={
            <ProtectedRoute allowedRoles={['founder', 'service_provider', 'scout', 'investor']}>
              <Onboarding />
            </ProtectedRoute>
          } />
          <Route path="/investor-onboarding" element={
            <ProtectedRoute allowedRoles={['investor', 'founder', 'service_provider']}>
              <InvestorOnboarding />
            </ProtectedRoute>
          } />
          <Route path="/agency-onboarding" element={
            <ProtectedRoute allowedRoles={['service_provider', 'founder', 'investor']}>
              <AgencyOnboarding />
            </ProtectedRoute>
          } />

          {/* ========== FOUNDER DASHBOARD ========== */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['founder', 'scout']}>
              <ErrorBoundary fallbackMessage="The dashboard crashed. Please reload or check your connection.">
                <NotificationsProvider>
                  <DashboardLayout><Outlet /></DashboardLayout>
                </NotificationsProvider>
              </ErrorBoundary>
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard/feed" replace />} />
            <Route path="feed" element={<Feed />} />
            <Route path="my-launch" element={<Navigate to="/dashboard/launches?tab=my-launch" replace />} />
            <Route path="community" element={<CommunityFeedPage />} />
            <Route path="matches" element={<Matches />} />
            <Route path="messages" element={<Messages />} />
            <Route path="network" element={<Navigate to="/dashboard/investors?tab=warm-graph" replace />} />
            <Route path="coaching" element={<Coaching />} />
            <Route path="investors" element={<DashboardInvestors />} />
            <Route path="grants" element={<Grants />} />
            <Route path="credits" element={<Credits />} />
            <Route path="programs" element={<Network />} />
            <Route path="accelerators" element={<Navigate to="/dashboard/programs" replace />} />
            <Route path="launches" element={<LaunchDirectory />} />
            <Route path="launch" element={<LaunchDirectory />} />
            <Route path="launch/submit" element={<LaunchSubmit />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="settings" element={<Settings />} />
            <Route path="services" element={<ServicesDirectory />} />
            <Route path="experts" element={<Navigate to="/dashboard/services" replace />} />
          </Route>

          {/* ========== INVESTOR DASHBOARD ========== */}
          <Route path="/investor-dashboard" element={
            <ProtectedRoute allowedRoles={['investor', 'admin', 'founder']}>
              <InvestorDashboardLayout><Outlet /></InvestorDashboardLayout>
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/investor-dashboard/deals" replace />} />
            <Route path="deals" element={<DealFeed />} />
            <Route path="community" element={<CommunityFeedPage />} />
            <Route path="messages" element={<Messages />} />
            <Route path="matches" element={<InvestorMatches />} />
            <Route path="intros" element={<RequestedIntros />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="recommended" element={<RecommendedFounders />} />
            <Route path="coaching" element={<InvestorCoaching />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* ========== AGENCY & SERVICE PROVIDER DASHBOARD (Dedicated Suite) ========== */}
          <Route path="/agency-dashboard" element={
            <ProtectedRoute allowedRoles={['service_provider', 'admin', 'founder']}>
              <ErrorBoundary fallbackMessage="The agency dashboard encountered an error. Please reload.">
                <AgencyDashboardLayout><Outlet /></AgencyDashboardLayout>
              </ErrorBoundary>
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/agency-dashboard/rfps" replace />} />
            <Route path="rfps" element={<AgencyRfpFeed />} />
            <Route path="startups" element={<AgencyDealFlow />} />
            <Route path="community" element={<CommunityFeedPage />} />
            <Route path="messages" element={<Messages />} />
            <Route path="escrows" element={<ActiveEscrows />} />
            <Route path="profile" element={<AgencyProfile />} />
            <Route path="grants" element={<Grants />} />
            <Route path="credits" element={<AgencyCredits />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* ========== SUBSCRIPTION CHECKOUT ========== */}
          <Route path="/checkout" element={
            <ProtectedRoute allowedRoles={['founder', 'service_provider']}>
              <SubscriptionCheckoutModal />
            </ProtectedRoute>
          } />

          {/* ========== ADMIN DASHBOARD ========== */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['scout_admin', 'admin']}>
              <AdminLayout><Outlet /></AdminLayout>
            </ProtectedRoute>
          }>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="investors" element={<AdminInvestors />} />
            <Route path="matches" element={<AdminMatches />} />
            <Route path="agreements" element={<AdminAgreements />} />
            <Route path="grants" element={<AdminGrants />} />
            <Route path="credits" element={<AdminCredits />} />
            <Route path="experts" element={<AdminExperts />} />
            <Route path="referrals" element={<AdminReferrals />} />
            <Route path="config" element={<AdminConfig />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="network" element={<AdminNetwork />} />
            <Route path="launches" element={<AdminLaunches />} />
          </Route>

          {/* ========== FALLBACK ========== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
