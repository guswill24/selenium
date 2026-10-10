import { useEffect, type AnimationEvent } from 'react';
import { useAuth } from '../../hooks/useAuth.ts';
import { useMediaQuery } from '../../hooks/useMediaQuery.ts';

/**
 * Welcome micro-interaction after a successful login: a bus drives up to a "Mi Ruta" stop, brakes and
 * lights its sign, then the card fades out (about 3.4 s).
 *
 * Testability: it never blocks or delays the page. It floats over the content (fixed, so no layout
 * shift), ignores the pointer (clicks reach the elements below), is hidden from assistive technology
 * and leaves the DOM when it ends. Not shown with reduced motion. While `paused` (the post-login
 * notice is still open) it waits, and plays once the notice is accepted.
 */
export function ArrivalBus({ paused = false }: { paused?: boolean }) {
  const { justLoggedIn, acknowledgeLogin } = useAuth();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (justLoggedIn && reduceMotion) acknowledgeLogin();
  }, [justLoggedIn, reduceMotion, acknowledgeLogin]);

  if (!justLoggedIn || reduceMotion || paused) return null;

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    // Child animations bubble up: only the card's own fade-out ends the micro-interaction.
    if (event.target === event.currentTarget) acknowledgeLogin();
  };

  return (
    <div
      className="arrival-bus pointer-events-none fixed right-4 bottom-4 z-30 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
      aria-hidden="true"
      data-testid="arrival-bus"
      onAnimationEnd={handleAnimationEnd}
    >
      <svg viewBox="0 0 280 112" className="block w-full" focusable="false">
        <rect width="280" height="112" fill="#f1f5f9" />
        <circle cx="150" cy="40" r="16" fill="#ffffff" />
        <circle cx="168" cy="36" r="12" fill="#ffffff" />
        <rect y="88" width="280" height="24" fill="#e2e8f0" />
        <path d="M0 88h280" stroke="#cbd5e1" strokeWidth="2" />
        <path d="M60 102h26M120 102h26M180 102h26M240 102h26" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />

        {/* Stop */}
        <g className="arrival-bus__stop">
          <path d="M34 44v44" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <rect x="16" y="12" width="36" height="34" rx="6" fill="#2563eb" stroke="#1e293b" strokeWidth="2" />
          <rect x="25" y="17" width="18" height="13" rx="3" fill="#ffffff" />
          <path d="M25 24h18" stroke="#2563eb" strokeWidth="2" />
          <text x="34" y="41" textAnchor="middle" fontSize="7" fontWeight="700" fill="#ffffff" fontFamily="system-ui, sans-serif">
            Mi Ruta
          </text>
        </g>

        {/* Bus, front on the left: drives in, then brakes (nose dip) */}
        <g className="arrival-bus__drive">
          <g className="arrival-bus__brake">
            <rect x="70" y="24" width="194" height="62" rx="12" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
            <rect x="70" y="66" width="194" height="8" fill="#2563eb" />
            <path d="M74 38q0-8 8-8h20v34H74z" fill="#1e3a5f" />
            <rect x="76" y="27" width="64" height="9" rx="2" fill="#0f172a" />
            <text className="arrival-bus__led" x="108" y="34" textAnchor="middle" fontSize="7" fontWeight="700" fontFamily="ui-monospace, monospace">
              Mi Ruta
            </text>
            <rect x="108" y="38" width="16" height="44" rx="2" fill="#bfdbfe" stroke="#1e293b" strokeWidth="1.5" />
            {[132, 164, 196, 228].map((x) => (
              <rect key={x} x={x} y="38" width="26" height="22" rx="3" fill="#93c5fd" stroke="#1e293b" strokeWidth="1.5" />
            ))}
            <circle className="arrival-bus__light" cx="76" cy="78" r="3.5" fill="#fde68a" />
            <circle cx="104" cy="88" r="11" fill="#1e293b" />
            <circle cx="104" cy="88" r="4" fill="#94a3b8" />
            <circle cx="234" cy="88" r="11" fill="#1e293b" />
            <circle cx="234" cy="88" r="4" fill="#94a3b8" />
          </g>
          {[0, 1, 2].map((i) => (
            <circle key={i} className="arrival-bus__dust" cx={250 + i * 10} cy={94 - i * 3} r={4 + i} fill="#cbd5e1" />
          ))}
        </g>
      </svg>
      <p className="px-4 py-2 text-sm font-semibold text-slate-800">Tu bus llegó a la parada. ¡Buen viaje!</p>
    </div>
  );
}
