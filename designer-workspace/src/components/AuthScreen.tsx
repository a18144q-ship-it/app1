import React, { useState } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import { LogIn, AlertCircle, ExternalLink } from 'lucide-react';

export default function AuthScreen() {
  const { signIn, loading } = useFirebase();
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signIn();
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        setError('popup-blocked');
      } else {
        setError(err.message || '登录失败，请重试');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-[#4cb2e6] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 dark:text-slate-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 bg-[#4cb2e6]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <LogIn className="w-8 h-8 text-[#4cb2e6]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">欢迎使用自重自守</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          请登录您的 Google 账号以开启云端同步，您的数据将安全地保存在云端，随时随地访问。
        </p>

        {error === 'popup-blocked' && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-xl text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-1">登录弹窗被拦截</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                  您的浏览器拦截了登录弹窗，或者您关闭了它。由于应用在预览环境中运行，请在新标签页中打开应用以完成登录。
                </p>
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                >
                  在新标签页中打开 <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}
        {error && error !== 'popup-blocked' && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-[#4cb2e6] hover:bg-[#3a9ad0] text-white py-3 px-4 rounded-xl font-bold transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          使用 Google 账号登录
        </button>
      </div>
    </div>
  );
}
