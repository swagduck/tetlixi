// client/src/components/FallingBlossoms.jsx
import React, { useEffect, useState } from 'react';

const FallingBlossoms = () => {
  const [blossoms, setBlossoms] = useState([]);

  useEffect(() => {
    // Tạo 30 bông hoa với thông số ngẫu nhiên
    const newBlossoms = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      animationDuration: Math.random() * 5 + 5 + 's', // 5-10s
      animationDelay: Math.random() * 5 + 's',
      type: Math.random() > 0.5 ? '🌸' : '🌼', // Đào hoặc Mai
      size: Math.random() * 1.5 + 1 + 'rem' // Kích thước ngẫu nhiên
    }));
    setBlossoms(newBlossoms);
  }, []);

  return (
    <div className="blossom-container">
      {blossoms.map((b) => (
        <div
          key={b.id}
          className="blossom"
          style={{
            left: b.left,
            animationDuration: b.animationDuration,
            animationDelay: b.animationDelay,
            fontSize: b.size
          }}
        >
          {b.type}
        </div>
      ))}
    </div>
  );
};

export default FallingBlossoms;