import React, { useState, useRef, useEffect } from 'react';
import { Lock, KeyRound, AlertCircle, Eye, EyeOff, X } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = password.trim();
    if (clean === 'Admin' || clean.toLowerCase() === 'admin') {
      onSuccess();
      onClose();
    } else {
      setError(true);
      setPassword('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#383582] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/15 p-1.5 rounded-full">
              <Lock className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Admin Authentication</h3>
              <p className="text-[11px] text-purple-200">OPAU Ward Transformation Simulator</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white rounded p-1 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Enter the simulation administrator password to unlock edit mode. You will be able to modify patient names, bed allocations, NEWS scores, locations, and status flags.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="Enter password (e.g. Admin)"
                  className={`w-full px-3 py-2 pr-10 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                    error
                      ? 'border-red-500 focus:ring-red-300 bg-red-50/30'
                      : 'border-slate-300 focus:ring-purple-500'
                  }`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Incorrect password. Password is <strong>Admin</strong>.</span>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-700" />
                <span>Default Simulation Password:</span>
              </span>
              <code className="font-mono font-bold text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded">
                Admin
              </code>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#383582] hover:bg-[#2d2a6a] rounded transition-colors shadow-xs"
            >
              Unlock Edit Mode
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
