/**
 * Retirement Planner module.
 * Port of MarkPortal's RetirementDemoSection. Uses /api/retire backend
 * (preserves existing contract) with optional anthropic-direct fallback.
 */
import { useState, useRef } from 'react'
import type React from 'react'
import { FONT_STACK, TOUCH } from '../theme'
import type { Module, ModuleContext } from '../types'

interface RetirementOptions {
  /** Pre-fill the form with this client scenario */
  defaultClient?: Partial<RetirementInputs>
  /** Endpoint override (default /api/retire) */
  endpoint?: string
}

interface RetirementInputs {
  clientName: string
  clientAge: string
  spouseAge: string
  retirementAge: string
  currentSavings: string
  annualContrib: string
  expectedReturn: string
  currentIncome: string
  monthlyExpenses: string
  socialSecurity: string
  riskTolerance: string
  goals: string[]
  extraNotes: string
}

const BLANK: RetirementInputs = {
  clientName: '', clientAge: '', spouseAge: '', retirementAge: '',
  currentSavings: '', annualContrib: '', expectedReturn: '7',
  currentIncome: '', monthlyExpenses: '', socialSecurity: '',
  riskTolerance: 'Moderate Growth', goals: [], extraNotes: '',
}

const GOAL_OPTIONS = [
  'Travel extensively in early retirement',
  'Purchase second home',
  "Fund grandchildren's education",
  'Leave meaningful legacy for heirs',
  'Pay off primary residence',
  'Start a passion project or business',
  'Downsize home in retirement',
]

function RetirementPlannerSection({ accent, tv, options, config }: ModuleContext) {
  const opts = options as RetirementOptions
  const endpoint = opts.endpoint || '/api/retire'
  const [inputs, setInputs] = useState<RetirementInputs>({ ...BLANK, ...(opts.defaultClient || {}) })
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  function toggleGoal(g: string) {
    setInputs(prev => ({
      ...prev,
      goals: prev.goals.includes(g) ? prev.goals.filter(v => v !== g) : [...prev.goals, g],
    }))
  }

  async function generate() {
    setLoading(true)
    setAnalysis('')
    const prompt = buildPrompt(inputs, config.company)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      setAnalysis(data.text || data.reply || 'Something went wrong — try again.')
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch {
      setAnalysis('Connection issue. Try again.')
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: tv.surface,
    border: `1px solid ${tv.border}`,
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 16, // prevents iOS zoom
    color: tv.text,
    fontFamily: FONT_STACK,
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: TOUCH.minTarget,
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: tv.gray,
    display: 'block',
    marginBottom: 8,
  }

  return (
    <div style={{ maxWidth: 780, fontFamily: FONT_STACK, color: tv.text }}>
      <div style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: accent, fontWeight: 700, marginBottom: 16 }}>
        Live Demo · Retirement Planning
      </div>
      <h2 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 14, lineHeight: 1.1 }}>
        Build a Plan <span style={{ color: accent }}>In the Room.</span>
      </h2>
      <p style={{ fontSize: 15, color: tv.lightGray, lineHeight: 1.7, marginBottom: 28 }}>
        Fill in a client scenario and generate a full retirement readiness analysis. Adjust any input
        and regenerate to see how the plan shifts.
      </p>

      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        <Field label="Client Name" value={inputs.clientName} onChange={v => setInputs(p => ({ ...p, clientName: v }))} style={inputStyle} labelStyle={labelStyle} />
        <Field label="Client Age" value={inputs.clientAge} onChange={v => setInputs(p => ({ ...p, clientAge: v }))} style={inputStyle} labelStyle={labelStyle} />
        <Field label="Spouse Age" value={inputs.spouseAge} onChange={v => setInputs(p => ({ ...p, spouseAge: v }))} style={inputStyle} labelStyle={labelStyle} />
        <Field label="Target Retirement Age" value={inputs.retirementAge} onChange={v => setInputs(p => ({ ...p, retirementAge: v }))} style={inputStyle} labelStyle={labelStyle} />
        <Field label="Current Savings ($)" value={inputs.currentSavings} onChange={v => setInputs(p => ({ ...p, currentSavings: v }))} style={inputStyle} labelStyle={labelStyle} />
        <Field label="Annual Contributions ($)" value={inputs.annualContrib} onChange={v => setInputs(p => ({ ...p, annualContrib: v }))} style={inputStyle} labelStyle={labelStyle} />
        <Field label="Expected Return (%/yr)" value={inputs.expectedReturn} onChange={v => setInputs(p => ({ ...p, expectedReturn: v }))} style={inputStyle} labelStyle={labelStyle} />
        <Field label="Household Income ($)" value={inputs.currentIncome} onChange={v => setInputs(p => ({ ...p, currentIncome: v }))} style={inputStyle} labelStyle={labelStyle} />
        <Field label="Monthly Expenses ($)" value={inputs.monthlyExpenses} onChange={v => setInputs(p => ({ ...p, monthlyExpenses: v }))} style={inputStyle} labelStyle={labelStyle} />
        <Field label="Social Security ($/mo @ 67)" value={inputs.socialSecurity} onChange={v => setInputs(p => ({ ...p, socialSecurity: v }))} style={inputStyle} labelStyle={labelStyle} />
        <div>
          <label style={labelStyle}>Risk Tolerance</label>
          <select
            value={inputs.riskTolerance}
            onChange={e => setInputs(p => ({ ...p, riskTolerance: e.target.value }))}
            style={{ ...inputStyle, appearance: 'none' }}
          >
            {['Conservative', 'Moderate', 'Moderate Growth', 'Growth', 'Aggressive Growth'].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Client Goals (select all that apply)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {GOAL_OPTIONS.map(g => {
            const active = inputs.goals.includes(g)
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGoal(g)}
                style={{
                  background: active ? `${accent}15` : tv.surface,
                  border: `1px solid ${active ? accent : tv.border}`,
                  borderRadius: 20,
                  padding: '8px 14px',
                  minHeight: 36,
                  fontSize: 13,
                  cursor: 'pointer',
                  color: active ? accent : tv.gray,
                  fontFamily: FONT_STACK,
                }}
              >
                {g}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Additional Context / Notes</label>
        <textarea
          rows={3}
          value={inputs.extraNotes}
          onChange={e => setInputs(p => ({ ...p, extraNotes: e.target.value }))}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Tax situation, health concerns, special assets, etc."
        />
      </div>

      <button
        onClick={generate}
        disabled={loading}
        style={{
          background: accent,
          color: tv.bg,
          border: 'none',
          borderRadius: 10,
          padding: '14px 28px',
          fontSize: 15,
          fontWeight: 800,
          minHeight: TOUCH.minTarget,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: FONT_STACK,
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Generating Analysis…' : analysis ? '↺ Regenerate Analysis' : '→ Generate Analysis'}
      </button>

      {(analysis || loading) && (
        <div ref={outputRef} style={{ marginTop: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: accent, fontWeight: 700, marginBottom: 12 }}>
            Analysis — {inputs.clientName || 'Client'}
          </div>
          <div
            style={{
              background: tv.surface,
              border: `1px solid ${accent}30`,
              borderRadius: 12,
              padding: 24,
              fontSize: 14,
              color: tv.lightGray,
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
            }}
          >
            {loading ? 'Generating…' : analysis}
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, style, labelStyle }: {
  label: string
  value: string
  onChange: (v: string) => void
  style: React.CSSProperties
  labelStyle: React.CSSProperties
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input style={style} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

function buildPrompt(inputs: RetirementInputs, company: string): string {
  return `Generate a comprehensive retirement readiness analysis for the following client profile. Write advisor-to-advisor for ${company} — clear, direct, data-grounded, no fluff.

CLIENT PROFILE:
- Name: ${inputs.clientName}
- Ages: ${inputs.clientAge} (client) / ${inputs.spouseAge} (spouse)
- Target retirement age: ${inputs.retirementAge}
- Current retirement savings: $${inputs.currentSavings}
- Annual contributions: $${inputs.annualContrib}
- Expected portfolio return: ${inputs.expectedReturn}%/yr
- Combined household income: $${inputs.currentIncome}
- Monthly expenses: $${inputs.monthlyExpenses}
- Social Security (combined at 67): $${inputs.socialSecurity}/mo
- Risk tolerance: ${inputs.riskTolerance}
- Goals: ${inputs.goals.join('; ')}
- Notes: ${inputs.extraNotes}

Structure:
1. **Retirement Readiness Score** (0–100, with rationale)
2. **Projected Portfolio at Retirement**
3. **Monthly Income in Retirement**
4. **Gap Analysis vs. expenses + goals**
5. **Goal Feasibility** per stated goal
6. **Key Risks**
7. **Recommended Actions** (3–5, prioritized)
8. **Bottom Line** (one paragraph)

Use their actual figures. Be specific with numbers.`
}

export const retirementPlannerModule: Module = {
  id: 'retirement-planner',
  nav: { label: 'Retirement Planner', icon: '🏖️', tag: 'Demo' },
  Section: RetirementPlannerSection,
}
