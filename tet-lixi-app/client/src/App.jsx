// client/src/App.jsx
import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import io from 'socket.io-client'
import confetti from 'canvas-confetti'
import axios from 'axios'
import './index.css'
import FallingBlossoms from './components/FallingBlossoms'
import WinAnimationOverlay from './components/WinAnimationOverlay' 

const AUDIO_URLS = {
  bgm: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chinese-new-year-126463.mp3",
  shake: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_cda845ec26.mp3?filename=coins-chests-shaking-2-96590.mp3",
  win: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c153e1.mp3?filename=fireworks-29629.mp3"
};

// --- 1. Component Home (Giữ nguyên) ---
const Home = () => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!name.trim() || !roomId.trim()) { alert("Vui lòng nhập đủ thông tin!"); return; }
    localStorage.setItem('userName', name);
    navigate(`/room/${roomId}`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', position: 'relative', zIndex: 1 }}>
      <FallingBlossoms />
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'transparent', border: '1px solid var(--tet-gold)', color: '#fff', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>👑 Trang Nhà Cái</button>
      </div>
      <div style={{ fontSize: '5rem', marginBottom: '-20px', filter: 'drop-shadow(0 0 20px var(--tet-gold))', animation: 'popIn 1s' }}>🐎 <span style={{fontSize: '3rem'}}>💰</span></div>
      <h1 style={{ fontSize: '3rem', marginBottom: '5px', textAlign: 'center' }}>XUÂN BÍNH NGỌ <br/> <span style={{ color: '#fff', fontSize: '2.2rem' }}>LÌ XÌ TỐC ĐỘ</span></h1>
      <p style={{ color: '#fff', marginBottom: '30px', fontWeight: 'bold', fontSize: '1.3rem', textShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>🌸 Mã Đáo Thành Công - Lộc Về Như Lũ 🌸</p>
      <div className="tet-card">
        <h2 className="text-dark" style={{ marginTop: '15px', color: '#d2001a' }}>Cổng Vào Hái Lộc</h2>
        <input className="tet-input" type="text" placeholder="Tên của bạn (VD: Uy Đại Gia)" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="tet-input" type="text" placeholder="ID Phòng" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
        <button className="btn-tet" onClick={handleJoin}>PHI VÀO GIẬT NGAY 💨</button>
      </div>
      <p style={{ marginTop: '30px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Made with ❤️ by Hoang Uy</p>
    </div>
  )
}

// --- 2. Component ADMIN (Giữ nguyên) ---
const Admin = () => {
    const [balance, setBalance] = useState(() => parseInt(localStorage.getItem('adminBalance')) || 0);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [roomConfig, setRoomConfig] = useState({ totalAmount: '', quantity: '', creatorName: 'Uy Chủ Trì' });
    const [createdRoomId, setCreatedRoomId] = useState(null);

    const handleTopUp = () => {
        const amount = parseInt(topUpAmount.replace(/\D/g, ''));
        if (!amount || amount <= 0) return alert("Nhập số tiền hợp lệ!");
        const newBalance = balance + amount; setBalance(newBalance); localStorage.setItem('adminBalance', newBalance); setTopUpAmount(''); alert(`Đã nạp thêm ${amount.toLocaleString()} đ vào kho!`);
    };

    const handleCreateRoom = async () => {
        const total = parseInt(roomConfig.totalAmount.replace(/\D/g, '')); const qty = parseInt(roomConfig.quantity);
        if (!total || !qty) return alert("Vui lòng nhập đủ thông tin!");
        if (total > balance) return alert("❌ QUỸ KHÔNG ĐỦ TIỀN! Hãy nạp thêm.");
        try {
            const res = await axios.post('http://localhost:5000/api/lixi/create', { creatorName: roomConfig.creatorName, totalAmount: total, quantity: qty, type: 'RANDOM' });
            if (res.data.success) { const newBalance = balance - total; setBalance(newBalance); localStorage.setItem('adminBalance', newBalance); setCreatedRoomId(res.data.data._id); alert("✅ Tạo phòng thành công! Tiền đã được trích từ quỹ."); }
        } catch (error) { alert("Lỗi tạo phòng: " + error.message); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '20px', position: 'relative', zIndex: 1 }}>
            <FallingBlossoms />
            <h1 style={{color: 'var(--tet-yellow)', textShadow: '2px 2px 0 #d2001a'}}>👑 KHO BẠC NHÀ CÁI 👑</h1>
            <div className="tet-card" style={{marginBottom: '20px', background: 'linear-gradient(to right, #FFF8E7, #fff)'}}>
                <h3 style={{color: '#555', margin: '0'}}>💰 SỐ DƯ QUỸ TỔNG</h3>
                <div style={{fontSize: '3rem', fontWeight: 'bold', color: 'var(--tet-red)', margin: '10px 0'}}>{balance.toLocaleString('vi-VN')} đ</div>
                <div style={{display: 'flex', gap: '10px'}}><input className="tet-input" type="text" placeholder="Nhập tiền nạp..." value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} style={{margin: 0}} /><button onClick={handleTopUp} style={{background: 'var(--tet-gold)', border: 'none', borderRadius: '10px', padding: '0 20px', fontWeight: 'bold', color: '#fff', cursor: 'pointer'}}>NẠP QUỸ</button></div>
            </div>
            <div className="tet-card">
                <h3 style={{color: 'var(--my-blue)', margin: '0 0 15px 0'}}>🧧 TRÍCH QUỸ TẠO PHÒNG</h3>
                <label style={{display: 'block', textAlign: 'left', fontWeight: 'bold', color: '#555'}}>Tổng tiền phòng:</label>
                <input className="tet-input" type="number" placeholder="VD: 500000" value={roomConfig.totalAmount} onChange={(e) => setRoomConfig({...roomConfig, totalAmount: e.target.value})} />
                <label style={{display: 'block', textAlign: 'left', fontWeight: 'bold', color: '#555'}}>Số lượng người:</label>
                <input className="tet-input" type="number" placeholder="VD: 10" value={roomConfig.quantity} onChange={(e) => setRoomConfig({...roomConfig, quantity: e.target.value})} />
                <button className="btn-tet" onClick={handleCreateRoom}>TẠO PHÒNG NGAY</button>
                {createdRoomId && (<div style={{marginTop: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '10px', border: '1px solid #4caf50'}}><p style={{color: '#2e7d32', fontWeight: 'bold', margin: '0 0 10px 0'}}>✅ Đã tạo phòng!</p><div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#333', background: '#fff', padding: '10px', border: '1px dashed #333'}}>{createdRoomId}</div><p style={{fontSize: '0.8rem', color: '#666'}}>Copy ID này gửi cho mọi người</p></div>)}
            </div>
            <button onClick={() => window.location.href='/'} style={{marginTop: '20px', background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer'}}>⬅️ Quay về Trang Chủ</button>
        </div>
    );
};

// --- 3. Component Room (Cập nhật Logic Check Đã Nhận) ---
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
  
  // STATE MỚI: Đã nhận tiền chưa?
  const [myLixi, setMyLixi] = useState(null); // null hoặc { amount: 50000 }

  const navigate = useNavigate();
  const bgmRef = useRef(new Audio(AUDIO_URLS.bgm));
  const shakeRef = useRef(new Audio(AUDIO_URLS.shake));
  const winRef = useRef(new Audio(AUDIO_URLS.win));

  useEffect(() => {
    bgmRef.current.loop = true; bgmRef.current.volume = 0.3;
    const playAudio = async () => { try { if (!isMuted) await bgmRef.current.play(); } catch(e) {} };
    playAudio(); return () => { bgmRef.current.pause(); };
  }, [isMuted]);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (!storedName) { navigate('/'); return; }
    setName(storedName);
    
    const newSocket = io('http://localhost:5000'); setSocket(newSocket);
    newSocket.on('connect', () => { 
        setStatus('🟢 Máy chủ đã sẵn sàng!'); 
        newSocket.emit('join_room', { roomId: id, userName: storedName }); 
        fetchHistory(storedName); // Truyền tên vào để check ngay khi load
    });
    newSocket.on('user_joined', (data) => setNotifications(prev => [{type: 'info', text: `🐎 ${data.message}`}, ...prev]));
    newSocket.on('user_won_lixi', (data) => { 
        setNotifications(prev => [{type: 'win', text: data.message}, ...prev]); 
        fetchHistory(storedName); 
    });
    newSocket.on('update_player_list', (users) => setOnlineUsers(users));
    newSocket.on('connect_error', () => setStatus('🔴 Mất kết nối!'));
    
    return () => newSocket.close();
  }, [id, navigate]);

  const fetchHistory = async (currentUserName) => {
    try {
        const res = await axios.get(`http://localhost:5000/api/lixi/history/${id}`);
        if(res.data.success) {
            const histList = res.data.data;
            setHistory(histList);
            
            // CHECK XEM MÌNH ĐÃ NHẬN CHƯA
            const myRecord = histList.find(h => h.receiverName === currentUserName);
            if (myRecord) {
                setMyLixi({ amount: myRecord.amount });
            }
        }
    } catch(err) { console.error(err); }
  };

  const playSfx = (audioRef) => { if (!isMuted) { audioRef.current.currentTime = 0; audioRef.current.play().catch(e => {}); } };
  
  const handleShake = async () => {
    if (isShaking || myLixi) return; // Nếu đã nhận (myLixi) thì không cho lắc
    setIsShaking(true); playSfx(shakeRef); setTimeout(() => setIsShaking(false), 800);
    try { 
        const response = await axios.post('http://localhost:5000/api/lixi/open', { envelopeId: id, receiverName: name });
        if (response.data.success) { 
            const wonAmount = response.data.amount;
            setResult({ type: 'success', message: response.data.message || 'Lộc Ngựa Về!', amount: wonAmount }); 
            setShowWinAnim(true);
            setMyLixi({ amount: wonAmount }); // Cập nhật ngay state đã nhận
        }
    } catch (error) { 
        const msg = error.response?.data?.message || "Lỗi kết nối!";
        // Nếu lỗi là đã nhận rồi thì cập nhật UI luôn
        if (error.response?.status === 403) {
            setMyLixi({ amount: error.response.data.amount || 0 }); // Nếu backend trả về số tiền cũ thì hiển thị
            alert("Bạn đã nhận rồi mà!");
        } else {
            setResult({ type: 'error', message: msg }); 
        }
    }
  };

  const handleAnimFinished = () => { setShowWinAnim(false); playSfx(winRef); const duration = 3000; const end = Date.now() + duration; (function frame() { confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FFDE59', '#C69C3A', '#D2001A'] }); confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FFDE59', '#C69C3A', '#D2001A'] }); if (Date.now() < end) requestAnimationFrame(frame); }()); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '30px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <FallingBlossoms />
      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: '10px', zIndex: 100 }}>
        <button onClick={() => setIsMuted(!isMuted)} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #fff', color: '#fff', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}>{isMuted ? '🔇' : '🔊'}</button>
        <button onClick={() => setShowHistory(true)} style={{ background: 'var(--tet-red)', border: '1px solid var(--tet-yellow)', color: '#fff', borderRadius: '20px', padding: '0 15px', cursor: 'pointer', fontWeight: 'bold' }}>🏆 Bảng Vàng</button>
      </div>
      {showWinAnim && result && result.type === 'success' && <WinAnimationOverlay amount={result.amount} onFinished={handleAnimFinished} />}
      {!showWinAnim && result && (<div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}><div className="tet-card" style={{ animation: 'popIn 0.5s', background: 'linear-gradient(to bottom, #FFF8E7, #FFDE59)', border: '5px solid var(--tet-gold)' }}><div style={{fontSize: '4rem', position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)'}}>🦄</div>{result.type === 'success' ? (<><h2 style={{ color: '#d2001a', fontSize: '2.2rem', margin: '20px 0 10px' }}>MÃ ĐÁO THÀNH CÔNG!</h2><p style={{ fontSize: '1.2rem', color: '#333', fontWeight: 'bold' }}>{result.message}</p><div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#d2001a', margin: '20px 0', textShadow: '2px 2px 0 var(--tet-yellow)' }}>{result.amount.toLocaleString('vi-VN')} <span style={{fontSize: '2rem'}}>đ</span></div><button className="btn-tet" onClick={() => setResult(null)}>Tuyệt Vời!</button></>) : (<><h2 style={{ color: '#555', fontSize: '2.2rem', margin: '20px 0 10px' }}>TIẾC QUÁ!</h2><p style={{ fontSize: '1.2rem', color: '#333' }}>{result.message}</p><button className="btn-tet" onClick={() => setResult(null)}>Đóng lại</button></>)}</div></div>)}
      {showHistory && (<div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="tet-card" style={{ width: '90%', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><h2 style={{color: 'var(--tet-red)'}}>🏆 BẢNG PHONG THẦN 🏆</h2><div style={{ overflowY: 'auto', flex: 1, width: '100%', textAlign: 'left' }}>{history.length === 0 ? <p style={{textAlign: 'center'}}>Chưa ai mở hàng...</p> : (<table style={{width: '100%', borderCollapse: 'collapse'}}><thead><tr style={{background: '#eee', color: '#333'}}><th style={{padding: '10px'}}>Tên</th><th style={{padding: '10px', textAlign: 'right'}}>Tiền</th><th style={{padding: '10px', textAlign: 'right'}}>Giờ</th></tr></thead><tbody>{history.map((h, i) => (<tr key={i} style={{borderBottom: '1px solid #ddd'}}><td style={{padding: '10px', fontWeight: 'bold', color: 'var(--my-blue)'}}>{h.receiverName}</td><td style={{padding: '10px', textAlign: 'right', color: 'var(--tet-red)', fontWeight: 'bold'}}>{h.amount.toLocaleString()} đ</td><td style={{padding: '10px', textAlign: 'right', fontSize: '0.8rem', color: '#666'}}>{new Date(h.openedAt).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</td></tr>))}</tbody></table>)}</div><button className="btn-tet" style={{marginTop: '20px'}} onClick={() => setShowHistory(false)}>Đóng</button></div></div>)}
      <h2 style={{ color: 'var(--tet-yellow)', textShadow: '2px 2px 0 #d2001a', margin: 0, fontSize: '1.8rem' }} onClick={() => {navigator.clipboard.writeText(id); alert("Đã copy ID!")}} title="Bấm để copy ID">PHÒNG: {id} <span style={{fontSize: '1rem', verticalAlign: 'middle'}}>📋</span></h2>
      <div style={{ color: status.includes('sẵn sàng') ? '#aaffaa' : '#ffaaaa', background: 'rgba(0,0,0,0.5)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.85rem', margin: '10px 0 15px', fontWeight: 'bold', border: '1px solid var(--tet-gold)' }}>{status}</div>
      <div className="tet-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}><h3 className="text-dark" style={{margin: 0, display: 'flex', alignItems: 'center'}}>Chào, <span style={{color: 'var(--my-blue)', marginLeft: '5px'}}>{name}</span>! <span style={{fontSize: '1.5rem', marginLeft: '5px'}}>🧧</span></h3><span style={{ fontSize: '0.85rem', color: '#555', background: 'rgba(255, 222, 89, 0.3)', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--tet-gold)' }}>👥 {onlineUsers.length} người</span></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '15px', maxHeight: '60px', overflowY: 'auto' }}>{onlineUsers.map((u, i) => (<span key={i} style={{ fontSize: '0.75rem', background: u.name === name ? 'var(--my-blue)' : '#fff', color: u.name === name ? '#fff' : '#333', padding: '3px 8px', borderRadius: '4px', border: '1px solid #eee' }}>{u.name}</span>))}</div>
        <div style={{ height: '140px', overflowY: 'auto', background: '#fff', borderRadius: '10px', padding: '10px', marginBottom: '25px', border: '2px solid #eee', fontSize: '0.9rem', color: '#333', display: 'flex', flexDirection: 'column' }}>{notifications.length === 0 ? <span style={{color: '#999', fontStyle: 'italic', textAlign: 'center'}}>Sàn đấu đang yên tĩnh...</span> : notifications.map((n, i) => (<div key={i} style={{borderBottom:'1px dashed #eee', padding:'8px 5px',color: n.type === 'win' ? '#d2001a' : '#333',fontWeight: n.type === 'win' ? 'bold' : 'normal',background: n.type === 'win' ? '#fff8e7' : 'transparent',animation: 'popIn 0.3s'}}>{n.text}</div>))}</div>
        
        {/* LOGIC HIỂN THỊ NÚT LẮC HOẶC KẾT QUẢ ĐÃ NHẬN */}
        {myLixi ? (
            <div style={{textAlign: 'center', margin: '20px 0', padding: '20px', border: '2px dashed var(--tet-red)', borderRadius: '15px', background: '#fff'}}>
                <div style={{color: '#555', marginBottom: '5px'}}>Bạn đã nhận được:</div>
                <div style={{fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--tet-red)'}}>
                    {myLixi.amount ? myLixi.amount.toLocaleString() : '???'} đ
                </div>
                <div style={{fontSize: '0.8rem', color: '#999', marginTop: '5px'}}>(Mỗi người chỉ lắc 1 lần)</div>
            </div>
        ) : (
            <div className={isShaking ? "shake-active" : ""} style={{ margin: '0 auto 20px', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #FFDE59, #C69C3A, #d2001a)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '6px solid var(--tet-gold)', boxShadow: '0 0 30px rgba(255, 222, 89, 0.6), 0 10px 20px rgba(0,0,0,0.3)', cursor: 'pointer', color: '#fff', textShadow: '1px 1px 2px #d2001a', fontWeight: 'bold', fontSize: '1.3rem', userSelect: 'none', transition: 'transform 0.1s', position: 'relative' }} onMouseDown={(e) => !isShaking && (e.currentTarget.style.transform = 'scale(0.95)')} onMouseUp={(e) => !isShaking && (e.currentTarget.style.transform = 'scale(1)')} onClick={handleShake}><span style={{fontSize: '2.5rem', marginBottom: '-5px', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))'}}>{isShaking ? '💨' : '🐎'}</span><span>{isShaking ? "PHI MẠNH!" : "LẮC NGAY"}</span></div>
        )}

        <button className="btn-tet" style={{ background: '#555', fontSize: '0.9rem', marginTop: '0', boxShadow: 'none' }} onClick={() => { if(socket) socket.disconnect(); navigate('/'); }}>Rời Sàn Đấu</button>
      </div>
    </div>
  )
}

function App() { return (<BrowserRouter><Routes><Route path="/" element={<Home />} /><Route path="/admin" element={<Admin />} /><Route path="/room/:id" element={<Room />} /></Routes></BrowserRouter>) }
export default App