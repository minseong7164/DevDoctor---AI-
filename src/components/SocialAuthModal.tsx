import React from 'react';
import { UserProfile } from '../types';
import { Check, ShieldCheck, X } from 'lucide-react';
import { storage } from '../utils/storage';

interface SocialAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const SocialAuthModal: React.FC<SocialAuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  if (!isOpen) return null;

  const handleSelectProvider = (provider: 'google' | 'naver' | 'kakao') => {
    let name = user.name;
    let email = user.email;

    if (provider === 'google') {
      name = '김개발 (Google 연동)';
      email = 'king72572@gmail.com';
    } else if (provider === 'naver') {
      name = '김코더 (Naver 연동)';
      email = 'coder_kim@naver.com';
    } else if (provider === 'kakao') {
      name = '라이언개발자 (Kakao 연동)';
      email = 'kakao_ryan@kakao.com';
    }

    const updatedUser: UserProfile = {
      ...user,
      name,
      email,
      provider,
      linkedAccounts: {
        ...user.linkedAccounts,
        [provider]: true,
      },
    };

    onUpdateUser(updatedUser);
    storage.saveUser(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              소셜 간편 로그인 &amp; 계정 연동
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          구글, 네이버, 카카오톡 소셜 계정으로 로그인하여 데스크톱 및 모바일 전 기기에서 동일한 디버깅 기록과 오답노트를 동기화하세요.
        </p>

        {/* Social Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Google */}
          <button
            onClick={() => handleSelectProvider('google')}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-blue-600 text-xs">
                G
              </span>
              <span>Google 계정으로 계속하기</span>
            </div>
            {user.provider === 'google' && <Check className="w-4 h-4 text-emerald-500" />}
          </button>

          {/* Naver */}
          <button
            onClick={() => handleSelectProvider('naver')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#03C75A] hover:bg-[#02b350] text-xs font-semibold text-white flex items-center justify-between transition-colors cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-white text-[#03C75A] flex items-center justify-center font-black text-xs">
                N
              </span>
              <span>네이버 아이디로 로그인</span>
            </div>
            {user.provider === 'naver' && <Check className="w-4 h-4 text-white" />}
          </button>

          {/* Kakao */}
          <button
            onClick={() => handleSelectProvider('kakao')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FEE500] hover:bg-[#ebd300] text-xs font-semibold text-amber-950 flex items-center justify-between transition-colors cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-amber-950 text-[#FEE500] flex items-center justify-center font-black text-xs">
                K
              </span>
              <span>카카오톡으로 간편 로그인</span>
            </div>
            {user.provider === 'kakao' && <Check className="w-4 h-4 text-amber-950" />}
          </button>
        </div>

        <div className="text-[11px] text-slate-400 text-center pt-2">
          현재 로그인: <strong>{user.name}</strong> ({user.provider.toUpperCase()})
        </div>
      </div>
    </div>
  );
};
