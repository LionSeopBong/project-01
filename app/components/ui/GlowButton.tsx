"use client";

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function GlowButton({ children, onClick, className }: GlowButtonProps) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

         .start-btn {
          position: relative;
          padding: 22px 80px;
          font-family: 'Bebas Neue', Impact, sans-serif;
          font-size: 2.2rem;
          letter-spacing: 0.15em;
          color: #fff;
          background: linear-gradient(180deg, #e63946 0%, #b71c1c 60%, #7f0000 100%);
          border: none;
          border-radius: 20px;
          cursor: pointer;
          outline: none;
          transition: transform 0.1s ease, box-shadow 0.2s ease;

          /* 바깥 발광 */
          box-shadow:
            0 0 30px 8px rgba(220, 30, 30, 0.55),
            0 0 80px 20px rgba(200, 10, 10, 0.3),
            inset 0 2px 4px rgba(255,255,255,0.25),
            inset 0 -3px 6px rgba(0,0,0,0.4);
        }

        .start-btn::before {
          content: '';
          position: absolute;
          top: 6px;
          left: 18px;
          right: 18px;
          height: 38%;
          background: linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%);
          border-radius: 20px 20px 20px 20px;
          pointer-events: none;
        }

        /* 바닥 반사광 */
        .start-btn::after {
          content: '';
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%);
          width: 70%;
          height: 18px;
          background: radial-gradient(ellipse at center, rgba(220,30,30,0.55) 0%, transparent 70%);
          filter: blur(6px);
          pointer-events: none;
        }

        .start-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow:
            0 0 45px 14px rgba(220, 30, 30, 0.7),
            0 0 100px 30px rgba(200, 10, 10, 0.4),
            inset 0 2px 4px rgba(255,255,255,0.3),
            inset 0 -3px 6px rgba(0,0,0,0.4);
        }

        .start-btn:active {
          transform: translateY(2px) scale(0.97);
          box-shadow:
            0 0 20px 6px rgba(220, 30, 30, 0.5),
            0 0 50px 12px rgba(200, 10, 10, 0.25),
            inset 0 3px 8px rgba(0,0,0,0.5),
            inset 0 -1px 3px rgba(255,255,255,0.1);
        }

        /* 스파크 파티클 */
        .sparks {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: visible;
        }

        .spark {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 20%;
          background: #ff6b35;
          bottom: -8px;
          animation: spark-fly 1.8s ease-out infinite;
          opacity: 0;
        }

        .spark:nth-child(1) { left: 30%; animation-delay: 0s; background: #ff4444; }
        .spark:nth-child(2) { left: 45%; animation-delay: 0.3s; background: #ff6b35; }
        .spark:nth-child(3) { left: 60%; animation-delay: 0.6s; background: #ff4444; }
        .spark:nth-child(4) { left: 38%; animation-delay: 0.9s; background: #ffaa00; }
        .spark:nth-child(5) { left: 55%; animation-delay: 1.2s; background: #ff6b35; }

        @keyframes spark-fly {
          0%   { transform: translateY(0) scale(1); opacity: 0.9; }
          100% { transform: translateY(-40px) translateX(calc((var(--dx, 1) * 20px))) scale(0); opacity: 0; }
        }

        .spark:nth-child(1) { --dx: -1; }
        .spark:nth-child(2) { --dx: 0.5; }
        .spark:nth-child(3) { --dx: 1; }
        .spark:nth-child(4) { --dx: -0.5; }
        .spark:nth-child(5) { --dx: 0.8; }

        /* 주변 ember glow 바닥 */
        .floor-glow {
          position: absolute;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%);
          width: 320px;
          height: 40px;
          background: radial-gradient(ellipse at center, rgba(180,10,10,0.4) 0%, transparent 70%);
          filter: blur(8px);
          pointer-events: none;
        }
      `}</style>

      <button className={`start-btn ${className ?? ""}`} onClick={onClick}>
        {children}
        <span className="sparks">
          <span className="spark" />
          <span className="spark" />
          <span className="spark" />
          <span className="spark" />
          <span className="spark" />
        </span>
      </button>
      <div className="floor-glow" />
    </div>
  );
}
