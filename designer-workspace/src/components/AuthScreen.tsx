import React, { useState } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import { LogIn, AlertCircle, ExternalLink, Mail, Lock } from 'lucide-react';

export default function AuthScreen() {
  const { signIn, signInWithEmail, signUpWithEmail, loading } = useFirebase();
  const [error, setError] = useState<string | null>(null);
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setError(null);
      setAuthLoading(true);
      await signIn();
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        setError('popup-blocked');
      } else {
        setError(err.message || '登录失败，请重试');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    
    try {
      setError(null);
      setAuthLoading(true);
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('该邮箱已被注册，请直接登录');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('邮箱或密码错误');
      } else if (err.code === 'auth/weak-password') {
        setError('密码太弱，请至少输入6位字符');
      } else {
        setError(err.message || '认证失败，请重试');
      }
    } finally {
      setAuthLoading(false);
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

        {isEmailMode ? (
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4cb2e6] dark:text-white transition-all"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="密码 (至少6位)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4cb2e6] dark:text-white transition-all"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#4cb2e6] hover:bg-[#3a9ad0] disabled:opacity-50 text-white py-3 px-4 rounded-xl font-bold transition-colors"
            >
              {authLoading ? '处理中...' : (isSignUp ? '注册账号' : '登录')}
            </button>
            
            <div className="flex items-center justify-between text-sm mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-[#4cb2e6] hover:underline"
              >
                {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEmailMode(false);
                  setError(null);
                }}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                返回其他方式
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleSignIn}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 py-3 px-4 rounded-xl font-bold transition-colors"
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
              {authLoading ? '登录中...' : '使用 Google 账号登录'}
            </button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">或</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsEmailMode(true);
                setError(null);
              }}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#4cb2e6] hover:bg-[#3a9ad0] disabled:opacity-50 text-white py-3 px-4 rounded-xl font-bold transition-colors"
            >
              <Mail className="w-5 h-5" />
              使用邮箱密码登录 (推荐 APK 使用)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
