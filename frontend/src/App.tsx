import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { OverviewPage } from './pages/OverviewPage'
import { InboxPage } from './pages/InboxPage'
import { SponsorsPage } from './pages/SponsorsPage'
import { SponsorDetailPage } from './pages/SponsorDetailPage'
import { ImpactStudioPage } from './pages/ImpactStudioPage'
import { AgentControlPage } from './pages/AgentControlPage'
import { ApprovalsPage } from './pages/ApprovalsPage'
import { AuditPage } from './pages/AuditPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="sponsors" element={<SponsorsPage />} />
          <Route path="sponsors/:id" element={<SponsorDetailPage />} />
          <Route path="impact" element={<ImpactStudioPage />} />
          <Route path="agents" element={<AgentControlPage />} />
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="audit" element={<AuditPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
