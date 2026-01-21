// client/src/components/FallingBlossoms.jsx
import React, { useEffect, useState } from 'react';

const FallingBlossoms = () => {
  const [blossoms, setBlossoms] = useState([]);

  useEffect(() => {
    // Tạo ra 30 bông hoa ngẫu nhiên
    const newBlossoms = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      type: Math.random() > 0.5 ? 'peach' : 'apricot', // 50% Đào, 50% Mai
      left: `${Math.random() * 100}%`, // Vị trí ngang ngẫu nhiên
      fontSize: `${Math.random() * 1.5 + 1}rem`, // Kích thước ngẫu nhiên
      animationDuration: `${Math.random() * 5 + 5}s`, // Tốc độ rơi ngẫu nhiên (5s - 10s)
      animationDelay: `${Math.random() * 5}s` // Độ trễ ngẫu nhiên
    }));
    setBlossoms(newBlossoms);
  }, []);

  return (
    <div className="blossom-container">
      {blossoms.map(b => (
        <div 
          key={b.id} 
          className={`blossom ${b.type}`}
          style={{
            left: b.left,
            fontSize: b.fontSize,
            animationDuration: b.animationDuration,
            animationDelay: b.animationDelay
          }}
        />
      ))}
    </div>
  );
};

export default FallingBlossoms;