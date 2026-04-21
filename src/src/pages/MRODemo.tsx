import { useEffect, useRef } from 'react'

const LOG_DATA = [
  { ts: '05:47', msg: 'intel.agent: scanning aviation contract feeds...', hi: false },
  { ts: '05:48', msg: '41 contract awards parsed', hi: true },
  { ts: '05:49', msg: 'match: DoD Aviation Depot - engine overhaul program ($280M)', hi: true },
  { ts: '05:49', msg: 'match: Regional Airline MRO - leadership change detected', hi: true },
  { ts: '05:49', msg: 'contact.search: Director of Procurement, Regional Airline', hi: false },
  { ts: '05:50', msg: 'confidence: 91% - queueing draft', hi: true },
  { ts: '05:51', msg: 'draft.ready - rep@yourcompany.com', hi: false },
  { ts: '05:51', msg: 'awaiting approval...', hi: false },
  { ts: '06:12', msg: 'approved - sent OK', hi: true },
  { ts: '06:12', msg: 'crm.log: Director of Procurement - First Contact', hi: true },
  { ts: '06:12', msg: 'deal.update: Prospect - Active', hi: true },
  { ts: '07:15', msg: 'intel.agent: competitive scan running...', hi: false },
  { ts: '07:16', msg: 'Major OEM supplier - MRO contract expansion ($150M)', hi: true },
  { ts: '07:16', msg: 'territory.flag: overlaps your coverage area', hi: true },
  { ts: '07:16', msg: 'draft.queued - competitive response', hi: false },
  { ts: '09:45', msg: 'meeting.prep: Director of Procurement - 11:30 AM', hi: false },
  { ts: '09:46', msg: 'pulling: fleet data, MRO priorities, procurement history', hi: false },
  { ts: '09:47', msg: 'brief.ready - rep@yourcompany.com', hi: true },
  { ts: '17:30', msg: 'week.summary: 14 contacts, 5 drafts sent, 3 replies', hi: true },
  { ts: '17:31', msg: 'pipeline.report: queueing for manager review', hi: false },
  { ts: '17:31', msg: 'awaiting approval...', hi: false },
]

const LOG_TIMES = [0,700,1400,2000,2700,3300,4000,4700,7500,8200,8900,15500,16200,16900,17600,22500,23200,24000,30500,31300,32100]

const TITLES: Record<number,string> = {
  2: 'Daily Brief - April 21, 2026',
  3: 'Outreach - Director of Procurement',
  4: 'Competitive Intelligence',
  5: 'Meeting Brief - Regional Airline',
  6: 'Week in Review',
}

export default function MRODemo() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const idsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const rafRef = useRef<number | null>(null)
  const startMsRef = useRef(0)
  const hasStartedRef = useRef(false)
  const TOTAL = 60000

  const at = (fn: () => void, ms: number) => { idsRef.current.push(setTimeout(fn, ms)) }
  const clearAll = () => {
    idsRef.current.forEach(clearTimeout); idsRef.current = []
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }
  const el = (id: string) => document.getElementById(id)
  const ac = (id: string, cls: string) => el(id)?.classList.add(cls)
  const rc = (id: string, cls: string) => el(id)?.classList.remove(cls)

  const startProgress = () => {
    const bar = el('mro-progress'); if (!bar) return
    const tick = () => {
      const pct = Math.min(((Date.now() - startMsRef.current) / TOTAL) * 100, 100)
      bar.style.width = pct + '%'
      if (pct < 100) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const typewriter = (targetId: string, text: string) => {
    const t = el(targetId); if (!t) return; t.textContent = ''; let i = 0
    const step = () => {
      if (i <= text.length) { t.textContent = text.slice(0, i); i++; idsRef.current.push(setTimeout(step, 48)) }
      else { setTimeout(() => { const c = el('mro-s1-cursor'); if (c) c.style.display = 'none' }, 600) }
    }
    step()
  }

  const addLogEntry = (idx: number) => {
    if (idx >= LOG_DATA.length) return
    const d = LOG_DATA[idx]
    const container = el('mro-log-entries'); const wrap = el('mro-log-wrap')
    if (!container || !wrap) return
    const line = document.createElement('div')
    line.className = 'mro-log-line'
    const ts = document.createElement('span'); ts.className = 'mro-log-ts'; ts.textContent = '[' + d.ts + ']'
    const txt = document.createElement('span'); txt.className = 'mro-log-txt' + (d.hi ? ' hi' : ''); txt.textContent = d.msg
    line.appendChild(ts); line.appendChild(txt)
    container.appendChild(line)
    requestAnimationFrame(() => requestAnimationFrame(() => line.classList.add('in')))
    requestAnimationFrame(() => {
      while ((container as HTMLElement).offsetHeight > (wrap as HTMLElement).clientHeight) {
        const first = container.firstElementChild; if (!first || first === line) break; container.removeChild(first)
      }
    })
  }

  const scheduleLog = (base: number) => LOG_TIMES.forEach((offset, i) => at(() => addLogEntry(i), base + offset))

  const activateScreen = (n: number) => {
    document.querySelectorAll('.mro-sc').forEach(e => e.classList.remove('active'))
    el('mro-c' + n)?.classList.add('active')
    const t = el('mro-panel-title'); if (t && TITLES[n]) t.textContent = TITLES[n]
  }

  const run = () => {
    startMsRef.current = Date.now(); startProgress()
    const cur = el('mro-s1-cursor'); if (cur) cur.style.display = 'inline-block'
    typewriter('mro-s1-text', 'Every morning. Same problem.')
    at(() => ac('mro-prob1', 'show'), 2000)
    at(() => ac('mro-prob2', 'show'), 3200)
    at(() => ac('mro-prob3', 'show'), 4400)
    at(() => {
      ac('mro-screen1', 'fade-out'); ac('mro-split', 'visible'); activateScreen(2)
      at(() => ac('mro-card1', 'show'), 400)
      at(() => ac('mro-card2', 'show'), 700)
      at(() => ac('mro-card3', 'show'), 1000)
      scheduleLog(0)
    }, 7000)
    at(() => {
      activateScreen(3); at(() => ac('mro-email-draft', 'show'), 350)
      at(() => {
        const b = el('mro-approve-btn')
        if (b) { b.classList.remove('pulse'); b.classList.add('done'); b.textContent = 'APPROVED' }
        at(() => ac('mro-conf1', 'show'), 350)
        at(() => ac('mro-conf2', 'show'), 700)
        at(() => ac('mro-conf3', 'show'), 1050)
      }, 4000)
    }, 14000)
    at(() => { activateScreen(4); at(() => ac('mro-alert-card', 'show'), 350) }, 22000)
    at(() => { activateScreen(5); at(() => ac('mro-meeting-card', 'show'), 350) }, 29000)
    at(() => { activateScreen(6); at(() => ac('mro-summary-card', 'show'), 350) }, 37000)
    at(() => {
      const sp = el('mro-split') as HTMLElement | null
      if (sp) { sp.style.transition = 'opacity 1.2s ease'; sp.style.opacity = '0'; sp.style.pointerEvents = 'none' }
      ac('mro-screen7', 'visible')
      at(() => ac('mro-closer-rex', 'show'), 400)
      at(() => ac('mro-closer-byline', 'show'), 700)
      at(() => ac('mro-closer-tagline', 'show'), 1100)
      at(() => ac('mro-closer-footer', 'show'), 1500)
      at(() => ac('mro-btn-replay', 'show'), 13000)
    }, 54000)
  }

  const replay = () => {
    clearAll()
    const s1 = el('mro-screen1') as HTMLElement | null
    if (s1) { s1.classList.remove('fade-out'); s1.style.opacity = '' }
    const tx = el('mro-s1-text'); if (tx) tx.textContent = ''
    const cur = el('mro-s1-cursor'); if (cur) cur.style.display = 'inline-block'
    ;['mro-prob1', 'mro-prob2', 'mro-prob3'].forEach(id => rc(id, 'show'))
    const sp = el('mro-split') as HTMLElement | null
    if (sp) { sp.classList.remove('visible'); sp.style.transition = ''; sp.style.opacity = ''; sp.style.pointerEvents = '' }
    ;['mro-card1', 'mro-card2', 'mro-card3'].forEach(id => rc(id, 'show'))
    rc('mro-email-draft', 'show')
    const b = el('mro-approve-btn')
    if (b) { b.classList.add('pulse'); b.classList.remove('done'); b.textContent = 'APPROVE' }
    ;['mro-conf1', 'mro-conf2', 'mro-conf3'].forEach(id => rc(id, 'show'))
    rc('mro-alert-card', 'show'); rc('mro-meeting-card', 'show'); rc('mro-summary-card', 'show')
    rc('mro-screen7', 'visible')
    ;['mro-closer-rex', 'mro-closer-byline', 'mro-closer-tagline', 'mro-closer-footer', 'mro-btn-replay'].forEach(id => rc(id, 'show'))
    const log = el('mro-log-entries'); if (log) log.innerHTML = ''
    const bar = el('mro-progress') as HTMLElement | null
    if (bar) { bar.style.transition = 'none'; bar.style.width = '0%'; requestAnimationFrame(() => { bar.style.transition = '' }) }
    setTimeout(run, 120)
  }

  const startDemo = () => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true
    // Hide splash screen
    const splash = el('mro-splash')
    if (splash) { splash.style.opacity = '0'; setTimeout(() => { splash.style.display = 'none' }, 500) }
    // Play audio immediately (user gesture just happened)
    if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}) }
    // Start demo
    run()
  }

  useEffect(() => {
    audioRef.current = new Audio('/mro-voiceover.mp3')
    audioRef.current.preload = 'auto'
    audioRef.current.load()

    el('mro-btn-replay')?.addEventListener('click', () => {
      if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}) }
      replay()
    })
    return () => {
      clearAll()
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{width:'100%',height:'100vh',overflow:'hidden',background:'#000',position:'relative'}}>
      <style dangerouslySetInnerHTML={{__html:`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body,html{font-family:'Inter',sans-serif;color:#e2e8f0;}
        #mro-progress{position:fixed;top:0;left:0;height:2px;width:0%;background:#4ADE80;z-index:200;transition:width .25s linear;}
        #mro-screen1{position:absolute;inset:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10;opacity:1;transition:opacity .9s cubic-bezier(.4,0,.2,1);}
        #mro-screen1.fade-out{opacity:0;pointer-events:none;}
        .mro-s1-inner{width:min(640px,90vw);}
        #mro-s1-headline{font-size:clamp(26px,3.2vw,44px);font-weight:700;color:#fff;letter-spacing:-.025em;margin-bottom:48px;min-height:1.2em;line-height:1.2;}
        #mro-s1-cursor{display:inline-block;width:3px;height:.9em;background:#fff;vertical-align:middle;margin-left:3px;animation:blink .8s step-end infinite;}
        @keyframes blink{50%{opacity:0;}}
        .mro-s1-items{display:flex;flex-direction:column;gap:18px;}
        .mro-s1-item{display:flex;align-items:center;gap:14px;opacity:0;transform:translateX(-18px);transition:opacity .45s cubic-bezier(.16,1,.3,1),transform .45s cubic-bezier(.16,1,.3,1);}
        .mro-s1-item.show{opacity:1;transform:translateX(0);}
        .mro-s1-dot{width:6px;height:6px;border-radius:50%;background:#4ADE80;flex-shrink:0;}
        .mro-s1-item-text{font-size:clamp(14px,1.5vw,18px);color:#94a3b8;}
        #mro-split{position:absolute;inset:0;display:flex;opacity:0;pointer-events:none;transition:opacity .8s cubic-bezier(.4,0,.2,1);z-index:5;}
        #mro-split.visible{opacity:1;pointer-events:all;}
        #mro-left{flex:0 0 70%;background:#0a0f1e;display:flex;flex-direction:column;padding:clamp(20px,3vw,36px);overflow:hidden;}
        #mro-right{flex:0 0 30%;background:#060c18;border-left:1px solid #1a2a1a;display:flex;flex-direction:column;padding:16px;overflow:hidden;}
        .mro-rex-header{margin-bottom:clamp(16px,2.5vw,28px);flex-shrink:0;}
        .mro-rex-eyebrow{font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#4ADE80;margin-bottom:5px;}
        .mro-rex-title{font-size:clamp(18px,2vw,24px);font-weight:700;color:#fff;letter-spacing:-.02em;}
        .mro-rex-date{font-size:12px;color:#475569;margin-top:3px;}
        .mro-sc{display:none;flex-direction:column;flex:1;overflow:hidden;}
        .mro-sc.active{display:flex;}
        .mro-terminal-header{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#374151;padding-bottom:10px;border-bottom:1px solid #111d11;margin-bottom:12px;flex-shrink:0;}
        #mro-log-wrap{flex:1;overflow:hidden;position:relative;}
        #mro-log-entries{position:absolute;bottom:0;left:0;right:0;display:flex;flex-direction:column;gap:3px;}
        .mro-log-line{font-family:'JetBrains Mono',monospace;font-size:10.5px;line-height:1.55;opacity:0;transition:opacity .35s ease;word-break:break-all;}
        .mro-log-line.in{opacity:1;}
        .mro-log-ts{color:#4b5563;margin-right:5px;}
        .mro-log-txt{color:#22c55e;}
        .mro-log-txt.hi{color:#86efac;font-weight:500;}
        .mro-intel-cards{display:flex;flex-direction:column;gap:clamp(10px,1.2vw,14px);}
        .mro-intel-card{background:#0d1527;border:1px solid #1e2d4a;border-radius:8px;padding:clamp(14px,1.5vw,20px) clamp(16px,1.8vw,22px);opacity:0;transform:translateY(22px);transition:opacity .5s cubic-bezier(.16,1,.3,1),transform .5s cubic-bezier(.16,1,.3,1);}
        .mro-intel-card.show{opacity:1;transform:translateY(0);}
        .mro-ic-top{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
        .mro-ic-icon{font-size:17px;line-height:1;}
        .mro-ic-type{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#4ADE80;}
        .mro-ic-badge{margin-left:auto;font-size:9.5px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.05em;text-transform:uppercase;background:rgba(74,222,128,.12);color:#4ADE80;border:1px solid rgba(74,222,128,.2);}
        .mro-ic-badge.orange{background:rgba(249,115,22,.12);color:#fb923c;border-color:rgba(249,115,22,.2);}
        .mro-ic-name{font-size:clamp(14px,1.3vw,16px);font-weight:600;color:#e2e8f0;margin-bottom:3px;}
        .mro-ic-meta{font-size:12px;color:#64748b;}
        .mro-ic-match{margin-top:8px;font-size:12px;color:#4ADE80;font-weight:500;}
        .mro-email-wrap{display:flex;flex-direction:column;gap:14px;overflow:hidden;}
        .mro-email-draft{background:#0d1527;border:1px solid #1e2d4a;border-radius:8px;overflow:hidden;opacity:0;transform:translateY(40px);transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1);}
        .mro-email-draft.show{opacity:1;transform:translateY(0);}
        .mro-email-fields{padding:14px 20px;border-bottom:1px solid #1e2d4a;background:#09101f;display:flex;flex-direction:column;gap:5px;}
        .mro-email-field{display:flex;gap:8px;font-size:12px;}
        .mro-ef-label{color:#374151;width:36px;flex-shrink:0;}
        .mro-ef-val{color:#94a3b8;}
        .mro-email-subject{padding:12px 20px;border-bottom:1px solid #1e2d4a;font-size:clamp(12px,1.1vw,14px);font-weight:600;color:#e2e8f0;}
        .mro-email-body{padding:14px 20px;font-size:clamp(11px,1vw,13px);color:#94a3b8;line-height:1.75;border-bottom:1px solid #1e2d4a;}
        .mro-email-actions{padding:12px 20px;display:flex;align-items:center;gap:12px;background:#09101f;}
        .mro-btn-approve{padding:9px 22px;background:#4ADE80;color:#0a0f1e;font-family:'Inter',sans-serif;font-size:13px;font-weight:700;letter-spacing:.04em;border:none;border-radius:6px;cursor:pointer;transition:background .25s ease,box-shadow .25s ease;}
        .mro-btn-approve.pulse{animation:btn-pulse 1.2s ease-in-out infinite;}
        @keyframes btn-pulse{0%{box-shadow:0 0 0 0 rgba(74,222,128,.5);}60%{box-shadow:0 0 0 8px rgba(74,222,128,0);}100%{box-shadow:0 0 0 0 rgba(74,222,128,0);}}
        .mro-btn-approve.done{background:#16a34a;animation:none;box-shadow:none;color:#fff;}
        .mro-btn-hint{font-size:11px;color:#374151;}
        .mro-confirmations{display:flex;flex-direction:column;gap:8px;}
        .mro-conf-item{display:flex;align-items:center;gap:9px;font-size:clamp(12px,1.1vw,13px);color:#4ADE80;opacity:0;transform:translateX(-12px);transition:opacity .35s ease,transform .35s ease;}
        .mro-conf-item.show{opacity:1;transform:translateX(0);}
        .mro-alert-card{background:#0d1527;border:1px solid #1e2d4a;border-left:3px solid #f97316;border-radius:8px;padding:clamp(16px,2vw,24px) clamp(18px,2.2vw,26px);opacity:0;transform:translateY(22px);transition:opacity .5s cubic-bezier(.16,1,.3,1),transform .5s cubic-bezier(.16,1,.3,1);}
        .mro-alert-card.show{opacity:1;transform:translateY(0);}
        .mro-alert-eyebrow{font-size:10px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:#f97316;margin-bottom:14px;display:flex;align-items:center;gap:7px;}
        .mro-alert-name{font-size:clamp(15px,1.5vw,18px);font-weight:700;color:#e2e8f0;margin-bottom:6px;}
        .mro-alert-amount{font-size:clamp(28px,3vw,38px);font-weight:800;color:#f97316;letter-spacing:-.03em;margin-bottom:16px;}
        .mro-alert-rows{display:flex;flex-direction:column;gap:6px;margin-bottom:20px;}
        .mro-alert-row{font-size:13px;color:#64748b;}
        .mro-alert-row span{color:#e2e8f0;}
        .mro-alert-row span.green{color:#4ADE80;}
        .mro-alert-btns{display:flex;gap:10px;}
        .mro-btn-alert-approve{padding:9px 22px;background:#4ADE80;color:#0a0f1e;font-family:'Inter',sans-serif;font-size:13px;font-weight:700;border:none;border-radius:6px;cursor:pointer;}
        .mro-btn-secondary{padding:9px 20px;background:transparent;color:#64748b;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;border:1px solid #1e2d4a;border-radius:6px;cursor:pointer;}
        .mro-meeting-card{background:#0d1527;border:1px solid #1e2d4a;border-radius:8px;padding:clamp(16px,2vw,24px) clamp(18px,2.2vw,26px);opacity:0;transform:translateY(22px);transition:opacity .5s cubic-bezier(.16,1,.3,1),transform .5s cubic-bezier(.16,1,.3,1);}
        .mro-meeting-card.show{opacity:1;transform:translateY(0);}
        .mro-meeting-pill{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#4ADE80;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.2);padding:4px 12px;border-radius:20px;margin-bottom:14px;}
        .mro-meeting-name{font-size:clamp(16px,1.7vw,20px);font-weight:700;color:#e2e8f0;margin-bottom:3px;}
        .mro-meeting-sub{font-size:12px;color:#475569;margin-bottom:18px;}
        .mro-m-section{margin-bottom:16px;}
        .mro-m-section-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#374151;margin-bottom:8px;}
        .mro-m-bullets{display:flex;flex-direction:column;gap:6px;}
        .mro-m-bullet{display:flex;align-items:flex-start;gap:9px;font-size:clamp(12px,1.1vw,13px);color:#94a3b8;line-height:1.5;}
        .mro-m-bullet::before{content:'>';color:#4ADE80;flex-shrink:0;font-size:11px;margin-top:2px;}
        .mro-best-angle-box{background:rgba(74,222,128,.07);border:1px solid rgba(74,222,128,.15);border-radius:6px;padding:12px 16px;}
        .mro-ba-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#4ADE80;margin-bottom:5px;}
        .mro-ba-text{font-size:clamp(12px,1.1vw,13px);color:#86efac;line-height:1.55;}
        .mro-summary-card{background:#0d1527;border:1px solid #1e2d4a;border-radius:8px;padding:clamp(16px,2vw,24px) clamp(18px,2.2vw,26px);opacity:0;transform:translateY(22px);transition:opacity .5s cubic-bezier(.16,1,.3,1),transform .5s cubic-bezier(.16,1,.3,1);}
        .mro-summary-card.show{opacity:1;transform:translateY(0);}
        .mro-summary-eyebrow{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#4ADE80;margin-bottom:18px;}
        .mro-summary-stats{display:flex;gap:clamp(16px,2.5vw,32px);margin-bottom:20px;flex-wrap:wrap;}
        .mro-stat{display:flex;flex-direction:column;gap:2px;}
        .mro-stat-num{font-size:clamp(26px,2.8vw,36px);font-weight:800;color:#e2e8f0;letter-spacing:-.04em;line-height:1;}
        .mro-stat-lbl{font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:.06em;}
        .mro-summary-status-row{display:flex;align-items:center;gap:10px;font-size:13px;color:#94a3b8;padding:10px 14px;background:rgba(74,222,128,.05);border:1px solid rgba(74,222,128,.1);border-radius:6px;margin-bottom:18px;}
        .mro-live-dot{width:7px;height:7px;border-radius:50%;background:#4ADE80;flex-shrink:0;animation:live-blink 1.5s ease-in-out infinite;}
        @keyframes live-blink{0%,100%{opacity:1;}50%{opacity:.25;}}
        .mro-btn-approve-full{width:100%;padding:12px;background:#4ADE80;color:#0a0f1e;font-family:'Inter',sans-serif;font-size:13px;font-weight:700;letter-spacing:.05em;border:none;border-radius:6px;cursor:pointer;text-align:center;}
        .mro-btn-approve-full:hover{background:#22c55e;}
        #mro-screen7{position:absolute;inset:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:15;transition:opacity 1s cubic-bezier(.4,0,.2,1);}
        #mro-screen7.visible{opacity:1;pointer-events:all;}
        .mro-closer-rex{font-size:clamp(64px,9vw,104px);font-weight:700;color:#4ADE80;letter-spacing:.3em;text-indent:.3em;opacity:0;transform:scale(.93);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1);}
        .mro-closer-rex.show{opacity:1;transform:scale(1);}
        .mro-closer-byline{font-size:clamp(12px,1.2vw,15px);color:#6b7280;font-weight:500;letter-spacing:.05em;margin-top:12px;opacity:0;transition:opacity .8s ease;}
        .mro-closer-byline.show{opacity:1;}
        .mro-closer-tagline{font-size:clamp(15px,1.7vw,20px);color:#4b5563;font-style:italic;font-weight:400;margin-top:18px;opacity:0;transition:opacity .8s ease .35s;}
        .mro-closer-tagline.show{opacity:1;}
        .mro-closer-footer{position:absolute;bottom:40px;font-size:11px;color:#1f2937;letter-spacing:.1em;text-transform:uppercase;opacity:0;transition:opacity .8s ease .75s;}
        .mro-closer-footer.show{opacity:1;}
        #mro-btn-replay{margin-top:52px;padding:11px 30px;background:transparent;color:#4ADE80;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;letter-spacing:.05em;border:1px solid rgba(74,222,128,.4);border-radius:6px;cursor:pointer;opacity:0;transition:opacity .5s ease,background .2s ease;}
        #mro-btn-replay.show{opacity:1;}
        #mro-btn-replay:hover{background:rgba(74,222,128,.08);}
        #mro-splash{position:fixed;inset:0;background:#000;z-index:1000;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:opacity .5s ease;user-select:none;-webkit-tap-highlight-color:transparent;}
        #mro-splash:hover #mro-splash-ring{border-color:rgba(74,222,128,.8);transform:scale(1.06);}
        #mro-splash-logo{font-family:'Inter',sans-serif;font-size:clamp(48px,8vw,96px);font-weight:800;color:#fff;letter-spacing:-.04em;margin-bottom:48px;}
        #mro-splash-logo span{color:#4ADE80;}
        #mro-splash-ring{width:clamp(80px,12vw,120px);height:clamp(80px,12vw,120px);border-radius:50%;border:2px solid rgba(74,222,128,.4);display:flex;align-items:center;justify-content:center;transition:border-color .25s,transform .25s;}
        #mro-splash-play{width:0;height:0;border-style:solid;border-width:clamp(14px,2vw,22px) 0 clamp(14px,2vw,22px) clamp(24px,3.5vw,38px);border-color:transparent transparent transparent #4ADE80;margin-left:4px;}
        #mro-splash-label{font-family:'Inter',sans-serif;font-size:clamp(13px,1.4vw,16px);color:rgba(148,163,184,.7);margin-top:32px;letter-spacing:.08em;text-transform:uppercase;}
        #mro-splash-badge{font-family:'Inter',sans-serif;font-size:clamp(11px,1.1vw,13px);color:rgba(74,222,128,.6);margin-top:12px;letter-spacing:.04em;}
      `}} />

      {/* Audio button */}
      <div id="mro-splash" onClick={startDemo} onTouchStart={startDemo}>
        <div id="mro-splash-logo">R<span>E</span>X</div>
        <div id="mro-splash-ring"><div id="mro-splash-play"></div></div>
        <div id="mro-splash-label">Press anywhere to begin</div>
        <div id="mro-splash-badge">A custom AI sales agent by AxiomStream Group</div>
      </div>

      {/* Progress */}
      <div id="mro-progress" />

      {/* Screen 1 */}
      <div id="mro-screen1">
        <div className="mro-s1-inner">
          <div id="mro-s1-headline">
            <span id="mro-s1-text" />
            <span id="mro-s1-cursor" />
          </div>
          <div className="mro-s1-items">
            <div className="mro-s1-item" id="mro-prob1"><div className="mro-s1-dot" /><div className="mro-s1-item-text">Parts in the wrong place. Schedules slipping.</div></div>
            <div className="mro-s1-item" id="mro-prob2"><div className="mro-s1-dot" /><div className="mro-s1-item-text">Leadership change: Major carrier MRO division</div></div>
            <div className="mro-s1-item" id="mro-prob3"><div className="mro-s1-dot" /><div className="mro-s1-item-text">Your competitors already made the call.</div></div>
          </div>
        </div>
      </div>

      {/* Split layout */}
      <div id="mro-split">
        {/* Left panel */}
        <div id="mro-left">
          <div className="mro-rex-header">
            <div className="mro-rex-eyebrow">REX // DAILY BRIEF</div>
            <div className="mro-rex-title" id="mro-panel-title">Daily Brief - April 21, 2026</div>
            <div className="mro-rex-date">April 21, 2026</div>
          </div>

          {/* Screen 2: Intel cards */}
          <div className="mro-sc" id="mro-c2">
            <div className="mro-intel-cards">
              <div className="mro-intel-card" id="mro-card1">
                <div className="mro-ic-top"><span className="mro-ic-icon">&#x1F6E1;&#xFE0F;</span><span className="mro-ic-type">Contract Award</span><span className="mro-ic-badge">MATCH: Your Territory</span></div>
                <div className="mro-ic-name">DoD Aviation Depot - Engine Overhaul Program</div>
                <div className="mro-ic-meta">Value: $280M</div>
                <div className="mro-ic-match">&#x2713; MATCH: Your Territory - scope overlap confirmed</div>
              </div>
              <div className="mro-intel-card" id="mro-card2">
                <div className="mro-ic-top"><span className="mro-ic-icon">&#x1F504;</span><span className="mro-ic-type">Leadership Change</span></div>
                <div className="mro-ic-name">Regional Airline MRO Division</div>
                <div className="mro-ic-meta">New VP of Maintenance Operations - Effective April 2026</div>
              </div>
              <div className="mro-intel-card" id="mro-card3">
                <div className="mro-ic-top"><span className="mro-ic-icon">&#x2726;</span><span className="mro-ic-type">New Contact</span><span className="mro-ic-badge orange">PRIORITY: HIGH</span></div>
                <div className="mro-ic-name">Director of Procurement</div>
                <div className="mro-ic-meta">Confidence: 91% - Draft queued</div>
              </div>
            </div>
          </div>

          {/* Screen 3: Email draft */}
          <div className="mro-sc" id="mro-c3">
            <div className="mro-email-wrap">
              <div className="mro-email-draft" id="mro-email-draft">
                <div className="mro-email-fields">
                  <div className="mro-email-field"><span className="mro-ef-label">From:</span><span className="mro-ef-val">rep@yourcompany.com</span></div>
                  <div className="mro-email-field"><span className="mro-ef-label">To:</span><span className="mro-ef-val">director.procurement@airline-mro.com</span></div>
                </div>
                <div className="mro-email-subject">Protecting your engine investment at MRO</div>
                <div className="mro-email-body">
                  I noticed your team recently expanded MRO operations on the 737 fleet. We have helped similar operators reduce engine downtime by 5-10 days per cycle...<br /><br />
                  Would a 15-minute call make sense this month?
                </div>
                <div className="mro-email-actions">
                  <button className="mro-btn-approve pulse" id="mro-approve-btn">APPROVE</button>
                  <span className="mro-btn-hint">Rex drafted - Awaiting your decision</span>
                </div>
              </div>
              <div className="mro-confirmations" id="mro-confirmations">
                <div className="mro-conf-item" id="mro-conf1">&#x2705; Email sent to director.procurement@airline-mro.com</div>
                <div className="mro-conf-item" id="mro-conf2">&#x2705; CRM logged - Director of Procurement - First Contact</div>
                <div className="mro-conf-item" id="mro-conf3">&#x2705; Deal stage updated - Prospect - Active</div>
              </div>
            </div>
          </div>

          {/* Screen 4: Competitive alert */}
          <div className="mro-sc" id="mro-c4">
            <div className="mro-alert-card" id="mro-alert-card">
              <div className="mro-alert-eyebrow">&#x26A1; COMPETITIVE ALERT</div>
              <div className="mro-alert-name">Major OEM Supplier - Aviation MRO Contract Expansion</div>
              <div className="mro-alert-amount">$150M</div>
              <div className="mro-alert-rows">
                <div className="mro-alert-row">Territory: <span>Overlaps your coverage area</span></div>
                <div className="mro-alert-row">Program: <span>Aviation MRO - active overlap</span></div>
                <div className="mro-alert-row">Status: <span className="green">Competitive response drafted and queued</span></div>
              </div>
              <div className="mro-alert-btns">
                <button className="mro-btn-alert-approve">APPROVE</button>
                <button className="mro-btn-secondary">HOLD</button>
              </div>
            </div>
          </div>

          {/* Screen 5: Meeting prep */}
          <div className="mro-sc" id="mro-c5">
            <div className="mro-meeting-card" id="mro-meeting-card">
              <div className="mro-meeting-pill">&#x1F4C5; MEETING IN 2 HOURS</div>
              <div className="mro-meeting-name">Director of Procurement - Regional Airline</div>
              <div className="mro-meeting-sub">11:30 AM Today</div>
              <div className="mro-m-section">
                <div className="mro-m-section-label">What she cares about</div>
                <div className="mro-m-bullets">
                  <div className="mro-m-bullet">AOG reduction and unplanned downtime</div>
                  <div className="mro-m-bullet">Vendor consolidation - fewer relationships, deeper partnerships</div>
                  <div className="mro-m-bullet">Compliance documentation and audit readiness</div>
                </div>
              </div>
              <div className="mro-m-section">
                <div className="mro-m-section-label">Fleet Focus</div>
                <div className="mro-m-bullets">
                  <div className="mro-m-bullet">High-cycle 737 operations, active MRO contracts</div>
                </div>
              </div>
              <div className="mro-best-angle-box">
                <div className="mro-ba-label">Best Angle</div>
                <div className="mro-ba-text">Reduce engine downtime 5-10 days per cycle. Protect the asset. Lead with maintenance interval extension, not price.</div>
              </div>
            </div>
          </div>

          {/* Screen 6: Weekly summary */}
          <div className="mro-sc" id="mro-c6">
            <div className="mro-summary-card" id="mro-summary-card">
              <div className="mro-summary-eyebrow">&#x1F4CA; WEEK IN REVIEW</div>
              <div className="mro-summary-stats">
                <div className="mro-stat"><div className="mro-stat-num">14</div><div className="mro-stat-lbl">Contacts Touched</div></div>
                <div className="mro-stat"><div className="mro-stat-num">5</div><div className="mro-stat-lbl">Emails Sent</div></div>
                <div className="mro-stat"><div className="mro-stat-num">3</div><div className="mro-stat-lbl">Replies Received</div></div>
              </div>
              <div className="mro-summary-status-row">
                <div className="mro-live-dot" />
                Pipeline summary drafted - queued for your review
              </div>
              <button className="mro-btn-approve-full">APPROVE TO SEND</button>
            </div>
          </div>
        </div>

        {/* Right panel: terminal */}
        <div id="mro-right">
          <div className="mro-terminal-header">REX ENGINE // LIVE LOG</div>
          <div id="mro-log-wrap"><div id="mro-log-entries" /></div>
        </div>
      </div>

      {/* Screen 7: Closer */}
      <div id="mro-screen7">
        <div className="mro-closer-rex" id="mro-closer-rex">REX</div>
        <div className="mro-closer-byline" id="mro-closer-byline">A custom AI agent built by AxiomStream Group</div>
        <div className="mro-closer-tagline" id="mro-closer-tagline">"Built for the ones who don't miss."</div>
        <div className="mro-closer-footer" id="mro-closer-footer">Powered by AxiomStream Group · axiomstreamgroup.com</div>
        <button id="mro-btn-replay">&#x21BA; Replay</button>
      </div>
    </div>
  )
}
