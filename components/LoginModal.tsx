
import React, { useState } from 'react';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';

interface LoginModalProps {
  onLogin: () => void;
  onCancel: () => void;
}

// The SHA-256 hash for the password "admin"
const PASSWORD_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const hashPassword = async (text: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const inputHash = await hashPassword(password);
      
      if (inputHash === PASSWORD_HASH) {
        onLogin();
      } else {
        setError(true);
        setPassword('');
      }
    } catch (err) {
      console.error("Auth error", err);
      setError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm border border-slate-200 relative overflow-hidden">
        
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-900 border border-slate-100 shadow-inner">
            <Lock size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">管理员权限</h2>
          <p className="text-slate-500 text-sm mt-2">请输入密码以解锁编辑功能</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              type="password"
              autoFocus
              disabled={isVerifying}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className={`w-full px-4 py-3 border rounded-lg outline-none text-center tracking-widest transition-all
                ${error 
                  ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200 text-red-900' 
                  : 'border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              placeholder="•••••"
            />
            {error && (
              <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
                 <p className="text-red-500 text-xs font-medium flex items-center gap-1 animate-pulse">
                  <AlertCircle size={12} /> 密码错误
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifying || password.length === 0}
            className="w-full py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
          >
            {isVerifying ? (
              <>
                <Loader2 size={18} className="animate-spin" /> 验证中...
              </>
            ) : (
              '解锁系统'
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={isVerifying}
            className="w-full py-2 text-slate-400 text-sm hover:text-slate-600 transition-colors"
          >
            返回浏览模式
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
