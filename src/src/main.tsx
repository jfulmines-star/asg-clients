import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Portal from './pages/Portal'
import BundleChat from './pages/BundleChat'
import MarkPortal from './pages/MarkPortal'
import BrianPortal from './pages/BrianPortal'
import JJPortal from './pages/JJPortal'
import LindsayPortal from './pages/LindsayPortal'
import RIAPortal from './pages/RIAPortal'
import AnttipPortal from './pages/AnttipPortal'
import CampaignPortal from './pages/CampaignPortal'
import ClientPortalV2 from './pages/ClientPortalV2'
import RAGDemo from './pages/RAGDemo'
import { PORTAL_CONFIGS } from './config/portal-configs'
import NotFound from './pages/NotFound'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* RAG Demo — open access for Ben/Nick */}
        <Route path="/rag-demo" element={<RAGDemo />} />
        {/* Legacy bespoke portals */}
        <Route path="/mark" element={<MarkPortal />} />
        <Route path="/brian" element={<BrianPortal />} />
        <Route path="/anttip" element={<AnttipPortal />} />
        {/* Personal portals — go straight to chat, no product landing page */}
        <Route path="/lilyg" element={<Navigate to="/lilyg/chat" replace />} />
        <Route path="/jj" element={<JJPortal />} />
        <Route path="/lindsay" element={<LindsayPortal />} />
        {/* Generic templates */}
        <Route path="/ria" element={<RIAPortal />} />
        <Route path="/campaign" element={<CampaignPortal />} />
        {/* V2 data-driven portals */}
        {Object.values(PORTAL_CONFIGS).map(cfg => (
          <Route key={cfg.slug} path={`/${cfg.slug}`} element={<ClientPortalV2 config={cfg} />} />
        ))}
        <Route path="/:clientSlug/chat" element={<BundleChat />} />
        <Route path="/:clientSlug" element={<Portal />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
