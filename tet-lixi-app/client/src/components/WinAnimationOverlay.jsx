// client/src/components/WinAnimationOverlay.jsx
import React, { useEffect, useState, useRef } from 'react';

const MESSAGES = [
  "Thần tài đang soi...",
  "Đang mở két sắt...",
  "Xin keo 500 anh em...",
  "Tiền đang về bản...",
  "Nhân phẩm bùng nổ?!",
  "Chờ xíu..."
];

const WinAnimationOverlay = ({ amount, onFinished }) => {
  const [displayAmount, setDisplayAmount] = useState(0);
  const [message, setMessage] = useState("Đang kết nối...");
  
  // Logic chạy số (Rolling Counter)
  useEffect(() => {
    let startTimestamp = null;
    const duration = 3000; // Số chạy trong 3 giây
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Hàm easing (làm cho số chạy nhanh lúc đầu, chậm dần lúc cuối để hồi hộp)
      // easeOutCubic: 1 - pow(1 - x, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentVal = Math.floor(easeProgress * amount);
      setDisplayAmount(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        // Khi chạy xong số
        setTimeout(() => {
            onFinished(); // Kết thúc overlay
        }, 800); // Dừng lại 0.8s để ngắm số đẹp trước khi tắt
      }
    };
    
    window.requestAnimationFrame(step);
  }, [amount, onFinished]);

  // Logic đổi câu thông báo liên tục
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      setMessage(randomMsg);
    }, 600); // Đổi chữ mỗi 0.6s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="win-overlay">
      {/* Hiệu ứng hạt bụi/sao bay (tạo tốc độ) */}
      <div style={{position: 'absolute', width: '100%', height:'100%', opacity: 0.3, background: 'url("https://media.giphy.com/media/l0HlTy9x8FZo0XO1i/giphy.gif")', backgroundSize: 'cover', pointerEvents: 'none'}}></div>

      {/* Dòng chữ gây hồi hộp */}
      <div className="suspense-text">{message}</div>

      {/* SỐ TIỀN ĐANG CHẠY */}
      <div className="rolling-number">
        {displayAmount.toLocaleString('vi-VN')}
      </div>

      {/* Con ngựa chạy qua */}
      <div className="running-horse">
        🐎💨
      </div>
      
      {/* Footer */}
      <p style={{color: '#666', marginTop: '50px', fontSize: '0.9rem'}}>
        Hệ thống đang chuyển tiền...
      </p>
    </div>
  );
};

export default WinAnimationOverlay;