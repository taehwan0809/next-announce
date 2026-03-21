export default function HomeMotionStyles() {
  return (
    <style>{`
      @keyframes micPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.04); }
      }
      .mic-svg { animation: micPulse 3s ease-in-out infinite; }

      @keyframes waveAnim {
        0%, 100% { transform: scaleY(0.28); }
        50% { transform: scaleY(1); }
      }
      .wave-bar {
        animation: waveAnim 1.2s ease-in-out infinite;
        transform-origin: bottom;
        transform-box: fill-box;
      }
      .wave-bar:nth-child(1) { animation-delay: 0s; }
      .wave-bar:nth-child(2) { animation-delay: 0.15s; }
      .wave-bar:nth-child(3) { animation-delay: 0.30s; }
      .wave-bar:nth-child(4) { animation-delay: 0.45s; }
      .wave-bar:nth-child(5) { animation-delay: 0.60s; }
      .wave-bar:nth-child(6) { animation-delay: 0.75s; }
      .wave-bar:nth-child(7) { animation-delay: 0.90s; }

      @keyframes orbA {
        0%, 100% { transform: translate(0px, 0px); }
        40% { transform: translate(20px, -26px); }
        70% { transform: translate(-14px, 16px); }
      }
      @keyframes orbB {
        0%, 100% { transform: translate(0px, 0px); }
        35% { transform: translate(-22px, 18px); }
        65% { transform: translate(16px, -12px); }
      }
      .orb-a { animation: orbA 10s ease-in-out infinite; }
      .orb-b { animation: orbB 13s ease-in-out infinite; }
      .orb-c { animation: orbA 16s ease-in-out infinite reverse; }

      @keyframes nudge {
        0%, 100% { transform: translateY(0); opacity: 0.45; }
        50% { transform: translateY(8px); opacity: 0.85; }
      }
      .nudge { animation: nudge 2s ease-in-out infinite; }

      @keyframes logoFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      .logo-float { animation: logoFloat 4.5s ease-in-out infinite; }

      .nav-bar {
        transition:
          background 0.5s cubic-bezier(.4,0,.2,1),
          border-color 0.5s cubic-bezier(.4,0,.2,1),
          box-shadow 0.5s cubic-bezier(.4,0,.2,1);
      }

      .panel-lip {
        box-shadow:
          0 -1px 0 0 rgba(255,255,255,0.06),
          0 -28px 72px -20px rgba(0,0,0,0.72);
      }
    `}</style>
  );
}
