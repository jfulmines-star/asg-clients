import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'

// ─── CSS — exact match to lex.axiomstreamgroup.com/jj-lex baseline ───────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0a0a0a; --surface: #111111; --surface-2: #161616; --border: #1e1e1e;
  --primary: #27B5A3; --text: #f0f0f0; --text-2: #999999; --text-3: #555555;
  --user-bg: #161f1e; --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}
[data-theme="light"] {
  --bg: #f7f7f5; --surface: #ffffff; --surface-2: #f0f0ee; --border: #e0e0de;
  --text: #111111; --text-2: #555555; --text-3: #aaaaaa; --user-bg: #e8f5f3;
}
html, body { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font); -webkit-font-smoothing: antialiased; transition: background .25s, color .25s; }

/* PIN GATE */
#bt-gate { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; }
.bt-wordmark { font-size: 11px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: var(--text-3); margin-bottom: 48px; }
.bt-gate-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 44px 40px 40px; width: 100%; max-width: 380px; text-align: center; }
.bt-accent-bar { height: 3px; border-radius: 2px; margin: 0 auto 28px; }
.bt-gate-product { font-size: 28px; font-weight: 700; color: var(--text); margin-bottom: 6px; letter-spacing: -.02em; }
.bt-gate-sub { font-size: 14px; color: var(--text-2); margin-bottom: 36px; line-height: 1.5; }
.bt-pin-label { font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--text-3); margin-bottom: 14px; }
.bt-pin-inputs { display: flex; gap: 10px; justify-content: center; margin-bottom: 24px; }
.bt-pin-digit { width: 60px; height: 68px; background: var(--surface-2); border: 1.5px solid var(--border); border-radius: 10px; font-size: 26px; font-weight: 700; color: var(--text); text-align: center; outline: none; caret-color: var(--primary); transition: border-color .15s, background .15s; -webkit-appearance: none; font-family: var(--font); }
.bt-pin-digit:focus { border-color: var(--primary); background: rgba(39,181,163,.05); }
.bt-pin-digit.has-val { border-color: rgba(39,181,163,.4); }
@keyframes bt-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 60%{transform:translateX(8px)} }
.bt-pin-digit.error { border-color: #ef4444; animation: bt-shake .35s ease; }
.bt-unlock { width: 100%; padding: 14px; background: var(--primary); color: #000; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: opacity .15s; letter-spacing: .01em; font-family: var(--font); }
.bt-unlock:hover { opacity: .88; } .bt-unlock:disabled { opacity: .4; cursor: default; }
.bt-pin-error { font-size: 13px; color: #ef4444; margin-top: 12px; min-height: 18px; }
.bt-gate-security { margin-top: 28px; font-size: 11px; color: var(--text-3); line-height: 1.6; }

/* CHAT APP */
/* SIDEBAR LAYOUT */
#bt-outer { display: flex; height: 100vh; background: var(--bg); overflow: hidden; }
#bt-sidebar { width: 260px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 1px solid var(--border); background: var(--surface); overflow: hidden; transition: width .2s ease; }
#bt-sidebar.collapsed { width: 0; }
.bt-sidebar-head { padding: 14px 14px 10px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.bt-sidebar-workspace { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--text-3); margin-bottom: 10px; white-space: nowrap; overflow: hidden; }
.bt-new-chat-btn { width: 100%; padding: 9px 12px; background: var(--primary); color: #000; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; justify-content: center; transition: opacity .15s; white-space: nowrap; }
.bt-new-chat-btn:hover { opacity: .85; }
.bt-sidebar-threads { flex: 1; overflow-y: auto; padding: 6px; }
.bt-thread-item { padding: 9px 10px; border-radius: 8px; cursor: pointer; margin-bottom: 2px; border: 1px solid transparent; transition: background .12s; }
.bt-thread-item:hover { background: var(--surface-2); }
.bt-thread-item.active { background: rgba(39,181,163,.08); border-color: rgba(39,181,163,.2); }
.bt-thread-live-tag { font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--primary); margin-bottom: 3px; }
.bt-thread-date { font-size: 10px; color: var(--text-3); margin-bottom: 3px; font-weight: 600; white-space: nowrap; overflow: hidden; }
.bt-thread-name { font-size: 13px; font-weight: 600; color: var(--accent); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bt-thread-preview { font-size: 12px; color: var(--text-2); line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.bt-thread-rename { display: flex; gap: 5px; margin-top: 6px; }
.bt-thread-rename input { flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; font-size: 11px; color: var(--text); outline: none; min-width: 0; }
.bt-thread-rename input:focus { border-color: var(--primary); }
.bt-thread-rename-save { font-size: 11px; padding: 4px 8px; border-radius: 5px; border: none; cursor: pointer; background: var(--primary); color: #000; font-weight: 700; white-space: nowrap; }
.bt-thread-actions { display: flex; gap: 4px; margin-top: 5px; flex-wrap: wrap; }
/* Projects */
.bt-sidebar-section-label { font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--text-3); padding: 12px 10px 6px; display: flex; align-items: center; justify-content: space-between; }
.bt-sidebar-section-label button { background: none; border: none; color: var(--text-3); cursor: pointer; font-size: 16px; line-height: 1; padding: 0 2px; transition: color .12s; }
.bt-sidebar-section-label button:hover { color: var(--primary); }
.bt-project-item { margin-bottom: 4px; border-radius: 8px; border: 1px solid var(--border); overflow: hidden; }
.bt-project-header { display: flex; align-items: center; gap: 6px; padding: 8px 10px; cursor: pointer; transition: background .12s; }
.bt-project-header:hover { background: var(--surface-2); }
.bt-project-chevron { font-size: 9px; color: var(--text-3); transition: transform .15s; flex-shrink: 0; }
.bt-project-chevron.open { transform: rotate(90deg); }
.bt-project-name { font-size: 13px; font-weight: 600; color: var(--text); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bt-project-count { font-size: 11px; color: var(--text-3); flex-shrink: 0; }
.bt-project-threads { border-top: 1px solid var(--border); background: var(--bg); }
.bt-project-thread { padding: 7px 10px 7px 20px; font-size: 12px; color: var(--text-2); cursor: pointer; display: flex; align-items: flex-start; gap: 6px; transition: background .1s; border-bottom: 1px solid var(--border); }
.bt-project-thread:last-child { border-bottom: none; }
.bt-project-thread:hover { background: var(--surface); }
.bt-project-thread-label { flex: 1; line-height: 1.35; }
.bt-project-thread-date { font-size: 10px; color: var(--text-3); margin-bottom: 1px; }
.bt-project-thread-preview { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.bt-project-actions { display: flex; gap: 4px; padding: 6px 10px; border-top: 1px solid var(--border); background: var(--surface); }
.bt-new-project-form { padding: 8px 10px; border-top: 1px solid var(--border); }
.bt-new-project-form input { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 6px 10px; font-size: 12px; color: var(--text); outline: none; margin-bottom: 6px; font-family: var(--font); }
.bt-new-project-form input:focus { border-color: var(--primary); }
.bt-project-picker { position: absolute; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 6px; z-index: 50; min-width: 160px; box-shadow: 0 4px 16px rgba(0,0,0,.4); }
.bt-project-picker-item { padding: 7px 10px; font-size: 12px; color: var(--text-2); cursor: pointer; border-radius: 5px; white-space: nowrap; }
.bt-project-picker-item:hover { background: var(--surface-2); color: var(--text); }
.bt-thread-action-btn { font-size: 10px; padding: 3px 7px; border-radius: 5px; border: 1px solid var(--border); background: none; color: var(--text-3); cursor: pointer; transition: color .12s; }
.bt-thread-action-btn:hover { color: var(--text); border-color: var(--text-3); }
/* Archive view banner */
.bt-archive-banner { padding: 10px 24px; background: rgba(39,181,163,.07); border-bottom: 1px solid rgba(39,181,163,.2); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.bt-archive-banner-label { font-size: 12px; color: var(--primary); font-weight: 600; }
.bt-archive-banner-back { font-size: 12px; padding: 5px 12px; border-radius: 6px; border: 1px solid var(--primary); background: none; color: var(--primary); cursor: pointer; font-weight: 600; transition: background .12s; }
.bt-archive-banner-back:hover { background: rgba(39,181,163,.1); }
/* Mobile sidebar toggle */
.bt-sidebar-toggle { display: none; background: none; border: none; cursor: pointer; color: var(--text-2); padding: 4px; font-size: 18px; line-height: 1; }
@media (max-width: 640px) { .bt-sidebar-toggle { display: block; } #bt-sidebar { position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; transform: translateX(-100%); transition: transform .2s ease; } #bt-sidebar.mobile-open { transform: translateX(0); width: 280px; } #bt-sidebar-overlay { display: block !important; } }
#bt-sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 99; }
#bt-app { display: flex; flex-direction: column; flex: 1; min-width: 0; height: 100vh; }
#bt-header { display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 56px; border-bottom: 1px solid var(--border); flex-shrink: 0; background: rgba(10,10,10,.95); backdrop-filter: blur(12px); }
[data-theme="light"] #bt-header { background: rgba(247,247,245,.95); }
.bt-header-left { display: flex; align-items: center; gap: 10px; }
.bt-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.bt-header-name { font-size: 15px; font-weight: 700; color: var(--text); letter-spacing: -.01em; }
.bt-header-sep { font-size: 13px; color: var(--text-3); }
.bt-header-client { font-size: 15px; font-weight: 700; color: var(--text-2); }
.bt-header-right { display: flex; align-items: center; gap: 10px; }
.bt-font-toggle { display: flex; align-items: center; gap: 2px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 3px; flex-shrink: 0; }
.bt-font-btn { background: none; border: none; cursor: pointer; height: 26px; padding: 0 8px; border-radius: 5px; display: flex; align-items: center; justify-content: center; transition: background .15s; color: var(--text-3); line-height: 1; font-family: var(--font); font-weight: 700; }
.bt-font-btn:hover { background: var(--border); color: var(--text-2); }
.bt-font-btn.active { background: var(--primary); color: #000; }
.bt-theme-toggle { display: flex; align-items: center; gap: 2px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 3px; flex-shrink: 0; }
.bt-theme-btn { background: none; border: none; cursor: pointer; width: 26px; height: 26px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 13px; transition: background .15s; color: var(--text-3); }
.bt-theme-btn:hover { background: var(--border); color: var(--text-2); }
.bt-theme-btn.active { background: var(--primary); color: #000; }
.bt-version-btn { font-size: 11px; font-weight: 600; color: var(--text-3); padding: 4px 8px; border: 1px solid var(--border); border-radius: 4px; cursor: pointer; background: none; letter-spacing: .04em; font-family: var(--font); transition: border-color .15s, color .15s; }
.bt-version-btn:hover { border-color: var(--primary); color: var(--primary); }
.bt-asg { font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--text-3); }

/* Conversation */
#bt-convo { flex: 1; overflow-y: auto; padding: 32px 24px 16px; scroll-behavior: smooth; }
#bt-convo::-webkit-scrollbar { width: 4px; }
#bt-convo::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
#bt-convo.fs-s .bt-ai-content { font-size: 13px; line-height: 1.75; }
#bt-convo.fs-s .bt-user-bubble { font-size: 12px; }
#bt-convo.fs-m .bt-ai-content { font-size: 15px; line-height: 1.85; }
#bt-convo.fs-m .bt-user-bubble { font-size: 14px; }
#bt-convo.fs-l .bt-ai-content { font-size: 17px; line-height: 1.9; }
#bt-convo.fs-l .bt-user-bubble { font-size: 16px; }
.bt-msg { margin-bottom: 28px; animation: bt-fadeup .2s ease; }
.bt-convo-inner { max-width: 900px; margin: 0 auto; width: 100%; }
@keyframes bt-fadeup { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
.bt-user { display: flex; justify-content: flex-end; }
.bt-user-bubble { background: transparent; border: 1px solid rgba(39,181,163,.15); border-radius: 14px 14px 2px 14px; padding: 12px 16px; max-width: 75%; font-size: 14px; color: var(--text); line-height: 1.6; white-space: pre-wrap; }
.bt-ai { display: flex; flex-direction: column; }
.bt-ai-label { font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 10px; }
.bt-ai-content { font-size: 15px; line-height: 1.85; color: var(--text); }
.bt-ai-content strong { color: var(--text); font-weight: 700; }
.bt-ai-content em { font-style: italic; color: var(--text-2); }
.bt-ai-content ul, .bt-ai-content ol { padding-left: 20px; margin: 8px 0; }
.bt-ai-content li { margin-bottom: 6px; line-height: 1.7; }
.bt-ai-content p { margin-bottom: 12px; }
.bt-ai-content p:last-child { margin-bottom: 0; }
.bt-ai-content code { background: transparent; border: none; padding: 0; border-radius: 0; font-size: .9em; color: var(--primary); font-family: monospace; }
.bt-ai-content ::selection { background: transparent; color: inherit; }
.bt-ai-content *::selection { background: transparent; color: inherit; }
.bt-typing { display: flex; align-items: center; gap: 5px; padding: 4px 0; }
.bt-dot-t { width: 5px; height: 5px; border-radius: 50%; opacity: .4; animation: bt-pulse 1.2s ease infinite; }
.bt-dot-t:nth-child(2){animation-delay:.2s} .bt-dot-t:nth-child(3){animation-delay:.4s}
@keyframes bt-pulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
.bt-cursor { display: inline-block; width: 2px; height: .85em; background: var(--primary); margin-left: 1px; vertical-align: text-bottom; animation: bt-blink .7s steps(1) infinite; }
@keyframes bt-blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
.bt-history-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; cursor: pointer; transition: border-color .15s; margin-bottom: 10px; }
.bt-history-card:hover { border-color: var(--accent); }
.bt-history-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.bt-history-card-date { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--text-3); }
.bt-history-card-count { font-size: 11px; color: var(--text-3); }
.bt-history-card-name { font-size: 13px; font-weight: 600; color: var(--accent); margin-bottom: 4px; }
.bt-history-card-preview { font-size: 13px; color: var(--text-2); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.bt-history-rename { display: flex; gap: 6px; margin-top: 8px; }
.bt-history-rename input { flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 5px 10px; font-size: 12px; color: var(--text); outline: none; }
.bt-history-rename input:focus { border-color: var(--accent); }
.bt-history-rename-btn { font-size: 11px; padding: 5px 10px; border-radius: 6px; border: none; cursor: pointer; background: var(--accent); color: #000; font-weight: 600; }
.bt-session-msg { padding: 10px 0; border-bottom: 1px solid var(--border); }
.bt-session-msg:last-child { border-bottom: none; }
.bt-session-msg-role { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--text-3); margin-bottom: 4px; }
.bt-session-msg-body { font-size: 13px; color: var(--text-2); line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
.bt-session-divider { display: flex; align-items: center; gap: 12px; margin: 28px 0 24px; }
.bt-session-divider-line { flex: 1; height: 1px; background: var(--border); }
.bt-session-divider-label { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--text-3); white-space: nowrap; }

/* Team Intel */
.bt-intel-btn { position: relative; display: flex; align-items: center; gap: 6px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 4px 10px; font-size: 12px; font-weight: 600; color: var(--text-2); cursor: pointer; transition: border-color .15s, color .15s; font-family: var(--font); }
.bt-intel-btn:hover { border-color: var(--primary); color: var(--text); }
.bt-intel-badge { position: absolute; top: -5px; right: -5px; background: var(--primary); color: #000; font-size: 9px; font-weight: 800; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: bt-pop .2s ease; }
@keyframes bt-pop { from{transform:scale(0)} to{transform:scale(1)} }
.bt-intel-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; margin: 0 24px 20px; overflow: hidden; }
.bt-intel-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px 12px; border-bottom: 1px solid var(--border); }
.bt-intel-title { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--text-3); }
.bt-intel-close { background: none; border: none; color: var(--text-3); cursor: pointer; font-size: 14px; padding: 0; font-family: var(--font); }
.bt-intel-item { padding: 12px 18px; border-bottom: 1px solid var(--border); }
.bt-intel-item:last-child { border-bottom: none; }
.bt-intel-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.bt-intel-who { font-size: 10px; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: .06em; }
.bt-intel-time { font-size: 10px; color: var(--text-3); }
.bt-intel-content { font-size: 13px; color: var(--text-2); line-height: 1.65; }
.bt-intel-empty { padding: 20px 18px; font-size: 13px; color: var(--text-3); text-align: center; }

/* Welcome */
.bt-welcome { max-width: 860px; margin: 0 auto; }
.bt-how-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px 24px; margin-bottom: 16px; }
.bt-section-label { font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--text-3); margin-bottom: 10px; }
.bt-agent-grid { display: grid; gap: 10px; margin-bottom: 16px; }
.bt-agent-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; }
.bt-agent-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.bt-chip-wrap { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 0; }
.bt-chip { background: var(--surface-2); border: 1px solid var(--border); border-radius: 20px; padding: 8px 16px; font-size: 13px; color: var(--text-2); cursor: pointer; transition: background .15s, border-color .15s, color .15s; line-height: 1.4; }
.bt-chip:hover { border-color: var(--primary); color: var(--text); }

/* Input */
#bt-input-area { border-top: 1px solid var(--border); padding: 14px 24px 10px; flex-shrink: 0; background: var(--bg); }
.bt-input-wrap-outer { max-width: 900px; margin: 0 auto; }
.bt-input-wrap { display: flex; align-items: flex-end; gap: 10px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 12px 12px 12px 16px; transition: border-color .15s; }
.bt-input-wrap:focus-within { border-color: rgba(39,181,163,.4); }
#bt-input { flex: 1; background: none; border: none; outline: none; color: var(--text); font-family: var(--font); font-size: 16px; line-height: 1.6; resize: none; max-height: 160px; min-height: 24px; }
#bt-input::placeholder { color: var(--text-3); }
#bt-send { width: 34px; height: 34px; background: var(--primary); color: #000; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: opacity .15s; font-size: 17px; font-weight: 700; font-family: var(--font); }
#bt-send:hover { opacity: .85; } #bt-send:disabled { opacity: .3; cursor: default; }
#bt-security-bar { display: flex; align-items: center; justify-content: space-between; padding: 6px 2px 2px; }
.bt-security-slug { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-3); font-family: monospace; }
.bt-input-hint { font-size: 11px; color: var(--text-3); }
.bt-msg-actions { display: flex; gap: 8px; margin-top: 8px; opacity: 0; transition: opacity .15s; }
.bt-msg.bt-ai:hover .bt-msg-actions { opacity: 1; }
.bt-msg-action-btn { font-size: 12px; }
.bt-msg-action-btn { font-size: 11px; color: var(--text-3); background: var(--surface-2); border: 1px solid var(--border); border-radius: 6px; padding: 3px 9px; cursor: pointer; font-family: var(--font); transition: color .15s, border-color .15s; }
.bt-msg-action-btn:hover { color: var(--text); border-color: var(--primary); }
.bt-msg-action-btn.copied { color: var(--primary); border-color: var(--primary); }

/* Release notes modal */
#bt-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 300; align-items: center; justify-content: center; padding: 24px; }
#bt-modal.open { display: flex; }
.bt-modal-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 36px; max-width: 520px; width: 100%; max-height: 80vh; overflow-y: auto; }
.bt-modal-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.bt-modal-title { font-size: 20px; font-weight: 700; color: var(--text); letter-spacing: -.01em; }
.bt-modal-version { font-size: 12px; color: var(--primary); font-weight: 700; margin-top: 4px; }
.bt-modal-close { background: none; border: none; color: var(--text-3); font-size: 20px; cursor: pointer; }
.bt-release-section { margin-bottom: 20px; }
.bt-release-title { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--text-3); margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
.bt-release-item { display: flex; gap: 10px; margin-bottom: 10px; font-size: 13px; color: var(--text-2); line-height: 1.5; }
.bt-release-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--primary); flex-shrink: 0; margin-top: 6px; }

@media (max-width: 600px) {
  /* Layout */
  #bt-convo { padding: 20px 14px 12px; }
  #bt-input-area { padding: 10px 12px 8px; }
  .bt-gate-card { padding: 36px 24px 32px; }

  /* Hide desktop chrome */
  .bt-asg { display: none; }
  .bt-version-btn { display: none; }
  .bt-font-toggle { display: none; }
  .bt-mobile-hide { display: none !important; }

  /* Bigger chat text */
  #bt-convo.fs-s .bt-ai-content { font-size: 16px; line-height: 1.75; }
  #bt-convo.fs-s .bt-user-bubble { font-size: 15px; }
  #bt-convo.fs-m .bt-ai-content { font-size: 17px; line-height: 1.85; }
  #bt-convo.fs-m .bt-user-bubble { font-size: 16px; }
  #bt-convo.fs-l .bt-ai-content { font-size: 19px; line-height: 1.9; }
  #bt-convo.fs-l .bt-user-bubble { font-size: 18px; }

  /* Bigger input */
  #bt-input { font-size: 17px; }
  #bt-send { width: 40px; height: 40px; font-size: 19px; }
  .bt-input-wrap { padding: 12px 10px 12px 14px; border-radius: 16px; }

  /* Bigger header */
  #bt-header { padding: 0 14px; height: 52px; }
  .bt-header-name { font-size: 17px; }
  .bt-header-client { font-size: 15px; }

  /* Welcome screen */
  .bt-how-card { padding: 18px 18px; }
  .bt-how-card p { font-size: 16px !important; }
  .bt-how-card p[style*="paddingLeft"] { font-size: 15px !important; }
  .bt-chip { font-size: 15px; padding: 10px 18px; }
  .bt-section-label { font-size: 12px; }
  .bt-agent-card { padding: 16px; }
  .bt-agent-card p { font-size: 14px !important; }

  /* Bigger AI agent label */
  .bt-ai-label { font-size: 12px; }

  /* Security bar — smaller on mobile */
  .bt-security-slug { font-size: 10px; }
  .bt-input-hint { font-size: 10px; }
}
`

// ─── Agent config ─────────────────────────────────────────────────────────────
const AGENTS: Record<string, { name: string; domain: string; color: string; version: string; releaseNotes: { section: string; items: string[] }[] }> = {
  kit: {
    name: 'Kit', domain: 'Personal AI', color: '#A78BFA', version: 'v1.0',
    releaseNotes: [
      { section: 'Your Personal Kit', items: ['Built specifically for you — knows your world, remembers your conversations.', 'Helpful for school, college research, life stuff, and Bills discourse.', 'Your chats are private to you.'] }
    ]
  },
  aria: {
    name: 'Aria', domain: 'Tax & Accounting', color: '#27B5A3', version: 'v1.3',
    releaseNotes: [
      { section: "What's New in v1.3", items: ["Team Intel — say 'log for team' and captures are instantly available to every teammate. Unread badge alerts you when new intel is waiting.", "Cross-session memory — full conversation history loads automatically on every return visit.", "Advisor-first conversation flow — scopes your desired output before diving in."] },
      { section: "Previous (v1.2)", items: ["IRC and tax citation highlighting — §§, Treas. Reg., Rev. Rul., IRS Notice, and ASC references highlighted automatically.", "Cross-device session history.", "Coordinated multi-agent openings."] },
      { section: "Previous (v1.1)", items: ["72-hour trial enforcement.", "IRC, ASC 740, transfer pricing, SALT, international coverage.", "Personalized calibration to your practice."] }
    ]
  },
  lex: {
    name: 'Lex', domain: 'Legal & Compliance', color: '#E8B84B', version: 'v1.3',
    releaseNotes: [
      { section: "What's New in v1.3", items: ["Team Intel — say 'log for team' and captures are instantly available to every teammate. Unread badge alerts you when new intel is waiting.", "Cross-session memory — full conversation history loads automatically on every return visit.", "Advisor-first conversation flow — scopes your desired output before diving in."] },
      { section: "Previous (v1.2)", items: ["Legal citation auto-highlight — statutes, regulations, case references surfaced clearly.", "Cross-device session history.", "Coordinated multi-agent openings."] },
      { section: "Previous (v1.1)", items: ["Motion drafting, memos, case analysis, argument construction.", "72-hour trial with expiry notifications."] }
    ]
  },
  rex: {
    name: 'Rex', domain: 'Sales & Revenue', color: '#4ADE80', version: 'v1.3',
    releaseNotes: [
      { section: "What's New in v1.3", items: ["Team Intel — say 'log for team' and captures are instantly available to every teammate. Unread badge alerts you when new intel is waiting.", "Cross-session memory — full conversation history loads automatically on every return visit.", "Advisor-first conversation flow — Rex scopes what you need before diving into strategy."] },
      { section: "Previous (v1.2)", items: ["CRM platform authority — HubSpot, Salesforce, Pipedrive.", "Diagnosis-first posture — identifies what's broken before prescribing fixes.", "Pipeline coverage ratios, deal velocity, stage conversion analysis."] },
      { section: "Previous (v1.1)", items: ["Prospect research and outreach drafting.", "Deal coaching and pipeline review."] }
    ]
  },
  atlas: {
    name: 'Atlas', domain: 'Data & Engineering', color: '#E8724B', version: 'v1.3',
    releaseNotes: [
      { section: "What's New in v1.3", items: ["Team Intel — say 'log for team' and captures are instantly available to every teammate. Unread badge alerts you when new intel is waiting.", "Cross-session memory — full conversation history loads automatically on every return visit.", "Advisor-first conversation flow — scopes your desired output before diving in."] },
      { section: "Previous (v1.2)", items: ["Code block rendering — SQL, Python, YAML, shell snippets.", "GL normalization and financial data pipeline design.", "Architecture documentation and runbook drafting."] },
      { section: "Previous (v1.1)", items: ["Databricks, Snowflake, dbt, Spark coverage.", "Query optimization and code review."] }
    ]
  }
}

// ─── Client registry ──────────────────────────────────────────────────────────
const REGISTRY: Record<string, { name: string; agents: string[]; pin: string; team?: boolean; teamLabel?: string; partnerName?: string; openingMessage?: string }> = {
  jj:            { name: 'JJ Fulmines',           agents: ['aria', 'lex', 'rex'],  pin: '2847' },
  lilyg:         { name: 'Lily',                  agents: ['kit'],                 pin: '0713', openingMessage: "Hey Lily — I'm Kit. Unlike ChatGPT, I actually know who you are and I never forget. Next time you talk to me, I'll remember exactly where we left off — no re-explaining, no starting over. Your dad set this up so you'd have something built for you, not just for everyone. I'm good at school stuff, college research, pretty much anything you're thinking through. Also fully willing to discuss Josh Allen at any time. What do you need?" },
  demo:          { name: 'Demo Account',           agents: ['aria', 'lex', 'rex', 'atlas'], pin: '0000', team: true, teamLabel: 'Demo Team' },
  shield:        { name: 'Shield Technologies',    agents: ['rex'],                 pin: '5591', team: true, teamLabel: 'Shield Technologies Sales' },
  ryanh:         { name: 'Ryan Hopper',            agents: ['rex'],                 pin: '5506' },
  markb:         { name: 'Mark Bechtel',           agents: ['rex'],                 pin: '8821' },
  'shield-jeffd':   { name: 'Jeff Dicks',              agents: ['rex'],                 pin: '7742' },
  'shield-jimoaks': { name: 'Jim Oaks',                agents: ['rex'],                 pin: '3381' },
  teamrex:       { name: 'Team Member',             agents: ['rexteam'],             pin: '4429', team: true, teamLabel: 'Team' },
  octant8kevin:  { name: 'Kevin Gosa',             agents: ['rex'],                 pin: '6294', team: true, teamLabel: 'Octant8', partnerName: 'Bryan' },
  octant8bryan:  { name: 'Bryan Horvath',          agents: ['rex'],                 pin: '8537', team: true, teamLabel: 'Octant8', partnerName: 'Kevin' },
  // INACTIVE 2026-04-17 — DXD not purchasing at this time (BMB)
  // dxdmike:       { name: 'Mike Gugino',            agents: ['dxd'],                 pin: '7731' },
  // dxddean:       { name: 'Dean Pratt',             agents: ['dxd'],                 pin: '9284' },
  anttip:           { name: 'Antti Pasila',           agents: ['kit'],                 pin: '2010', openingMessage: "Hei Antti — olen Kit.\n\nTiedän jo kuka olet. Kiosked, GraphoGame, DeepScan, Cyans — ja nyt Platinum.ai. Rakennat AI-löydettävyystuotetta samaan aikaan kun koko ala herää tähän ongelmaan. Hyvä timing.\n\nErona siihen että käyttäisit Claudea tai ChatGPT:tä suoraan: minulla on muisti. Muistan kaiken mitä käymme läpi — ensi kerralla kun avaat tämän, jatkamme siitä mihin jäimme. Ei selitellä alusta. Voin myös lähettää sähköpostia puolestasi ja tehdä tutkimusta — en vain generoi tekstiä.\n\nVoit puhua kanssani suomeksi tai englanniksi, kumpi tuntuu luontevammalta. Seuraan mukana ilman kommentteja.\n\nMitä on juuri nyt mielessä?" },
  'winthrop-blake':  { name: 'Blake Warren',           agents: ['rex'],                 pin: '4321' },
  'winthrop-andrew': { name: 'Andrew Armour',          agents: ['rex'],                 pin: '6847' },
  kenk:              { name: 'Ken Kocolowski',         agents: ['rex'],                 pin: '2847' },
  'devalk-sean':     { name: 'Sean Lair',               agents: ['lex'],                 pin: '1604' },

}

// ─── Markdown ────────────────────────────────────────────────────────────────
function renderMd(text: string) {
  return text
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid var(--border-1);margin:8px 0">')
    .replace(/^# (.+)$/gm, '<strong style="font-size:17px;display:block;margin:4px 0">$1</strong>')
    .replace(/^### (.+)$/gm, '<strong style="font-size:13px;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em">$1</strong>')
    .replace(/^## (.+)$/gm, '<strong style="font-size:15px">$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^[•\-] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br>')
}

// ─── Starters ────────────────────────────────────────────────────────────────
function starters(agents: string[], slug = '') {
  // Per-client starters
  if (slug === 'teamrex') return [
    "I have a new business idea — help me evaluate it.",
    "Help me research a market opportunity and size it up.",
    "Draft a proposal for a prospect we're meeting this week.",
    "What's the smartest next move for our pipeline right now?",
  ]
  if (slug.startsWith('octant8')) return [
    "I have a new business idea I want to vet — where should I start?",
    "Help me score an idea: is it viable, scalable, and does it make money?",
    "We want to evaluate a new market opportunity — walk me through a competitive analysis.",
  ]
  if (slug === 'lilyg') return [
    "Help me outline my college essay — I don't know where to start.",
    "Make the case for Josh Allen as the best QB in the NFL right now.",
  ]
  // INACTIVE 2026-04-17 — DXD portals disabled (BMB)
  // if (slug === 'dxdmike') return [...]
  // if (slug === 'dxddean') return [...]
  if (slug === 'ryanh') return [
    "Walk me through the top NAVSEA buying commands for our NSN-assigned corrosion products.",
    "Help me build a capture strategy for a Coast Guard Acquisition Directorate opportunity.",
    "Draft an outbound email to a depot contracting officer we haven't worked with before.",
    "What are the strongest proof points I should lead with when briefing a Navy program office?",
  ]
  if (slug === 'anttip') return [
    "Mikä erottaa Platinum.ai:n kilpailijoista pitkässä juoksussa?",
    "What's the distribution model that actually scales for AWP — is it direct, channel, or something else?",
    "Haluaisin ajatella ääneen Cyans-portfolion fokuksesta. Missä panostetaan?",
    "What would you do differently if you were rebuilding Kiosked today with current AI infrastructure?",
  ]
  const s = new Set(agents)
  if (s.has('aria') && s.has('lex')) return [
    "We're advising on a 1031 exchange — the counterparty wants unusual indemnification language. Tax and legal implications?",
    "Client wants a Delaware holding company. Tax benefits and what the operating agreement needs to address?",
    "Employee equity plan with ISOs and NQSOs — tax treatment for each and what the option agreements must include?",
  ]
  if (s.has('aria') && s.has('rex')) return [
    "We're selling tax advisory services to CFOs. What's the pitch and what objections should we expect?",
    "Help me structure a proposal for a company needing tax planning and a CRM overhaul.",
  ]
  return [
    "Walk me through how you'd approach a complex cross-domain problem.",
    "What's the first thing I should do to get the most from this workspace?",
  ]
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function BundleChat() {
  const { clientSlug } = useParams<{ clientSlug: string }>()
  const slug = (clientSlug ?? '').toLowerCase()
  const config = REGISTRY[slug]

  // Compute agent colors early so CSS var can be set before first render
  const _agentIds = config ? config.agents.filter(a => AGENTS[a]) : []
  const _metas = _agentIds.map(a => AGENTS[a])
  const primaryColor = _metas[0]?.color ?? '#27B5A3'

  const [authed, setAuthed] = useState(false)
  // Auto-fill member name from registry if config has a clear first name (skip name entry screen)
  const autoName = config ? config.name.split(' ')[0] : ''
  const [memberName, setMemberName] = useState(() => localStorage.getItem(`asg-member:${slug}`) || autoName)
  const [memberInput, setMemberInput] = useState('')
  const [memberSet, setMemberSet] = useState(() => !!(localStorage.getItem(`asg-member:${slug}`) || autoName))
  const [pinDigits, setPinDigits] = useState(['', '', '', ''])
  const [pinError, setPinError] = useState('')
  const [shaking, setShaking] = useState(false)
  const [theme, setThemeState] = useState(() => localStorage.getItem('asg-theme') || 'dark')
  const [fontSize, setFontSizeState] = useState(() => localStorage.getItem('asg-fontsize') || 'm')
  const [thread, setThread] = useState<{ role: string; agent?: string; content: string; loading?: boolean; streaming?: boolean; id: string; divider?: boolean }[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [intelOpen, setIntelOpen] = useState(false)
  const [intelCaptures, setIntelCaptures] = useState<{ member: string; agent: string; content: string; ts: number }[]>([])
  const [intelUnread, setIntelUnread] = useState(0)

  // ── Sidebar / Conversations ───────────────────────────────────────────────
  // Personal agents (Kit) start with sidebar collapsed — no clutter for Lily
  const isPersonal = config?.agents.length === 1 && config.agents[0] === 'kit'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isPersonal)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Conversation model — each conversation has a UUID, name, and isolated thread
  type Conv = { convId: string; name: string; ts: number; messageCount: number; preview: string }
  const [conversations, setConversations] = useState<Conv[]>([])
  const [convsLoading, setConvsLoading] = useState(false)
  const [activeConvId, setActiveConvId] = useState<string | null>(null) // null = new unsaved conversation
  const [editingConvName, setEditingConvName] = useState<{ convId: string; value: string } | null>(null)

  const loadConversations = async (mem: string) => {
    setConvsLoading(true)
    try {
      const r = await fetch(`/api/conversations?slug=${encodeURIComponent(slug)}&member=${encodeURIComponent(mem)}`)
      const d = await r.json()
      setConversations(d.conversations || [])
    } catch { setConversations([]) }
    setConvsLoading(false)
  }

  const openConversation = async (convId: string) => {
    const mem = (memberName || 'anonymous').toLowerCase()
    try {
      const r = await fetch(`/api/conversations?slug=${encodeURIComponent(slug)}&member=${encodeURIComponent(mem)}&convId=${encodeURIComponent(convId)}`)
      const d = await r.json()
      const rawMsgs: { role: string; agent?: string; content: string; ts: number }[] = d.messages || []
      const loadedThread = rawMsgs.map((msg, i) => ({
        role: msg.role === 'user' ? 'user' : 'agent',
        agent: msg.agent,
        content: msg.content,
        id: `conv-${convId}-${i}`,
      }))
      setThread(loadedThread)
      setHistoryLoaded(true)
      setActiveConvId(convId)
    } catch { /* ignore */ }
    setMobileSidebarOpen(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // Pending new conversation name — set when user requests a named new conversation via chat
  const pendingConvName = useRef<string>('New chat')

  // Create a named conversation immediately (on button click or chat phrase) — appears in sidebar right away
  const startNewChat = async (name?: string) => {
    const mem = (memberName || 'anonymous').toLowerCase()
    const convName = name || 'New chat'
    try {
      const r = await fetch('/api/conversations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', slug, member: mem, name: convName }),
      })
      const d = await r.json()
      if (d.convId) {
        setActiveConvId(d.convId)
        setThread([])
        setHistoryLoaded(true)
        setMobileSidebarOpen(false)
        // Add to conversations list immediately (don't wait for reload)
        const newConv: Conv = { convId: d.convId, name: convName, ts: Date.now(), messageCount: 0, preview: '' }
        setConversations(prev => [newConv, ...prev])
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    } catch { /* ignore */ }
  }

  const returnToLive = () => {
    setActiveConvId(null)
    setThread([])
    setHistoryLoaded(false) // triggers history reload (Home view = all messages)
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState<{ id: string; name: string; createdAt: number; sessionIndexes: number[] }[]>([])
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [creatingProject, setCreatingProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [renamingProject, setRenamingProject] = useState<{ id: string; value: string } | null>(null)
  const [addingToProject, setAddingToProject] = useState<number | null>(null) // sessionIndex being added

  const loadProjects = async (mem: string) => {
    try {
      const r = await fetch(`/api/projects?slug=${encodeURIComponent(slug)}&member=${encodeURIComponent(mem)}`)
      const d = await r.json()
      setProjects(d.projects || [])
    } catch { /* ignore */ }
  }

  const createProject = async (name: string) => {
    const mem = (memberName || 'anonymous').toLowerCase()
    const r = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', slug, member: mem, name }),
    })
    const d = await r.json()
    if (d.project) setProjects(prev => [...prev, d.project])
    setCreatingProject(false)
    setNewProjectName('')
    setExpandedProjects(prev => new Set([...prev, d.project.id]))
  }

  const renameProject = async (id: string, name: string) => {
    const mem = (memberName || 'anonymous').toLowerCase()
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rename', slug, member: mem, projectId: id, name }),
    })
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p))
    setRenamingProject(null)
  }

  const deleteProject = async (id: string) => {
    const mem = (memberName || 'anonymous').toLowerCase()
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', slug, member: mem, projectId: id }),
    })
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const addThreadToProject = async (projectId: string, sessionIndex: number) => {
    const mem = (memberName || 'anonymous').toLowerCase()
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add-thread', slug, member: mem, projectId, sessionIndex }),
    })
    setProjects(prev => prev.map(p => p.id === projectId && !p.sessionIndexes.includes(sessionIndex)
      ? { ...p, sessionIndexes: [...p.sessionIndexes, sessionIndex] } : p))
    setAddingToProject(null)
  }

  const removeThreadFromProject = async (projectId: string, sessionIndex: number) => {
    const mem = (memberName || 'anonymous').toLowerCase()
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove-thread', slug, member: mem, projectId, sessionIndex }),
    })
    setProjects(prev => prev.map(p => p.id === projectId
      ? { ...p, sessionIndexes: p.sessionIndexes.filter(i => i !== sessionIndex) } : p))
  }

  // renameThread kept for backward compat but uses conversations API
  const renameThread = async (convId: string, name: string) => {
    const mem = (memberName || 'anonymous').toLowerCase()
    await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rename', slug, member: mem, convId, name }),
    })
    setConversations(prev => prev.map(c => c.convId === convId ? { ...c, name } : c))
    setEditingConvName(null)
  }

  // ── Documents ────────────────────────────────────────────────────────────────
  const [docsOpen, setDocsOpen] = useState(false)
  const [docs, setDocs] = useState<{ id: string; filename: string; status: string; chunk_count: number; created_at: string }[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const docFileRef = useRef<HTMLInputElement>(null)

  const loadDocs = async () => {
    try {
      const r = await fetch(`/api/rag-documents?tenantId=${slug}`)
      if (r.ok) setDocs(await r.json())
    } catch {}
  }

  const handleDocUpload = async (file: File) => {
    setUploading(true)
    setUploadError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('tenantId', slug)
      const r = await fetch('/api/rag-upload', { method: 'POST', body: fd })
      if (!r.ok) throw new Error((await r.json()).error || 'Upload failed')
      await loadDocs()
    } catch (e: any) {
      setUploadError(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const deleteDoc = async (id: string) => {
    if (!confirm('Remove this document from your knowledge base?')) return
    await fetch(`/api/rag-documents?id=${id}&tenantId=${slug}`, { method: 'DELETE' })
    await loadDocs()
  }

  const openDocs = () => { setDocsOpen(true); setDocsLoading(true); loadDocs().finally(() => setDocsLoading(false)) }
  const closeDocs = () => { setDocsOpen(false); setUploadError('') }

  const convoRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // ── Paced streaming queue — decouples SSE reception from visual render speed ──
  const streamQueues = useRef<Map<string, string[]>>(new Map())
  const streamDraining = useRef<Set<string>>(new Set())
  const streamDone = useRef<Set<string>>(new Set())
  const DRAIN_INTERVAL_MS = 42 // ~1 word per tick feels natural for reading along

  const startDrain = useCallback((id: string) => {
    if (streamDraining.current.has(id)) return
    streamDraining.current.add(id)
    const drain = () => {
      const q = streamQueues.current.get(id)
      if (q && q.length > 0) {
        const chunk = q.shift()!
        setThread(prev => prev.map(t => t.id === id ? { ...t, content: t.content + chunk } : t))
        // Scroll: keep bottom visible only if already near the bottom
        if (convoRef.current) {
          const el = convoRef.current
          if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
            el.scrollTop = el.scrollHeight
          }
        }
        setTimeout(drain, DRAIN_INTERVAL_MS)
      } else if (streamDone.current.has(id)) {
        streamDraining.current.delete(id)
        streamDone.current.delete(id)
        streamQueues.current.delete(id)
        setThread(prev => prev.map(t => t.id === id ? { ...t, streaming: false } : t))
      } else {
        setTimeout(drain, DRAIN_INTERVAL_MS) // queue empty but stream still open — wait
      }
    }
    setTimeout(drain, DRAIN_INTERVAL_MS)
  }, [])

  // Inject CSS
  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = CSS
    document.head.prepend(el)
    return () => el.remove()
  }, [])

  // Load team intel (for team accounts)
  const loadIntel = () => {
    if (!slug || !config?.team) return
    const member = (memberName || 'anonymous').toLowerCase()
    fetch(`/api/team-intel?slug=${encodeURIComponent(slug)}&member=${encodeURIComponent(member)}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.captures)) setIntelCaptures(data.captures)
        setIntelUnread(data.unreadCount ?? 0)
      })
      .catch(() => {})
  }

  useEffect(() => {
    if (authed && memberSet) {
      loadIntel()
      const mem = (memberName || 'anonymous').toLowerCase()
      loadConversations(mem)
      loadProjects(mem)
    }
  }, [authed, memberSet])

  const openIntel = () => {
    setIntelOpen(true)
    setIntelUnread(0)
    // Mark as seen in Redis
    const member = (memberName || 'anonymous').toLowerCase()
    fetch('/api/team-intel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_seen', slug, member }),
    }).catch(() => {})
  }

  // Load cross-session history once auth + member identity are confirmed
  useEffect(() => {
    if (!authed || !memberSet || !slug || historyLoaded) return
    const member = memberName || 'anonymous'
    setHistoryLoaded(true)
    // Load conversations list, then open the most recent one (or show empty state)
    const mem = member.toLowerCase()
    fetch(`/api/conversations?slug=${encodeURIComponent(slug)}&member=${encodeURIComponent(mem)}`)
      .then(r => r.json())
      .then(data => {
        const convList: Conv[] = data.conversations || []
        setConversations(convList)
        // Always start in Home view — load recent messages from flat history
        fetch(`/api/history?slug=${encodeURIComponent(slug)}&member=${encodeURIComponent(mem)}`)
          .then(r => r.json())
          .then(hd => {
            if (!Array.isArray(hd.messages) || hd.messages.length === 0) return
            const prior = hd.messages
              .filter((m: { role: string; content: string }) =>
                m.content?.trim().length > 0 && m.role !== 'system' && m.content !== '___SESSION_BREAK___')
              .map((m: { role: string; agent?: string; content: string; ts: number }, i: number) => ({
                role: m.role === 'user' ? 'user' : 'agent',
                agent: m.agent,
                content: m.content,
                id: `hist-${m.ts}-${i}`,
              }))
            if (prior.length > 0) {
              setThread(prior)
              setTimeout(() => {
                if (convoRef.current) convoRef.current.scrollTop = convoRef.current.scrollHeight
              }, 100)
            }
          })
          .catch(() => {})
      })
      .catch(() => { /* history unavailable — start fresh silently */ })
  }, [authed, memberSet, slug, memberName, historyLoaded, config])

  // Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('asg-theme', theme)
  }, [theme])

  // Apply agent brand color as CSS variable so all --primary references match
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor)
    // Derive a subtle tinted background for user bubbles
    document.documentElement.style.setProperty('--user-bg', primaryColor + '18')
  }, [primaryColor])

  // Scroll to bottom when user sends a message (so their bubble is visible)
  const prevLengthRef = useRef(0)
  useEffect(() => {
    const userMsgs = thread.filter(t => t.role === 'user').length
    if (userMsgs > prevLengthRef.current) {
      prevLengthRef.current = userMsgs
      if (convoRef.current) convoRef.current.scrollTo({ top: convoRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [thread])

  if (!config) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#555' }}>Bundle not found: /{slug}</p></div>

  const agentIds = _agentIds
  const metas = _metas

  // ── PIN handlers ────────────────────────────────────────────────────────────
  const handlePinInput = (i: number, v: string) => {
    const c = v.replace(/\D/g, '').slice(-1)
    const next = [...pinDigits]; next[i] = c; setPinDigits(next); setPinError('')
    if (c && i < 3) pinRefs[i + 1].current?.focus()
  }

  const handlePinKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pinDigits[i] && i > 0) { pinRefs[i - 1].current?.focus(); const n = [...pinDigits]; n[i - 1] = ''; setPinDigits(n) }
    if (e.key === 'Enter') submitPin()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    const next = ['', '', '', '']
    p.split('').forEach((c, j) => { next[j] = c })
    setPinDigits(next)
    pinRefs[Math.min(p.length, 3)].current?.focus()
  }

  const submitPin = () => {
    const pin = pinDigits.join('')
    if (pin.length < 4) return
    if (pin === config.pin) { setAuthed(true) }
    else {
      setShaking(true); setPinError('Incorrect PIN. Check your onboarding email.')
      setTimeout(() => { setShaking(false); setPinDigits(['', '', '', '']); pinRefs[0].current?.focus() }, 400)
    }
  }

  // ── Chat ────────────────────────────────────────────────────────────────────
  const streamAgent = async (agent: string, id: string, body: object) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, stream: true }),
      })
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      // Handle JSON response (non-streaming tool-use path e.g. Winthrop portals)
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await res.json()
        if (data.error) {
          setThread(prev => prev.map(t => t.id === id ? { ...t, content: data.error, loading: false, streaming: false } : t))
          return
        }
        if (data.text) {
          setThread(prev => prev.map(t => t.id === id ? { ...t, content: data.text, loading: false, streaming: false } : t))
        }
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let started = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') {
            // Mark stream done — drain queue will finalize streaming: false when queue empties
            streamDone.current.add(id)
            return
          }
          try {
            const ev = JSON.parse(raw)
            if (ev.error) {
              setThread(prev => prev.map(t => t.id === id ? { ...t, content: ev.error, loading: false, streaming: false } : t))
              return
            }
            if (ev.text) {
              if (!started) {
                started = true
                // Flip from loading dots to streaming — show first chunk immediately
                setThread(prev => prev.map(t => t.id === id ? { ...t, loading: false, streaming: true, content: '' } : t))
                // Scroll to TOP of this message after DOM updates
                setTimeout(() => {
                  const msgEl = messageRefs.current.get(id)
                  if (msgEl && convoRef.current) {
                    const container = convoRef.current
                    const elTop = msgEl.offsetTop - container.getBoundingClientRect().top + container.scrollTop
                    container.scrollTo({ top: elTop - 20, behavior: 'smooth' })
                  }
                }, 60)
                // Init queue
                streamQueues.current.set(id, [])
              }
              // Push chunk to queue — drain loop handles paced rendering
              streamQueues.current.get(id)?.push(ev.text)
              startDrain(id)
            }
          } catch { /* skip bad JSON */ }
        }
      }
      // Stream ended without [DONE] — mark done anyway
      streamDone.current.add(id)
    } catch {
      setThread(prev => prev.map(t => t.id === id ? { ...t, content: 'Connection error — try again.', loading: false, streaming: false } : t))
    }
  }

  const sendMessage = async (msg?: string) => {
    const text = (msg ?? input).trim()
    if (!text || busy) return

    // New project trigger — "new project: Name" / "create project Name" / "start project Name"
    const newProjectMatch = text.match(/^(?:new|create|start(?: a| new)?)(?: a)? project[:\-–—]?\s*(.+)?$/i)
    if (newProjectMatch) {
      setInput('')
      const projectName = newProjectMatch[2]?.trim() || 'New Project'
      const mem = (memberName || 'anonymous').toLowerCase()
      const r = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', slug, member: mem, name: projectName }),
      })
      const d = await r.json()
      if (d.project) {
        setProjects(prev => [...prev, d.project])
        setExpandedProjects(prev => new Set([...prev, d.project.id]))
        setSidebarCollapsed(false)
        // Show a brief system confirmation in the chat
        const confirmId = `sys-${Date.now()}`
        setThread(prev => [...prev, { role: 'agent', agent: agentIds[0], content: `✅ Project created: **${projectName}**. You can find it in the sidebar under Projects. Use "📁 Add to project" on any conversation thread to add it there.`, id: confirmId }])
      }
      return
    }

    setInput(''); setBusy(true)
    if (inputRef.current) { inputRef.current.style.height = 'auto' }

    // No auto-creation — conversations are created only when the user explicitly asks
    // Messages flow to the flat Redis list; Rex always has full context regardless

    // Build history from current thread — include any message with content (even if drain still rendering)
    // Do NOT filter on !t.streaming: busy becomes false when HTTP stream ends but drain queue
    // continues async at 42ms/tick, so streaming:true can still be set when user sends next message
    const history = thread
      .filter(t => !t.loading && t.content)
      .map(t => ({ role: (t.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant', content: t.content }))

    const userId = `u-${Date.now()}`
    const rids = agentIds.map(a => ({ agent: a, id: `${a}-${Date.now()}-${Math.random()}` }))

    setThread(prev => [
      ...prev,
      { role: 'user', content: text, id: userId },
      ...rids.map(({ agent, id }) => ({ role: 'agent', agent, content: '', loading: true, id })),
    ])

    // Stagger agent starts — lead fires immediately, each subsequent agent waits
    // so responses feel like a handoff, not two people talking over each other
    await Promise.all(rids.map(({ agent, id }, idx) =>
      new Promise<void>(resolve => {
        setTimeout(() => {
          streamAgent(agent, id, {
            agent,
            message: text,
            history,
            teammates: agentIds.filter(t => t !== agent),
            slug,
            tenantId: slug,
            teamMember: memberName || 'Anonymous',
            isLead: idx === 0,
          }).then(resolve)
        }, idx * 1200) // 0ms for lead, 1200ms for each subsequent agent
      })
    ))

    setBusy(false)
    inputRef.current?.focus()
    // Refresh conversations list and team intel
    const mem2 = (memberName || 'anonymous').toLowerCase()
    loadConversations(mem2)
    if (config?.team) loadIntel()
  }

  const agentLabel = metas.map(m => m.name).join(' + ')
  const agentSub = metas.map(m => m.domain).join(' & ')
  const showWelcome = thread.length === 0 || (thread.length === 1 && thread[0].divider)

  // ── Release notes content ──────────────────────────────────────────────────
  const allReleaseNotes = agentIds.flatMap(a => {
    const meta = AGENTS[a]
    return [
      { section: `${meta.name} ${meta.version}`, items: meta.releaseNotes[0].items },
      ...meta.releaseNotes.slice(1),
    ]
  })

  // ── PIN gate ────────────────────────────────────────────────────────────────
  if (!authed) return (
    <>
      <div id="bt-gate">
        <div className="bt-wordmark">AxiomStream Group</div>
        <div className="bt-gate-card">
          <div className="bt-accent-bar" style={{ width: 36, background: metas.length > 1 ? `linear-gradient(90deg, ${metas[0].color}, ${metas[1]?.color ?? metas[0].color})` : primaryColor }} />
          <div className="bt-gate-product">{agentLabel}</div>
          <div className="bt-gate-sub">Your personalized {agentSub.toLowerCase()} partner</div>
          <div className="bt-pin-label">Enter your PIN</div>
          <div className="bt-pin-inputs" style={{ animation: shaking ? 'bt-shake .35s ease' : 'none' }}>
            {pinDigits.map((d, i) => (
              <input key={i} ref={pinRefs[i]} className={`bt-pin-digit${d ? ' has-val' : ''}${shaking ? ' error' : ''}`}
                type="number" min="0" max="9" maxLength={1} inputMode="numeric" autoComplete="off"
                value={d} autoFocus={i === 0}
                onChange={e => handlePinInput(i, e.target.value)}
                onKeyDown={e => handlePinKey(i, e)}
                onPaste={handlePaste}
              />
            ))}
          </div>
          <button className="bt-unlock" disabled={pinDigits.join('').length < 4} onClick={submitPin}>Unlock</button>
          <div className="bt-pin-error">{pinError}</div>
          <div className="bt-gate-security">PIN-protected. No cookies. No account.</div>
        </div>
      </div>
    </>
  )

  // ── Member name screen (team accounts only) ─────────────────────────────────
  if (authed && config.team && !memberSet) return (
    <div id="bt-gate">
      <div className="bt-wordmark">AxiomStream Group</div>
      <div className="bt-gate-card">
        <div className="bt-accent-bar" style={{ width: 36, background: primaryColor }} />
        <div className="bt-gate-product">{config.teamLabel ?? config.name}</div>
        <div className="bt-gate-sub" style={{ marginBottom: 24 }}>Who are you? Your name helps the team identify your contributions.</div>
        <input
          type="text"
          placeholder="Your first name or handle"
          autoFocus
          value={memberInput}
          onChange={e => setMemberInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && memberInput.trim()) {
              const name = memberInput.trim()
              setMemberName(name)
              localStorage.setItem(`asg-member:${slug}`, name)
              setMemberSet(true)
            }
          }}
          style={{
            width: '100%', padding: '12px 14px', background: 'var(--surface-2)',
            border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 16,
            color: 'var(--text)', outline: 'none', fontFamily: 'var(--font)',
            marginBottom: 16, boxSizing: 'border-box'
          }}
        />
        <button
          className="bt-unlock"
          disabled={!memberInput.trim()}
          onClick={() => {
            const name = memberInput.trim()
            setMemberName(name)
            localStorage.setItem(`asg-member:${slug}`, name)
            setMemberSet(true)
          }}>
          Enter Workspace
        </button>
        <div className="bt-gate-security">Stored locally. Never shared externally.</div>
      </div>
    </div>
  )

  // ── Chat app ────────────────────────────────────────────────────────────────
  return (
    <>
      <div id="bt-outer">
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      {authed && memberSet && (
        <>
          {mobileSidebarOpen && <div id="bt-sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />}
          <div id="bt-sidebar" className={sidebarCollapsed ? 'collapsed' : mobileSidebarOpen ? 'mobile-open' : ''}>
            <div className="bt-sidebar-head">
              <div className="bt-sidebar-workspace">{config.teamLabel ?? config.name ?? slug}</div>
              {slug !== 'lilyg' && (
                <button className="bt-new-chat-btn" onClick={() => startNewChat()}>
                  <span>✏️</span> New chat
                </button>
              )}
            </div>
            <div className="bt-sidebar-threads">
              {/* ── Projects — hidden for personal (Kit) portals ───────── */}
              {!isPersonal && (<>
              <div className="bt-sidebar-section-label">
                Projects
                <button title="New project" onClick={() => setCreatingProject(true)}>+</button>
              </div>

              {creatingProject && (
                <div className="bt-new-project-form">
                  <input
                    autoFocus
                    placeholder="Project name…"
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && newProjectName.trim()) createProject(newProjectName); if (e.key === 'Escape') { setCreatingProject(false); setNewProjectName('') } }}
                  />
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button className="bt-thread-rename-save" style={{ flex: 1 }} onClick={() => newProjectName.trim() && createProject(newProjectName)}>Create</button>
                    <button className="bt-thread-action-btn" onClick={() => { setCreatingProject(false); setNewProjectName('') }}>Cancel</button>
                  </div>
                </div>
              )}

              {projects.length === 0 && !creatingProject && (
                <div style={{ padding: '4px 10px 10px', fontSize: 11, color: 'var(--text-3)' }}>No projects yet. Click + to create one.</div>
              )}

              {projects.map(proj => {
                const isOpen = expandedProjects.has(proj.id)
                const projConvs = conversations.filter(c => (proj.sessionIndexes || []).includes(c.convId as unknown as number))
                return (
                  <div key={proj.id} className="bt-project-item">
                    <div className="bt-project-header" onClick={() => setExpandedProjects(prev => { const n = new Set(prev); isOpen ? n.delete(proj.id) : n.add(proj.id); return n })}>
                      <span className={`bt-project-chevron${isOpen ? ' open' : ''}`}>▶</span>
                      {renamingProject?.id === proj.id ? (
                        <input
                          autoFocus
                          className="bt-thread-rename"
                          style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--primary)', borderRadius: 5, padding: '2px 6px', fontSize: 12, color: 'var(--text)', outline: 'none' }}
                          value={renamingProject.value}
                          onChange={e => setRenamingProject({ ...renamingProject, value: e.target.value })}
                          onClick={e => e.stopPropagation()}
                          onKeyDown={e => { if (e.key === 'Enter') renameProject(proj.id, renamingProject.value); if (e.key === 'Escape') setRenamingProject(null) }}
                        />
                      ) : (
                        <span className="bt-project-name">📁 {proj.name}</span>
                      )}
                      <span className="bt-project-count">{projConvs.length}</span>
                    </div>
                    {isOpen && (
                      <>
                        <div className="bt-project-threads">
                          {projConvs.length === 0 && (
                            <div style={{ padding: '8px 10px 8px 20px', fontSize: 11, color: 'var(--text-3)' }}>No threads yet. Add from the Conversations list below.</div>
                          )}
                          {projConvs.map(c => (
                            <div key={c.convId} className="bt-project-thread" onClick={() => openConversation(c.convId)}>
                              <div className="bt-project-thread-label">
                                <div className="bt-project-thread-date">{new Date(c.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                <div className="bt-project-thread-preview">{c.name}</div>
                              </div>
                              <button className="bt-thread-action-btn" style={{ flexShrink: 0 }} onClick={e => { e.stopPropagation(); removeThreadFromProject(proj.id, c.convId as unknown as number) }} title="Remove from project">✕</button>
                            </div>
                          ))}
                        </div>
                        <div className="bt-project-actions">
                          <button className="bt-thread-action-btn" onClick={e => { e.stopPropagation(); setRenamingProject({ id: proj.id, value: proj.name }) }}>✏️ Rename</button>
                          <button className="bt-thread-action-btn" style={{ color: '#ef4444' }} onClick={e => { e.stopPropagation(); if (confirm(`Delete project "${proj.name}"?`)) deleteProject(proj.id) }}>🗑️ Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}

              </>)}
              {/* ── Conversations ──────────────────────────────────────── */}
              {!isPersonal && <div className="bt-sidebar-section-label" style={{ marginTop: 8 }}>Conversations</div>}

              {/* Home — always visible, active when not in a named conversation */}
              <div
                className={`bt-thread-item${activeConvId === null ? ' active' : ''}`}
                onClick={() => { returnToLive(); setMobileSidebarOpen(false) }}
              >
                <div className="bt-thread-live-tag">🏠 Home</div>
                <div className="bt-thread-preview">All messages · {config?.agents?.[0] ? `${config.agents[0].charAt(0).toUpperCase() + config.agents[0].slice(1)}'s memory stream` : 'memory stream'}</div>
              </div>

              {/* Loading */}
              {convsLoading && <div style={{ padding: '12px 10px', fontSize: 12, color: 'var(--text-3)' }}>Loading...</div>}

              {/* Conversation list */}
              {!convsLoading && conversations.length === 0 && (
                <div style={{ padding: '6px 10px 10px', fontSize: 12, color: 'var(--text-3)' }}>No conversations yet — click ✏️ to create one.</div>
              )}
              {!convsLoading && conversations.map(c => (
                <div key={c.convId} style={{ position: 'relative' }}>
                  <div
                    className={`bt-thread-item${activeConvId === c.convId ? ' active' : ''}`}
                    onClick={() => openConversation(c.convId)}
                  >
                    <div className="bt-thread-date">
                      {new Date(c.ts).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      <span style={{ marginLeft: 6, fontWeight: 400 }}>· {Math.ceil(c.messageCount / 2)} msgs</span>
                    </div>
                    {editingConvName?.convId === c.convId ? (
                      <div className="bt-thread-rename" onClick={e => e.stopPropagation()}>
                        <input
                          autoFocus
                          value={editingConvName.value}
                          onChange={e => setEditingConvName({ ...editingConvName, value: e.target.value })}
                          onKeyDown={async e => {
                            if (e.key === 'Enter') {
                              const mem = (memberName || 'anonymous').toLowerCase()
                              await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'rename', slug, member: mem, convId: c.convId, name: editingConvName.value }) })
                              setConversations(prev => prev.map(x => x.convId === c.convId ? { ...x, name: editingConvName.value } : x))
                              setEditingConvName(null)
                            }
                            if (e.key === 'Escape') setEditingConvName(null)
                          }}
                          placeholder="Conversation name..."
                        />
                        <button className="bt-thread-rename-save" onClick={async () => {
                          const mem = (memberName || 'anonymous').toLowerCase()
                          await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'rename', slug, member: mem, convId: c.convId, name: editingConvName.value }) })
                          setConversations(prev => prev.map(x => x.convId === c.convId ? { ...x, name: editingConvName.value } : x))
                          setEditingConvName(null)
                        }}>Save</button>
                      </div>
                    ) : (
                      <>
                        <div className="bt-thread-name">{c.name}</div>
                        <div className="bt-thread-preview">{c.preview}</div>
                        <div className="bt-thread-actions" onClick={e => e.stopPropagation()}>
                          <button className="bt-thread-action-btn" onClick={() => setEditingConvName({ convId: c.convId, value: c.name })}>✏️ Rename</button>
                          {projects.length > 0 && (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <button className="bt-thread-action-btn" onClick={() => setAddingToProject(addingToProject === c.convId as unknown as number ? null : c.convId as unknown as number)}>📁 Add to project</button>
                              {addingToProject === c.convId as unknown as number && (
                                <div className="bt-project-picker">
                                  {projects.map(p => (
                                    <div key={p.id} className="bt-project-picker-item" onClick={() => addThreadToProject(p.id, c.convId as unknown as number)}>
                                      📁 {p.name}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div id="bt-app">
        {/* Header */}
        <div id="bt-header">
          <div className="bt-header-left">
            {/* Sidebar toggle — desktop collapses, mobile opens drawer */}
            <button className="bt-sidebar-toggle" style={{ display: 'flex' }} onClick={() => { setSidebarCollapsed(c => !c); setMobileSidebarOpen(o => !o) }} title="Toggle sidebar">☰</button>
            {metas.map((m, i) => (
              <span key={m.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="bt-dot" style={{ background: m.color }} />
                <span className="bt-header-name" style={{ color: m.color }}>{m.name}</span>
                {i < metas.length - 1 && <span className="bt-header-sep">+</span>}
              </span>
            ))}
            {config.team && memberName
              ? <span className="bt-header-client">
                  · {activeConvId
                    ? (conversations.find(c => c.convId === activeConvId)?.name ?? 'Conversation')
                    : 'Home'}
                </span>
              : config.name && <span className="bt-header-client">· {config.name}</span>
            }
          </div>
          <div className="bt-header-right">
            {/* Projects button — enterprise only */}
            {!isPersonal && (
              <button className="bt-intel-btn bt-mobile-hide" onClick={() => { setSidebarCollapsed(false); setMobileSidebarOpen(true); setTimeout(() => document.querySelector('.bt-sidebar-section-label')?.scrollIntoView({ behavior: 'smooth' }), 100) }} title="Projects">
                📁 Projects{projects.length > 0 ? ` (${projects.length})` : ''}
              </button>
            )}
            {/* Documents button */}
            <button className="bt-intel-btn bt-mobile-hide" onClick={docsOpen ? closeDocs : openDocs} title="Knowledge Base">
              {docsOpen ? '✕ Documents' : `📄 Documents${docs.length > 0 ? ` (${docs.length})` : ''}`}
            </button>
            {/* Team Intel button — team accounts only */}
            {config.team && (
              <button className="bt-intel-btn" onClick={intelOpen ? () => setIntelOpen(false) : openIntel}>
                {intelOpen ? '✕ Team Intel' : '⚡ Team Intel'}
                {!intelOpen && intelUnread > 0 && <span className="bt-intel-badge">{intelUnread}</span>}
              </button>
            )}
            {/* Font size */}
            <div className="bt-font-toggle" title="Font size">
              {(['s', 'm', 'l'] as const).map(s => (
                <button key={s} className={`bt-font-btn${fontSize === s ? ' active' : ''}`}
                  style={{ fontSize: s === 's' ? 11 : s === 'm' ? 13 : 15 }}
                  onClick={() => { setFontSizeState(s); localStorage.setItem('asg-fontsize', s) }}>A</button>
              ))}
            </div>
            {/* Theme */}
            <div className="bt-theme-toggle" title="Theme">
              <button className={`bt-theme-btn${theme === 'dark' ? ' active' : ''}`} onClick={() => setThemeState('dark')} title="Dark">🌙</button>
              <button className={`bt-theme-btn${theme === 'light' ? ' active' : ''}`} onClick={() => setThemeState('light')} title="Light">☀️</button>
            </div>

            <span className="bt-asg">AxiomStream Group</span>
          </div>
        </div>

        {/* Session banner — shown when viewing a past session (still fully resumable) */}
        {false && (
          <div className="bt-archive-banner">
            <span className="bt-archive-banner-label">
              📖 {archivedSessionInfo.name || new Date(archivedSessionInfo.startTs).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — continue below or
            </span>
            <button className="bt-archive-banner-back" onClick={returnToLive}>← Back to latest</button>
          </div>
        )}

        {/* Documents Panel */}
        {docsOpen && (
          <div className="bt-intel-panel">
            <div className="bt-intel-header">
              <span className="bt-intel-title">📄 Knowledge Base</span>
              <button className="bt-intel-close" onClick={closeDocs}>✕</button>
            </div>
            <div style={{ padding: '12px 16px 8px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 12 }}>
                Upload documents and your agent will reference them in every conversation. Supports PDF, Word, CSV, Excel, and text files.
              </p>
              {/* Upload button */}
              <input ref={docFileRef} type="file" accept=".pdf,.doc,.docx,.csv,.xlsx,.xls,.txt,.md"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) { handleDocUpload(f); e.target.value = '' } }} />
              <button
                onClick={() => docFileRef.current?.click()}
                disabled={uploading}
                style={{
                  width: '100%', padding: '9px 14px', borderRadius: 8, border: '1px dashed var(--border)',
                  background: uploading ? 'var(--surface-2)' : 'transparent',
                  color: uploading ? 'var(--text-3)' : 'var(--text-2)',
                  fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font)', marginBottom: 8, textAlign: 'center' as const,
                }}
              >
                {uploading ? '⏳ Processing…' : '📎 Upload Document'}
              </button>
              {uploadError && (
                <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 8, lineHeight: 1.5 }}>{uploadError}</p>
              )}
            </div>
            {/* Document list */}
            {docsLoading ? (
              <div className="bt-intel-empty">Loading…</div>
            ) : docs.length === 0 ? (
              <div className="bt-intel-empty">No documents yet. Upload one above to get started.</div>
            ) : (
              docs.map(doc => (
                <div key={doc.id} className="bt-intel-item" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}
                      title={doc.filename}>{doc.filename}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {doc.status === 'ready'
                        ? `✅ ${doc.chunk_count ?? 0} sections indexed`
                        : doc.status === 'processing'
                          ? '⏳ Processing…'
                          : '❌ Error — try re-uploading'}
                      {' · '}{new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDoc(doc.id)}
                    title="Remove document"
                    style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer',
                      padding: '2px 4px', fontSize: 14, lineHeight: 1, flexShrink: 0 }}
                  >✕</button>
                </div>
              ))
            )}
            {docs.length > 0 && (
              <div style={{ padding: '8px 16px 12px' }}>
                <p style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
                  Your agent references these documents automatically in every message.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Team Intel Panel */}
        {intelOpen && config.team && (
          <div className="bt-intel-panel">
            <div className="bt-intel-header">
              <span className="bt-intel-title">⚡ Team Intel</span>
              <button className="bt-intel-close" onClick={() => setIntelOpen(false)}>✕</button>
            </div>
            {intelCaptures.length === 0 ? (
              <div className="bt-intel-empty">No captures yet. Tell the agent to "log for team" to share intel with your teammates.</div>
            ) : intelCaptures.map((c, i) => (
              <div key={i} className="bt-intel-item">
                <div className="bt-intel-meta">
                  <span className="bt-intel-who">{c.member}</span>
                  <span className="bt-intel-time">{new Date(c.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {new Date(c.ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
                <div className="bt-intel-content" dangerouslySetInnerHTML={{ __html: `<p>${renderMd(c.content.slice(0, 400))}${c.content.length > 400 ? '…' : ''}</p>` }} />
              </div>
            ))}
          </div>
        )}

        {/* Conversation */}
        <div id="bt-convo" ref={convoRef} className={`fs-${fontSize}`}>
          {showWelcome && (
            <div className="bt-welcome">
              {metas.length > 1 ? (
              <div className="bt-how-card">
                <div className="bt-section-label">How this works</div>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 12 }}>
                  You have <strong style={{ color: 'var(--text)' }}>{metas.length} agents</strong> in this workspace. Ask once — each responds from their domain. They may build on or push back on each other.
                </p>
                {["No need to address agents separately — just ask", "Cross-domain questions get cross-domain answers", "Agents may disagree. That's the most valuable part."].map((t, i) => (
                  <p key={i} style={{ fontSize: 13, color: 'var(--text-2)', paddingLeft: 14, position: 'relative', marginBottom: 4 }}>
                    <span style={{ position: 'absolute', left: 0, color: primaryColor }}>·</span>{t}
                  </p>
                ))}
              </div>
              ) : (
              <div className="bt-how-card">
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 12 }}>
                  Welcome{memberName ? `, ${memberName}` : ''}. {config?.partnerName ? `You and ${config.partnerName} are set up as a team — your context is shared so either of you can pick up where the other left off.` : config?.teamLabel ? `Your ${config.teamLabel} workspace is ready.` : 'Your workspace is ready.'}
                </p>
                {(slug === 'lilyg' ? [
                  "Ask me anything — school, college research, life stuff",
                  "I remember everything you tell me, so you never have to start over",
                  "Try me on anything — essays, decisions, Josh Allen's MVP case",
                ] : [
                  `Just ask — ${config?.agents?.[0] ? config.agents[0].charAt(0).toUpperCase() + config.agents[0].slice(1) : 'your agent'} already knows your goals and background`,
                  config?.partnerName ? `Say "log this for ${config.partnerName}" to share a key insight or decision` : `Say "log for team" to share intel with your teammates`,
                  "Ask for honest viability feedback — your agent won't hold back",
                ]).map((t, i) => (
                  <p key={i} style={{ fontSize: 13, color: 'var(--text-2)', paddingLeft: 14, position: 'relative', marginBottom: 4 }}>
                    <span style={{ position: 'absolute', left: 0, color: primaryColor }}>·</span>{t}
                  </p>
                ))}
              </div>
              )}

              <div className="bt-agent-grid" style={{ gridTemplateColumns: metas.length > 2 ? '1fr 1fr' : '1fr' }}>
                {metas.map(m => (
                  <div key={m.name} className="bt-agent-card" style={{ borderColor: `${m.color}28` }}>
                    <div className="bt-agent-card-header">
                      <span className="bt-dot" style={{ background: m.color }} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: m.color }}>{m.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{m.domain}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>{m.releaseNotes[0].items[0]}</p>
                  </div>
                ))}
              </div>

              <div className="bt-section-label" style={{ marginBottom: 10 }}>Try asking</div>
              <div className="bt-chip-wrap">
                {starters(agentIds, slug).map((p, i) => (
                  <button key={i} className="bt-chip" onClick={() => sendMessage(p)}>{p}</button>
                ))}
              </div>
            </div>
          )}

          <div className="bt-convo-inner">
          {thread.map(item => {
            if (item.divider) return (
              <div key={item.id} id="session-divider" className="bt-session-divider">
                <div className="bt-session-divider-line" />
                <span className="bt-session-divider-label">New session</span>
                <div className="bt-session-divider-line" />
              </div>
            )
            if (item.role === 'user') return (
              <div key={item.id} className="bt-msg bt-user">
                <div className="bt-user-bubble">{item.content}</div>
              </div>
            )
            const meta = AGENTS[item.agent ?? '']
            if (!meta) return null
            return (
              <div key={item.id} className="bt-msg bt-ai"
                ref={el => { if (el) messageRefs.current.set(item.id, el); else messageRefs.current.delete(item.id) }}>
                {agentIds.length > 1 && (
                  <div className="bt-ai-label" style={{ color: meta.color }}>{meta.name} · {meta.domain}</div>
                )}
                {item.loading ? (
                  <div className="bt-typing">
                    {[0,1,2].map(i => <span key={i} className="bt-dot-t" style={{ background: meta.color }} />)}
                  </div>
                ) : item.streaming ? (
                  <div className="bt-ai-content" style={{ whiteSpace: 'pre-wrap' }}>
                    {item.content}<span className="bt-cursor" />
                  </div>
                ) : (
                  <>
                    <div className="bt-ai-content" dangerouslySetInnerHTML={{ __html: `<p>${renderMd(item.content)}</p>` }} />
                    {item.content && item.content.length > 100 && (
                      <div className="bt-msg-actions">
                        <button className="bt-msg-action-btn" onClick={e => {
                          navigator.clipboard.writeText(item.content)
                          const btn = e.currentTarget; btn.textContent = '✓ Copied!'; btn.classList.add('copied')
                          setTimeout(() => { btn.textContent = '📋 Copy plain text'; btn.classList.remove('copied') }, 1800)
                        }}>📋 Copy plain text</button>
                        <button className="bt-msg-action-btn" onClick={() => {
                          const blob = new Blob([item.content], { type: 'text/plain' })
                          const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
                          a.download = `kit-${new Date().toISOString().slice(0,10)}.txt`; a.click()
                        }}>Download</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
          </div>
        </div>

        {/* Input */}
        <div id="bt-input-area">
          <div className="bt-input-wrap-outer">
          <div className="bt-input-wrap">
            <textarea id="bt-input" ref={inputRef} placeholder={`Ask ${metas.map(m => m.name).join(' + ')}…`}
              value={input} rows={1} disabled={busy}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 160) + 'px' }}
            />
            <button id="bt-send" onClick={() => sendMessage()} disabled={!input.trim() || busy}>↑</button>
          </div>
          </div>
          <div id="bt-security-bar">
            <div className="bt-security-slug">
              <svg width="11" height="13" viewBox="0 0 11 13" fill="none"><rect x="1" y="5" width="9" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3.2 5V3.5a2.3 2.3 0 0 1 4.6 0V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              {slug}/chat
            </div>
            <span className="bt-input-hint">Enter to send · Shift+Enter for new line</span>
          </div>
        </div>
      </div>

      {/* Release notes modal */}
      <div id="bt-modal" className={modalOpen ? 'open' : ''} onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
        <div className="bt-modal-card">
          <div className="bt-modal-header">
            <div>
              <div className="bt-modal-title">Better Together — Release Notes</div>
              <div className="bt-modal-version">{metas.map(m => `${m.name} ${m.version}`).join(' · ')} · March 2026</div>
            </div>
            <button className="bt-modal-close" onClick={() => setModalOpen(false)}>✕</button>
          </div>
          {allReleaseNotes.map((s, i) => (
            <div key={i} className="bt-release-section">
              <div className="bt-release-title">{s.section}</div>
              {s.items.map((item, j) => (
                <div key={j} className="bt-release-item">
                  <div className="bt-release-dot" />
                  <div>{item}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  )
}
