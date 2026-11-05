import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminMarketplace } from '../pages/admin/AdminMarketplace';
import { AdminShell } from '../components/admin/AdminShell';
import { AdminOverview } from '../pages/admin/AdminOverview';
import { AdminPlans } from '../pages/admin/AdminPlans';
import { AdminAi } from '../pages/admin/AdminAi';
import { AdminIntegrations } from '../pages/admin/AdminIntegrations';
import { AdminLocalisation } from '../pages/admin/AdminLocalisation';
import { AdminPayments } from '../pages/admin/AdminPayments';
import { AdminEscrow } from '../pages/admin/AdminEscrow';
import { AdminSponsorships } from '../pages/admin/AdminSponsorships';
import { AdminFigures } from '../pages/admin/AdminFigures';
import { AdminDesignSystem } from '../pages/admin/AdminDesignSystem';
import { AdminAreaNotFound } from '../pages/admin/AdminAreaNotFound';
import { AdminTenants } from '../pages/admin/AdminTenants';
import { AdminPages } from '../pages/admin/AdminPages';
import { AdminOrders } from '../pages/admin/AdminOrders';
import { AdminReporting } from '../pages/admin/AdminReporting';
import { AdminDataRequests } from '../pages/admin/AdminDataRequests';
import { AdminStaff } from '../pages/admin/AdminStaff';
import { AdminAppeals } from '../pages/admin/AdminAppeals';
import { AdminFlags } from '../pages/admin/AdminFlags';
import { AdminModeration } from '../pages/admin/AdminModeration';
import { AdminSupport } from '../pages/admin/AdminSupport';
import { AdminAudit } from '../pages/admin/AdminAudit';
import { AdminHealth } from '../pages/admin/AdminHealth';

/**
 * The prototype staff console under /admin/*. Loaded lazily, and only in builds with
 * VITE_KUBICU_STAFF_CONSOLE=prototype (src/utils/staffConsole.ts); deployed builds do not contain it.
 */
export default function StaffConsoleRoutes() {
  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<AdminOverview />} />
        <Route path="design-system" element={<AdminDesignSystem />} />
        <Route path="modules" element={<AdminMarketplace />} />
        <Route path="tenants" element={<AdminTenants />} />
        <Route path="pages" element={<AdminPages />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="reporting" element={<AdminReporting />} />
        <Route path="data-requests" element={<AdminDataRequests />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="appeals" element={<AdminAppeals />} />
        <Route path="flags" element={<AdminFlags />} />
        <Route path="moderation" element={<AdminModeration />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="audit" element={<AdminAudit />} />
        <Route path="health" element={<AdminHealth />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="escrow" element={<AdminEscrow />} />
        <Route path="sponsorships" element={<AdminSponsorships />} />
        <Route path="figures" element={<AdminFigures />} />
        <Route path="plans" element={<AdminPlans />} />
        <Route path="ai" element={<AdminAi />} />
        <Route path="notifications" element={<AdminIntegrations />} />
        <Route path="settings" element={<AdminLocalisation />} />
        {/* Any other /admin/… address is a mistyped or moved staff area — shown as "not found". */}
        <Route path="*" element={<AdminAreaNotFound />} />
      </Route>
    </Routes>
  );
}
