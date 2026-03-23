import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, QrCode, Scan, Send, Download, Check, X, Wifi, AlertTriangle, Loader2, FileUp, FileDown, Copy, Clipboard, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Peer, DataConnection } from 'peerjs';
import { useAppStore, store, AppState } from '../store';
import { cn } from '../utils/cn';

export default function Sync() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useAppStore();
  
  const [mode, setMode] = useState<'selection' | 'send' | 'receive' | 'connecting'>('selection');
  const [syncId, setSyncId] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [status, setStatus] = useState<string>('等待连接...');
  const [receivedData, setReceivedData] = useState<AppState | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManual, setIsManual] = useState(false);
  const [showTextareaModal, setShowTextareaModal] = useState(false);
  const [textareaData, setTextareaData] = useState('');
  const [textareaMode, setTextareaMode] = useState<'copy' | 'paste'>('copy');
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);

  // Cleanup PeerJS connections
  const cleanupPeer = () => {
    if (connRef.current) {
      connRef.current.close();
      connRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
  };

  useEffect(() => {
    return cleanupPeer;
  }, []);

  // Handle URL syncId
  useEffect(() => {
    const id = searchParams.get('syncId');
    if (id) {
      setSyncId(id);
      setMode('receive');
      handleManualJoin(id);
    }
  }, [searchParams]);

  const getPeerConfig = () => {
    // 统一使用官方公共服务器，确保网页端和APP端连接到同一个信令服务器，解决跨端无法同步的问题
    return undefined;
  };

  const startSending = () => {
    cleanupPeer();
    setMode('send');
    setStatus('正在初始化局域网节点...');
    
    // Generate a short ID for easier manual entry, though PeerJS might need longer ones to avoid collisions.
    // We'll use a 6-character alphanumeric string.
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const peer = new Peer(id, getPeerConfig());
    peerRef.current = peer;

    peer.on('open', (assignedId) => {
      setSyncId(assignedId);
      setStatus('请在另一台设备输入同步码或扫码');
    });

    peer.on('connection', (conn) => {
      connRef.current = conn;
      setStatus('设备已连接，正在发送数据...');
      
      conn.on('open', () => {
        const fullData = store.getState();
        conn.send(fullData);
        setStatus('发送成功！');
        setTimeout(() => {
          cleanupPeer();
          setMode('selection');
          setSyncId(null);
        }, 2000);
      });

      conn.on('error', (err) => {
        setError('传输错误: ' + err.message);
      });
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setError('P2P 节点错误，请检查网络或重试');
    });
  };

  const handleManualJoin = (id: string) => {
    if (!id) {
      setError('请输入有效的同步码');
      return;
    }
    
    cleanupPeer();
    setSyncId(id);
    setStatus('正在建立 P2P 连接...');
    
    const peer = new Peer(getPeerConfig());
    peerRef.current = peer;

    peer.on('open', () => {
      const conn = peer.connect(id.toUpperCase(), { reliable: true });
      connRef.current = conn;

      conn.on('open', () => {
        setStatus('连接成功，正在接收数据...');
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      });

      conn.on('data', (data: any) => {
        setReceivedData(data);
        setShowConfirm(true);
        setStatus('收到数据，等待确认...');
        conn.close();
      });

      conn.on('error', (err) => {
        setError('传输错误: ' + err.message);
      });
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setError('连接失败：找不到发送端。你是不是瞎编了一个码？');
      setMode('selection');
      setSyncId(null);
      setManualCode('');
    });

    syncTimeoutRef.current = setTimeout(() => {
      if (!receivedData) {
        setError('连接超时：发送端可能已断开。');
        cleanupPeer();
        setMode('selection');
        setSyncId(null);
        setManualCode('');
      }
    }, 15000);
  };

  const startReceiving = () => {
    setMode('receive');
    setIsManual(false);
  };

  // Safe scanner initialization
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    let timer: NodeJS.Timeout;

    if (mode === 'receive' && !isManual && !syncId) {
      timer = setTimeout(() => {
        const element = document.getElementById('reader');
        if (!element) return;

        try {
          scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
          );
          
          scanner.render((decodedText) => {
            try {
              const url = new URL(decodedText);
              const sid = url.searchParams.get('syncId');
              if (sid) {
                if (scanner) {
                  scanner.clear().catch(console.error);
                }
                handleManualJoin(sid);
              }
            } catch (e) {
              // If it's not a URL, maybe it's just the code itself
              if (decodedText.length === 6) {
                if (scanner) {
                  scanner.clear().catch(console.error);
                }
                handleManualJoin(decodedText);
              } else {
                setError('无效的二维码');
              }
            }
          }, (err) => {
            // ignore
          });
          scannerRef.current = scanner;
        } catch (err) {
          console.error("Scanner init failed", err);
        }
      }, 100);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [mode, isManual, syncId]);

  const handleConfirmSync = () => {
    if (receivedData) {
      (store as any).replaceState(receivedData);
      setShowConfirm(false);
      setMode('selection');
      setStatus('同步成功！');
      setTimeout(() => navigate('/'), 1500);
    }
  };

  const handleExportFile = async () => {
    try {
      const data = store.getState();
      const jsonString = JSON.stringify(data, null, 2);
      const fileName = `backup-${new Date().toISOString().split('T')[0]}.json`;

      // 如果是原生 APP 环境，优先使用 Capacitor 插件
      if (typeof window !== 'undefined' && (window as any).Capacitor && (window as any).Capacitor.isNativePlatform()) {
        try {
          const { Clipboard } = await import('@capacitor/clipboard');
          await Clipboard.write({
            string: jsonString
          });
          alert('由于系统限制，已将备份数据复制到剪贴板。请将其粘贴到备忘录或其他地方保存。');
          setError(null);
          return;
        } catch (e) {
          console.error('Native copy failed', e);
          handleCopyData();
          alert('复制失败，请尝试使用"复制/粘贴数据代码"功能。');
          return;
        }
      }

      const file = new File([jsonString], fileName, { type: 'application/json' });

      // 优先尝试 Web Share API (手机端分享到微信、QQ等)
      // 注意：在某些 Android WebView 中，带有 files 的 navigator.share 可能会导致闪退
      const isAndroid = /Android/i.test(navigator.userAgent);
      if (!isAndroid && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: '数据备份',
            text: '这是我的应用数据备份文件，请在另一台设备上导入。'
          });
          setError(null);
          return; // 分享成功，直接返回
        } catch (shareError: any) {
          // 如果用户取消分享，或者分享失败，继续执行下面的普通下载逻辑
          if (shareError.name !== 'AbortError') {
            console.error('Share failed:', shareError);
          }
        }
      }

      // 降级方案：普通的文件下载 (PC端或不支持分享的设备)
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setError(null);
      alert('导出成功！如果手机上没有反应，说明你的环境拦截了下载，请尝试使用"复制/粘贴数据代码"功能。');
    } catch (err) {
      console.error('Export failed:', err);
      setError('导出失败，你的设备可能不支持。');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data && typeof data === 'object') {
          (store as any).replaceState(data);
          setError(null);
          alert('导入成功！数据已恢复。');
          navigate('/');
        } else {
          setError('无效的数据格式');
        }
      } catch (err) {
        setError('解析文件失败，你是不是传了个假文件？');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleCopyData = async () => {
    const data = JSON.stringify(store.getState());
    try {
      await navigator.clipboard.writeText(data);
      alert('数据代码已复制到剪贴板！请在另一台设备上选择“粘贴数据代码”。');
    } catch (err) {
      setTextareaData(data);
      setTextareaMode('copy');
      setShowTextareaModal(true);
    }
  };

  const processImportedText = (text: string) => {
    try {
      const data = JSON.parse(text);
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        (store as any).replaceState(data);
        setError(null);
        alert('导入成功！数据已恢复。');
        navigate('/');
      } else {
        setError('无效的数据格式');
      }
    } catch (err) {
      setError('解析失败，请确保复制了完整的代码。');
    }
  };

  const handlePasteData = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        processImportedText(text);
      } else {
        throw new Error('Clipboard empty');
      }
    } catch (err) {
      setTextareaData('');
      setTextareaMode('paste');
      setShowTextareaModal(true);
    }
  };

  const syncUrl = syncId ? `https://ais-pre-f4uq7v7qkqean52l4mgnxq-514207399885.asia-east1.run.app/sync?syncId=${syncId}` : '';

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-black p-6">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">数据同步 🔄</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center">
        {mode === 'selection' && (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md space-y-6"
          >
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl flex gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                警告：同步会覆盖当前设备的所有数据。如果你还没准备好面对空空如也的列表，就赶紧滚回去备份。😈
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={startSending}
                  className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl hover:border-[#4cb2e6] transition-all group"
                >
                  <div className="size-12 bg-[#4cb2e6]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wifi className="w-6 h-6 text-[#4cb2e6]" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-md font-bold text-slate-900 dark:text-white">发送 (局域网)</h3>
                  </div>
                </button>

                <button 
                  onClick={startReceiving}
                  className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl hover:border-emerald-500 transition-all group"
                >
                  <div className="size-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Download className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-md font-bold text-slate-900 dark:text-white">接收 (局域网)</h3>
                  </div>
                </button>
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">或者使用文件离线同步</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleExportFile}
                  className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl hover:border-purple-500 transition-all group"
                >
                  <div className="size-12 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileDown className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-md font-bold text-slate-900 dark:text-white">导出到文件</h3>
                  </div>
                </button>

                <label className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl hover:border-orange-500 transition-all group cursor-pointer">
                  <div className="size-12 bg-orange-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileUp className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-md font-bold text-slate-900 dark:text-white">从文件导入</h3>
                  </div>
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={handleImportFile}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleCopyData}
                  className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl hover:border-blue-500 transition-all group"
                >
                  <div className="size-12 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Copy className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-md font-bold text-slate-900 dark:text-white">复制数据代码</h3>
                  </div>
                </button>

                <button 
                  onClick={handlePasteData}
                  className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl hover:border-pink-500 transition-all group"
                >
                  <div className="size-12 bg-pink-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clipboard className="w-6 h-6 text-pink-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-md font-bold text-slate-900 dark:text-white">粘贴数据代码</h3>
                  </div>
                </button>
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink-0 mx-4 text-red-500 text-sm font-bold">危险区域</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <button 
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-3 p-6 bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/20 rounded-3xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all group"
              >
                <Trash2 className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <h3 className="text-md font-bold text-red-600 dark:text-red-400">清除所有记录</h3>
                  <p className="text-xs text-red-500/70">清空所有任务、灵感、琐事和统计数据</p>
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
                {syncId || '...'}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-100">
              {syncUrl ? <QRCodeSVG value={syncUrl} size={180} /> : <div className="w-[180px] h-[180px] bg-slate-100 animate-pulse rounded-lg"></div>}
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{status}</h2>
              <p className="text-sm text-slate-500">
                扫不了码就手动输入上面的字符。如果你连 6 个字符都打不对，我建议你重读幼儿园。
              </p>
            </div>
            <button 
              onClick={() => {
                cleanupPeer();
                setMode('selection');
                setSyncId(null);
              }}
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
                        if (scannerRef.current) {
                          scannerRef.current.clear().catch(console.error);
                          scannerRef.current = null;
                        }
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
                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                        placeholder="XXXXXX"
                        className="w-full text-center text-5xl font-black py-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl focus:border-[#4cb2e6] outline-none transition-all text-slate-900 dark:text-white uppercase"
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
                if (scannerRef.current) {
                  scannerRef.current.clear().catch(console.error);
                  scannerRef.current = null;
                }
                cleanupPeer();
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
                  onClick={() => { setShowConfirm(false); setMode('selection'); setSyncId(null); cleanupPeer(); }}
                  className="w-full py-4 rounded-2xl font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  算了，我怂了
                </button>
              </div>
            </motion.div>
          </>
        )}

        {showResetConfirm && (
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
              <div className="text-4xl mb-4">🧨</div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                彻底清空？
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                这将删除你所有的任务、灵感记录和琐事。一旦执行，神仙也救不回来。你真的想重新做人吗？
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    (store as any).resetState();
                    setShowResetConfirm(false);
                    alert('已清空所有记录。你现在是一张白纸了。');
                    navigate('/');
                  }}
                  className="w-full py-4 rounded-2xl font-black text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                >
                  确认清空（毁灭吧）
                </button>
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full py-4 rounded-2xl font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  点错了，吓死我了
                </button>
              </div>
            </motion.div>
          </>
        )}

        {showTextareaModal && (
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[101] p-6 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {textareaMode === 'copy' ? '手动复制数据' : '手动粘贴数据'}
                </h3>
                <button onClick={() => setShowTextareaModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                {textareaMode === 'copy' 
                  ? '你的设备不支持自动复制，请手动全选下方的代码并复制。' 
                  : '你的设备不支持自动读取剪贴板，请将代码粘贴到下方输入框中。'}
              </p>
              <textarea
                value={textareaData}
                onChange={(e) => setTextareaData(e.target.value)}
                readOnly={textareaMode === 'copy'}
                className="flex-1 w-full min-h-[200px] p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-[#4cb2e6] outline-none resize-none"
                placeholder={textareaMode === 'paste' ? '在此粘贴数据代码...' : ''}
              />
              <div className="mt-4 flex gap-3">
                {textareaMode === 'paste' && (
                  <button 
                    onClick={() => {
                      processImportedText(textareaData);
                      setShowTextareaModal(false);
                    }}
                    className="flex-1 py-3 bg-[#4cb2e6] text-white rounded-xl font-bold shadow-lg shadow-[#4cb2e6]/20 active:scale-95 transition-all"
                  >
                    确认导入
                  </button>
                )}
                <button 
                  onClick={() => setShowTextareaModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold active:scale-95 transition-all"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {error && (
        <div className="fixed bottom-24 left-4 right-4 bg-red-500 text-white p-4 rounded-xl shadow-lg flex items-center justify-between z-[110]">
          <p className="text-sm font-bold">{error}</p>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
