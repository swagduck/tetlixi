// client/src/components/WinAnimationOverlay.jsx
import React, { useEffect, useState } from 'react';
import '../index.css';

const WinAnimationOverlay = ({ amount, onFinished }) => {
  const [phase, setPhase] = useState('running'); // 'running' | 'flash' | 'result'
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    // 1. Chạy ngựa (1.8s)
    const runTimer = setTimeout(() => {
      setPhase('flash');
    }, 1800);

    // 2. Hiện kết quả (1.9s)
    const resultTimer = setTimeout(() => {
      setPhase('result');
      if (onFinished) onFinished();

      // Animation chạy số
      let startTimestamp = null;
      const duration = 2500;

      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        setDisplayAmount(Math.floor(easeProgress * (amount || 0))); // Fix NaN nếu amount null

        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);

    }, 1900);

    return () => { clearTimeout(runTimer); clearTimeout(resultTimer); };
  }, [onFinished, amount]);

  return (
    <div className="win-overlay-container">

      {phase === 'running' && (
        <>
          <div className="speed-lines"></div>
          <div className="horse-track">
            <div className="super-horse">🐎</div>
            <div className="dust-particle" style={{ left: '20%', animationDelay: '0s' }}></div>
            <div className="dust-particle" style={{ left: '30%', animationDelay: '0.2s' }}></div>
            <div className="dust-particle" style={{ left: '40%', animationDelay: '0.4s' }}></div>
            <div style={{ position: 'absolute', bottom: '20%', width: '100%', textAlign: 'center', color: '#FFD700', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '3px', textShadow: '0 0 10px #D2001A', zIndex: 6, fontFamily: 'Montserrat' }}>
              THẦN TỐC HÁI LỘC... ⚡
            </div>
          </div>
        </>
      )}

      {phase === 'flash' && <div className="flash-bang"></div>}

      {phase === 'result' && (
        <>
          <div className="sun-rays"></div>
          <div className="result-box">
            <div style={{ fontSize: '5rem', marginBottom: '-20px', filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.3))' }}>🧧</div>
            <h2 style={{ color: '#D2001A', margin: '5px 0', fontSize: '1.5rem', textTransform: 'uppercase', fontFamily: 'Montserrat', fontWeight: 800 }}>
              Lộc Về Đầy Túi!
            </h2>

            {/* SỐ TIỀN NHẢY - ĐÃ FIX MÀU SẮC */}
            <div className="result-money" style={{ fontVariantNumeric: 'tabular-nums', color: '#D2001A', textShadow: '2px 2px 0px #FFF' }}>
              {displayAmount.toLocaleString('vi-VN')}
              <span style={{ fontSize: '2rem', verticalAlign: 'top', marginLeft: '5px' }}>đ</span>
            </div>

            <button className="btn-tet" style={{ marginTop: '15px', width: 'auto', padding: '10px 40px', fontSize: '1.1rem' }} onClick={() => window.location.reload()}>
              HỐT BẠC 💰
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WinAnimationOverlay;