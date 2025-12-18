import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/Login';
import { RegisterPage } from './pages/auth/Register';
import { RegisterUserPage } from './pages/auth/RegisterUser';
import { PendingApprovalPage } from './pages/auth/PendingApproval';
import { DashboardPage } from './pages/dashboard/Dashboard';
import { PatientsPage } from './pages/dashboard/Patients';
import { PatientProfilePage } from './pages/dashboard/PatientProfilePage';
import { AppointmentsPage } from './pages/dashboard/Appointments';
import { StaffPage } from './pages/dashboard/Staff';
import { DoctorsPage } from './pages/dashboard/Doctors';
import { AddDoctorPage } from './pages/dashboard/AddDoctorPage';
import { AnalyticsPage } from './pages/dashboard/Analytics';
import { WebPage } from './pages/dashboard/WebPage';
import { AddCertificatePage } from './pages/dashboard/AddCertificatePage';
import { SettingsPage } from './pages/dashboard/Settings';
import { ClinicChatPage } from './pages/dashboard/ClinicChatPage';
import { PatientDashboard } from './pages/dashboard/PatientDashboard';
import { PatientAppointmentsPage } from './pages/dashboard/PatientAppointmentsPage';
import { PatientAnalyticsPage } from './pages/dashboard/PatientAnalyticsPage';
import { PatientClinicsPage } from './pages/dashboard/PatientClinicsPage';
import { PatientHistoryPage } from './pages/dashboard/PatientHistoryPage';
import { PatientSettingsPage } from './pages/dashboard/PatientSettings';
import { DoctorDashboard } from './pages/dashboard/DoctorDashboard';
import { DoctorAppointmentsPage } from './pages/dashboard/DoctorAppointmentsPage';
import { DoctorAnalyticsPage } from './pages/dashboard/DoctorAnalyticsPage';
import { DoctorGraphicsPage } from './pages/dashboard/DoctorGraphicsPage';
import { PartnerDashboard } from './pages/dashboard/PartnerDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { DoctorSettingsPage } from './pages/dashboard/DoctorSettingsPage';
import { NotificationsPage } from './pages/dashboard/NotificationsPage';
import { HomePage } from './pages/public/Home';
import { ClinicsPage } from './pages/public/Clinics';
import { ClinicPage } from './pages/public/ClinicPage';
import { ClinicLandingPage } from './pages/public/ClinicLandingPage';
import { DoctorPage } from './pages/public/DoctorPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { NewDashboardLayout } from './components/dashboard/NewDashboardLayout';
import { PublicLayout } from './components/public/PublicLayout';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import { UserRole } from './types/api.types';

/**
 * Main Application Component
 * Router + Routes setup with Multi-Role Support
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/clinics" element={<PublicLayout><ClinicsPage /></PublicLayout>} />
        <Route path="/clinic/:slug" element={<PublicLayout><ClinicLandingPage /></PublicLayout>} />
        <Route path="/clinic/:slug/doctor/:doctorId" element={<PublicLayout><DoctorPage /></PublicLayout>} />

        {/* Auth Routes */}
        <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
        <Route path="/register-user" element={<PublicLayout><RegisterUserPage /></PublicLayout>} />
        <Route
          path="/pending-approval"
          element={
            <RoleProtectedRoute requireActive={false}>
              <PublicLayout><PendingApprovalPage /></PublicLayout>
            </RoleProtectedRoute>
          }
        />

        {/* Protected Routes - Role-based Dashboards */}
        <Route
          path="/dashboard/patient"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.PATIENT]}>
              <PatientDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/appointments"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.PATIENT]}>
              <PatientAppointmentsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/clinics"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.PATIENT]}>
              <PatientClinicsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/clinic/:slug"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.PATIENT]}>
              <NewDashboardLayout>
                <ClinicPage />
              </NewDashboardLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/analytics"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.PATIENT]}>
              <PatientAnalyticsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/history"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.PATIENT]}>
              <Navigate to="/dashboard/patient" replace />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patient/settings"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.PATIENT]}>
              <PatientSettingsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctor"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.DOCTOR]}>
              <DoctorDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctor/appointments"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.DOCTOR]}>
              <DoctorAppointmentsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctor/patients"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.DOCTOR]}>
              <PatientsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctor/graphics"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.DOCTOR]}>
              <DoctorGraphicsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctor/analytics"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.DOCTOR]}>
              <DoctorAnalyticsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctor/settings"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.DOCTOR]}>
              <DoctorSettingsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/clinic/doctors/:doctorId/settings"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.CLINIC]}>
              <DoctorSettingsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/partner"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.PARTNER]}>
              <PartnerDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Protected Routes - Main Dashboard (для клиник и ADMIN с clinicId) */}
        <Route
          path="/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, 'CLINIC']}>
              <DashboardPage />
            </RoleProtectedRoute>
          }
        />
        
        {/* Protected Routes - Dashboard Pages (только для ADMIN и CLINIC) */}
        <Route
          path="/dashboard/patients"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, 'CLINIC', UserRole.DOCTOR]}>
              <PatientsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patients/:patientId"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, 'CLINIC', UserRole.DOCTOR]}>
              <PatientProfilePage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/appointments"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, 'CLINIC']}>
              <AppointmentsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/staff"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, 'CLINIC']}>
              <StaffPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctors"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, 'CLINIC']}>
              <DoctorsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctors/add"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, 'CLINIC']}>
              <AddDoctorPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, 'CLINIC']}>
              <AnalyticsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/web"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, 'CLINIC']}>
              <WebPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/web/certificates/add"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, 'CLINIC']}>
              <AddCertificatePage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, 'CLINIC']}>
              <SettingsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/chat"
          element={
            <RoleProtectedRoute allowedRoles={['CLINIC']}>
              <ClinicChatPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/notifications"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN, 'CLINIC', UserRole.PARTNER]}>
              <NotificationsPage />
            </RoleProtectedRoute>
          }
        />
        
        {/* Protected Routes - Nested Dashboard Routes (для старых страниц) */}
        <Route
          path="/dashboard/old"
          element={
            <RoleProtectedRoute allowedRoles={[UserRole.ADMIN, 'CLINIC']}>
              <DashboardLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Аналитика (в разработке)</h1></div>} />
          <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Настройки (в разработке)</h1></div>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

