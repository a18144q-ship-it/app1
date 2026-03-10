import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, QrCode, Scan, Send, Download, Check, X, Wifi, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { io, Socket } from 'socket.io-client';
import { useAppStore, store, AppState } from '../store';
import { cn } from '../utils/cn';

export default function Sync() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useAppStore();
  
  const [mode, setMode] = useState<'selection' | 'send' | 'receive' | 'connecting'>('selection');
  const [syncId, setSyncId] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<string>('等待连接...');
  const [receivedData, setReceivedData] = useState<AppState | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManual, setIsManual] = useState(false);
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Initialize socket
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to sync server');
    });

    newSocket.on('receiver-ready', () => {
      setStatus('对方已就绪，正在传输数据...');
      const fullData = store.getState();
      newSocket.emit('send-data', { roomId: syncId, data: fullData });
    });

    newSocket.on('receive-data', (data: AppState) => {
      setReceivedData(data);
      setShowConfirm(true);
      setStatus('收到数据，等待确认...');
    });

    return () => {
      newSocket.disconnect();
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [syncId]);

  // Handle URL syncId
  useEffect(() => {
    const id = searchParams.get('syncId');
    if (id) {
      setSyncId(id);
      setMode('receive');
      handleManualJoin(id);
    }
  }, [searchParams, socket]);

  const startSending = () => {
    // Generate a 6-digit numeric code
    const id = Math.floor(100000 + Math.random() * 900000).toString();
    setSyncId(id);
    setMode('send');
    socket?.emit('join-room', id);
    setStatus('请在另一台设备输入同步码或扫码');
  };

  const handleManualJoin = (id: string) => {
    if (!id || id.length !== 6) {
      setError('请输入有效的6位同步码');
      return;
    }
    setSyncId(id);
    socket?.emit('join-room', id);
    socket?.emit('sync-ready', id);
    setStatus('已连接，正在请求数据...');
  };

  const startReceiving = () => {
    setMode('receive');
    setIsManual(false);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scanner.render((decodedText) => {
        try {
          const url = new URL(decodedText);
          const sid = url.searchParams.get('syncId');
          if (sid) {
            scanner.clear();
            handleManualJoin(sid);
          }
        } catch (e) {
          setError('无效的二维码');
        }
      }, (err) => {
        // console.warn(err);
      });
      scannerRef.current = scanner;
    }, 100);
  };

  const handleConfirmSync = () => {
    if (receivedData) {
      (store as any).replaceState(receivedData);
      setShowConfirm(false);
      setMode('selection');
      setStatus('同步成功！');
      setTimeout(() => navigate('/'), 1500);
    }
  };

  const syncUrl = syncId ? `${window.location.origin}/sync?syncId=${syncId}` : '';

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-black p-6">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">数据同步 🔄</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {mode === 'selection' && (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md space-y-6"
            >
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl flex gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                  警告：同步会覆盖当前设备的所有数据。如果你还没准备好面对空空如也的列表，就赶紧滚回去备份。😈
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={startSending}
                  className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl hover:border-[#4cb2e6] transition-all group"
                >
                  <div className="size-16 bg-[#4cb2e6]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Send className="w-8 h-8 text-[#4cb2e6]" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">作为发送端</h3>
                    <p className="text-xs text-slate-500 mt-1">把你的烂摊子传给别人</p>
                  </div>
                </button>

                <button 
                  onClick={startReceiving}
                  className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl hover:border-emerald-500 transition-all group"
                >
                  <div className="size-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Download className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">作为接收端</h3>
                    <p className="text-xs text-slate-500 mt-1">接盘别人的失败记录</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'send' && (
            <motion.div 
              key="send"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center space-y-8 w-full max-w-md"
            >
              <div className="space-y-4">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">你的同步码</div>
                <div className="text-6xl font-black text-[#4cb2e6] tracking-tighter bg-slate-50 dark:bg-slate-900 py-6 px-8 rounded-3xl border-2 border-slate-100 dark:border-slate-800">
                  {syncId}
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-100">
                <QRCodeSVG value={syncUrl} size={180} />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{status}</h2>
                <p className="text-sm text-slate-500">
                  扫不了码就手动输入上面的数字。如果你连 6 个数都数不明白，我建议你重读幼儿园。
                </p>
              </div>
              <button 
                onClick={() => setMode('selection')}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold"
              >
                取消发送
              </button>
            </motion.div>
          )}

          {mode === 'receive' && (
            <motion.div 
              key="receive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center space-y-6 w-full max-w-md"
            >
              {!syncId ? (
                <div className="w-full space-y-6">
                  {!isManual ? (
                    <>
                      <div id="reader" className="overflow-hidden rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-black aspect-square"></div>
                      <button 
                        onClick={() => {
                          if (scannerRef.current) scannerRef.current.clear();
                          setIsManual(true);
                        }}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-5 h-5" />
                        扫不了？手动输入同步码
                      </button>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">输入 6 位同步码</label>
                        <input 
                          type="text"
                          maxLength={6}
                          value={manualCode}
                          onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="000000"
                          className="w-full text-center text-5xl font-black py-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl focus:border-[#4cb2e6] outline-none transition-all text-slate-900 dark:text-white"
                        />
                      </div>
                      <button 
                        onClick={() => handleManualJoin(manualCode)}
                        disabled={manualCode.length !== 6}
                        className="w-full py-4 bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-2xl font-black text-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        立即同步
                      </button>
                      <button 
                        onClick={() => { setIsManual(false); startReceiving(); }}
                        className="text-sm font-bold text-slate-400 hover:text-slate-600"
                      >
                        返回扫码
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-slate-500">
                    对准那个该死的二维码，或者老老实实打字。
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-[#4cb2e6] animate-spin" />
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{status}</h2>
                </div>
              )}
              <button 
                onClick={() => {
                  if (scannerRef.current) scannerRef.current.clear();
                  setMode('selection');
                  setSyncId(null);
                  setManualCode('');
                }}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold"
              >
                放弃同步
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>


      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[101] p-8 border border-red-100 dark:border-red-900/30 text-center"
            >
              <div className="text-4xl mb-4">💀</div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                确认接盘？
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                你确定要用对方的垃圾数据覆盖你现在的垃圾数据吗？一旦确认，你现在的“努力”将灰飞烟灭。
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleConfirmSync}
                  className="w-full py-4 rounded-2xl font-black text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                >
                  确认覆盖（我不在乎）
                </button>
                <button 
                  onClick={() => { setShowConfirm(false); setMode('selection'); setSyncId(null); }}
                  className="w-full py-4 rounded-2xl font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  算了，我怂了
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {error && (
        <div className="fixed bottom-24 left-4 right-4 bg-red-500 text-white p-4 rounded-xl shadow-lg flex items-center justify-between">
          <p className="text-sm font-bold">{error}</p>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
