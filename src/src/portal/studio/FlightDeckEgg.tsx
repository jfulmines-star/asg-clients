import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './flight-deck-egg.css'

/** Three nameplate activations reveal the on-demand carrier challenge. */
export default function FlightDeckEgg({ title, onActiveChange }: { title: string; onActiveChange: (active: boolean) => void }) {
  const taps = useRef<number[]>([])
  const trigger = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [flying, setFlying] = useState(false)
  useEffect(() => {
    if (!unlocked) return
    dialog.current?.showModal()
    const prior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prior }
  }, [unlocked])
  function close() {
    setFlying(false); setUnlocked(false); onActiveChange(false)
    requestAnimationFrame(() => trigger.current?.focus())
  }
  function activate() {
    const now = performance.now()
    taps.current = [...taps.current.filter(t => now - t < 1800), now]
    if (taps.current.length >= 3) { taps.current = []; setUnlocked(true) }
  }
  return <>
    <button ref={trigger} type="button" className="flight-egg-nameplate" onClick={activate} aria-label={`${title}. Tap three times to discover flight deck.`}>{title}</button>
    {unlocked && createPortal(<dialog ref={dialog} className={`flight-egg-dialog ${flying ? 'is-flying' : ''}`} onCancel={e => { e.preventDefault(); close() }} onClose={close}>
      <header><span>SHIELD / FLIGHT DECK <small>CARRIER QUALIFICATION</small></span><button type="button" onClick={close}>Return to Cover Studio ×</button></header>
      {flying ? <iframe title="Shield F-35C carrier landing challenge" src="/flight-deck/" allow="autoplay; gamepad; fullscreen" /> : <div className="flight-egg-clearance">
        <small>YOU FOUND THE FLIGHT DECK</small><h2>Cleared for the break.</h2>
        <p>The studio’s F‑35A stays here. Your F‑35C is waiting over the Gerald R. Ford.</p>
        <p>One approach. Three wires. Can you bring it home?</p>
        <button type="button" onClick={() => { onActiveChange(true); setFlying(true) }}>Accept flight clearance ↗</button>
        <small>Sound recommended · arcade challenge · no portal data used</small>
      </div>}
    </dialog>, document.body)}
  </>
}
