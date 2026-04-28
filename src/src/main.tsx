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
import BasePortalDemo from './pages/BasePortalDemo'
import MROLanding from './pages/MROLanding'
import MRODemo from './pages/MRODemo'
import ShieldAppShell from './pages/ShieldAppShell'
import { PORTAL_CONFIGS } from './config/portal-configs'
import NotFound from './pages/NotFound'
import { ASGPortalBase } from './portal/ASGPortalBase'
import { ANDREW_CONFIG, RYANH_CONFIG, GNOLES_CONFIG } from './config/shield-portal-configs'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* MRO demo — trade show pages */}
        <Route path="/andrew/app" element={<ShieldAppShell slug="andrew" pin="6291" rep="Andy" territory="Sales Strategy & Government Capture Intelligence" />} />
        <Route path="/ryanh/app" element={<ShieldAppShell slug="ryanh" pin="5506" rep="Ryan" territory="Navy, Coast Guard & Commercial Aviation" />} />
        <Route path="/mro" element={<MROLanding />} />
        <Route path="/mro/demo" element={<MRODemo />} />
        {/* RAG Demo — open access for Ben/Nick */}
        <Route path="/rag-demo" element={<RAGDemo />} />
        {/* BasePortal POC — QA only, not a client portal */}
        <Route path="/base-demo" element={<BasePortalDemo />} />
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
        {/* Opus portals — Shield Technologies (Andrew Parks + Ryan Hopper) + FNS (Greg Noles) */}
        <Route path="/andrew" element={<ASGPortalBase config={ANDREW_CONFIG} />} />
        <Route path="/ryanh" element={<ASGPortalBase config={RYANH_CONFIG} />} />
        <Route path="/gnoles" element={<ASGPortalBase config={GNOLES_CONFIG} />} />
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
