// client/src/App.jsx
import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import io from 'socket.io-client'
import confetti from 'canvas-confetti'
import axios from 'axios'
import './index.css'
import FallingBlossoms from './components/FallingBlossoms'
import WinAnimationOverlay from './components/WinAnimationOverlay'

const API_URL = 'https://tetlixi.onrender.com';

const AUDIO_URLS = {
  bgm: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chinese-new-year-126463.mp3",
  shake: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_cda845ec26.mp3?filename=coins-chests-shaking-2-96590.mp3",
  win: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c153e1.mp3?filename=fireworks-29629.mp3"
};

// --- HOME ---
const Home = () => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();
  const handleJoin = () => {
    if (!name.trim() || !roomId.trim()) { alert("Điền thiếu rồi bạn ơi!"); return; }
    localStorage.setItem('userName', name); navigate(`/room/${roomId}`);
  }
  return (
    <div className="main-container">
      <FallingBlossoms />
      <div className="top-nav"><button className="action-btn" onClick={() => navigate('/admin')}>👑 Nhà Cái</button></div>
      <div style={{ fontSize: '6rem', marginBottom: '-20px', filter: 'drop-shadow(0 0 30px gold)', animation: 'popIn 1s' }}>🐎</div>
      <h1>XUÂN BÍNH NGỌ <span>LÌ XÌ TỐC ĐỘ</span></h1>
      <div className="tet-card">
        <h2>THAM GIA NGAY</h2>
        <input className="tet-input" type="text" placeholder="Tên bạn là gì?" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="tet-input" type="text" placeholder="ID Phòng" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
        <button className="btn-tet" onClick={handleJoin}>VÀO HỐT LỘC 💨</button>
      </div>
      <p style={{ marginTop: '40px', color: '#fff', fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.8 }}>Made with ❤️ by Hoang Uy</p>
    </div>
  )
}

// --- ADMIN ---
const Admin = () => {
  const [balance, setBalance] = useState(() => parseInt(localStorage.getItem('adminBalance')) || 0);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [roomConfig, setRoomConfig] = useState({ totalAmount: '', quantity: '', creatorName: 'Uy Chủ Trì' });
  const [createdRoomId, setCreatedRoomId] = useState(null);

  const handleTopUp = () => {
    const amount = parseInt(topUpAmount.replace(/\D/g, ''));
    if (!amount || amount <= 0) return alert("Số tiền sai rồi!");
    const newBalance = balance + amount; setBalance(newBalance); localStorage.setItem('adminBalance', newBalance);
    setTopUpAmount(''); alert(`Đã nạp ${amount.toLocaleString()} đ!`);
  };

  const handleCreateRoom = async () => {
    const total = parseInt(roomConfig.totalAmount.replace(/\D/g, '')); const qty = parseInt(roomConfig.quantity);
    if (!total || !qty) return alert("Thiếu thông tin!");
    if (total > balance) return alert("Hết tiền rồi sếp ơi!");
    try {
      const res = await axios.post(`${API_URL}/api/lixi/create`, { creatorName: roomConfig.creatorName, totalAmount: total, quantity: qty, type: 'RANDOM' });
      if (res.data.success) {
        const newBalance = balance - total; setBalance(newBalance); localStorage.setItem('adminBalance', newBalance);
        setCreatedRoomId(res.data.data._id); alert("Đã tạo phòng!");
      }
    } catch (error) { alert("Lỗi: " + error.message); }
  };

  return (
    <div className="main-container">
      <FallingBlossoms />
      <div className="top-nav"><button className="action-btn" onClick={() => window.location.href = '/'}>⬅️ Trang Chủ</button></div>
      <h1>KHO BẠC <span>NHÀ CÁI</span></h1>
      <div className="tet-card" style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0', color: '#555' }}>TỔNG QUỸ</h3>
        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--tet-red)', margin: '10px 0' }}>{balance.toLocaleString('vi-VN')} đ</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input className="tet-input" type="text" placeholder="Nhập tiền..." value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} style={{ margin: 0 }} />
          <button className="btn-tet" onClick={handleTopUp} style={{ width: 'auto', marginTop: 0 }}>NẠP</button>
        </div>
      </div>
      <div className="tet-card">
        <h2>TẠO PHÒNG MỚI</h2>
        <input className="tet-input" type="number" placeholder="Tổng tiền (VD: 500k)" value={roomConfig.totalAmount} onChange={(e) => setRoomConfig({ ...roomConfig, totalAmount: e.target.value })} />
        <input className="tet-input" type="number" placeholder="Số người (VD: 10)" value={roomConfig.quantity} onChange={(e) => setRoomConfig({ ...roomConfig, quantity: e.target.value })} />
        <button className="btn-tet" onClick={handleCreateRoom}>TẠO PHÒNG</button>
        {createdRoomId && (<div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '15px', border: '2px solid #4caf50' }}><p style={{ color: '#2e7d32', fontWeight: 'bold', margin: '0' }}>✅ ID Phòng:</p><div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333', padding: '10px' }}>{createdRoomId}</div></div>)}
      </div>
    </div>
  );
};

// --- ROOM ---
const Room = () => {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('Đang kết nối...');
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [result, setResult] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showWinAnim, setShowWinAnim] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [myLixi, setMyLixi] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const navigate = useNavigate();
  const bgmRef = useRef(new Audio(AUDIO_URLS.bgm));
  const shakeRef = useRef(new Audio(AUDIO_URLS.shake));
  const winRef = useRef(new Audio(AUDIO_URLS.win));

  const joinUrl = window.location.href;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(joinUrl)}`;

  useEffect(() => {
    bgmRef.current.loop = true; bgmRef.current.volume = 0.4;
    const playAudio = async () => { try { if (!isMuted) await bgmRef.current.play(); } catch (e) { } };
    playAudio(); return () => { bgmRef.current.pause(); };
  }, [isMuted]);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (!storedName) { navigate('/'); return; }
    setName(storedName);
    const newSocket = io(API_URL, { transports: ['websocket', 'polling'] });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setStatus('🟢 Sẵn sàng!');
      newSocket.emit('join_room', { roomId: id, userName: storedName });
      fetchHistory(storedName);
    });

    newSocket.on('user_joined', (data) => setNotifications(prev => [{ type: 'info', text: `🦄 ${data.message}` }, ...prev]));

    // LOGIC NHẬN TIN NHẮN TỪ SOCKET
    newSocket.on('user_won_lixi', (data) => {
      // QUAN TRỌNG: Nếu là chính mình thì bỏ qua (vì đã tự thêm lúc lắc rồi)
      if (data.userName === storedName) return;

      setNotifications(prev => [{ type: 'win', text: data.message }, ...prev]);
      fetchHistory(storedName);
    });

    newSocket.on('update_player_list', (users) => setOnlineUsers(users));
    newSocket.on('connect_error', () => setStatus('🔴 Mất kết nối!'));
    return () => newSocket.close();
  }, [id, navigate]);

  const fetchHistory = async (currentUserName) => {
    try {
      const res = await axios.get(`${API_URL}/api/lixi/history/${id}`);
      if (res.data.success) {
        const histList = res.data.data; setHistory(histList);
        const myRecord = histList.find(h => h.receiverName === currentUserName);
        if (myRecord) setMyLixi({ amount: myRecord.amount });
      }
    } catch (err) { console.error(err); }
  };

  const playSfx = (audioRef) => { if (!isMuted) { audioRef.current.currentTime = 0; audioRef.current.play().catch(e => { }); } };

  const handleShake = async () => {
    if (isShaking || myLixi) return;
    setIsShaking(true); playSfx(shakeRef);
    setTimeout(() => setIsShaking(false), 2000);
    try {
      const response = await axios.post(`${API_URL}/api/lixi/open`, { envelopeId: id, receiverName: name });
      if (response.data.success) {
        const wonAmount = response.data.amount;
        setResult({ type: 'success', message: response.data.message, amount: wonAmount });
        setShowWinAnim(true); setMyLixi({ amount: wonAmount });

        // --- TỰ ĐẨY THÔNG BÁO CHO MÌNH NGAY LẬP TỨC (OPTIMISTIC) ---
        setNotifications(prev => [{
          type: 'win',
          text: `💰 BẠN vừa húp trọn ${wonAmount.toLocaleString("vi-VN")} đ!`
        }, ...prev]);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi mạng!";
      if (error.response?.status === 403) { setMyLixi({ amount: error.response.data.amount || 0 }); alert("Bạn đã nhận rồi!"); } else { setResult({ type: 'error', message: msg }); }
    }
  };

  const handleCloseWin = () => { setResult(null); setShowWinAnim(false); };
  const handleAnimFinished = () => { playSfx(winRef); confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } }); }
  const copyLink = () => { navigator.clipboard.writeText(id); alert("Đã copy ID!"); }

  return (
    <div className="main-container">
      <FallingBlossoms />
      <div className="top-nav">
        <button className="action-btn" onClick={() => setIsMuted(!isMuted)}>{isMuted ? '🔇' : '🔊'}</button>
        <button className="action-btn" onClick={() => setShowHistory(true)}>🏆 Bảng Vàng</button>
      </div>

      {showQR && (<div className="qr-overlay" onClick={() => setShowQR(false)}><div className="qr-card" onClick={(e) => e.stopPropagation()}><h3 style={{ color: '#d2001a', margin: '0' }}>QUÉT ĐỂ VÀO</h3><img src={qrCodeUrl} alt="QR" style={{ width: '200px', margin: '15px 0', border: '2px dashed gold' }} /><p>ID: <strong>{id}</strong></p><button className="btn-tet" onClick={() => setShowQR(false)}>ĐÓNG</button></div></div>)}

      {showWinAnim && result?.type === 'success' && <WinAnimationOverlay amount={result.amount} onFinished={handleAnimFinished} onClose={handleCloseWin} />}

      {!showWinAnim && result?.type === 'error' && (<div className="qr-overlay"><div className="qr-card"><h2>HẾT LƯỢT!</h2><p>{result.message}</p><button className="btn-tet" onClick={() => setResult(null)}>ĐÓNG</button></div></div>)}

      {showHistory && (<div className="qr-overlay"><div className="tet-card" style={{ maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><h2 style={{ color: '#d2001a' }}>🏆 BẢNG PHONG THẦN</h2><div style={{ overflowY: 'auto', flex: 1, width: '100%', textAlign: 'left' }}>{history.length === 0 ? <p style={{ textAlign: 'center' }}>Trống trơn...</p> : (<table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>{history.map((h, i) => (<tr key={i} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px', fontWeight: 'bold' }}>{h.receiverName}</td><td style={{ padding: '10px', textAlign: 'right', color: '#d2001a', fontWeight: 'bold' }}>{h.amount.toLocaleString()}</td></tr>))}</tbody></table>)}</div><button className="btn-tet" onClick={() => setShowHistory(false)}>ĐÓNG</button></div></div>)}

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <div style={{ color: '#FFD700', textShadow: '1px 1px 0 #d2001a', fontSize: '1.5rem', fontWeight: 'bold' }}>PHÒNG: {id}</div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}><button className="action-btn" onClick={copyLink}>📋 Copy</button><button className="action-btn" onClick={() => setShowQR(true)}>📱 QR</button></div>
        <div style={{ color: '#fff', fontSize: '0.8rem', marginTop: '5px', opacity: 0.8 }}>{status}</div>
      </div>

      <div className="tet-card" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', color: '#555' }}><span>Chào, <strong>{name}</strong>!</span><span>👥 {onlineUsers.length}</span></div>
        <div style={{ height: '140px', overflowY: 'auto', background: '#fff', borderRadius: '15px', padding: '10px', border: '1px solid #eee', fontSize: '0.85rem', textAlign: 'left', marginBottom: '15px', display: 'flex', flexDirection: 'column' }}>
          {notifications.length === 0 && <div style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>Chưa có ai trúng...</div>}
          {notifications.map((n, i) => (<div key={i} style={{ padding: '8px', marginBottom: '5px', borderRadius: '8px', background: n.type === 'win' ? '#fff3cd' : 'transparent', borderLeft: n.type === 'win' ? '4px solid #d2001a' : 'none', color: n.type === 'win' ? '#d2001a' : '#333', fontWeight: n.type === 'win' ? 'bold' : 'normal' }}>{n.text}</div>))}
        </div>

        {myLixi ? (
          <div style={{ padding: '20px', border: '2px dashed var(--tet-red)', borderRadius: '15px', background: '#fff' }}>
            <div style={{ color: '#888', fontSize: '0.9rem' }}>BẠN ĐÃ HÚP:</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--tet-red)' }}>{myLixi.amount.toLocaleString()} đ</div>
          </div>
        ) : (
          <div className={`shake-btn ${isShaking ? "shake-active" : ""}`} onClick={handleShake}>
            <span style={{ fontSize: '3rem', marginBottom: '-5px' }}>{isShaking ? '💨' : '🐎'}</span><span>{isShaking ? "PHI..." : "LẮC NGAY"}</span>
          </div>
        )}
        <button className="btn-tet" style={{ background: 'rgba(0,0,0,0.1)', color: '#333', marginTop: '20px', fontSize: '0.9rem', padding: '10px', boxShadow: 'none' }} onClick={() => { if (socket) socket.disconnect(); navigate('/'); }}>Thoát Phòng</button>
      </div>
    </div>
  )
}

function App() { return (<BrowserRouter><Routes><Route path="/" element={<Home />} /><Route path="/admin" element={<Admin />} /><Route path="/room/:id" element={<Room />} /></Routes></BrowserRouter>) }
export default App