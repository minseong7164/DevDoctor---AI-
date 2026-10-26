import React from 'react';
import {
  Bell,
  Moon,
  Sun,
  WifiOff,
  Terminal,
  Sparkles,
  User as UserIcon,
  TrendingUp,
  MessageSquare,
  Trophy,
} from 'lucide-react';
import { UserProfile, NotificationItem } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isOnline: boolean;
  user: UserProfile;
  notifications: NotificationItem[];
  openAuthModal: () => void;
  openNotificationModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleDarkMode,
  isOnline,
  user,
  notifications,
  openAuthModal,
  openNotificationModal,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'debugger', label: 'AI 디버거', shortLabel: '디버거', icon: Terminal },
    { id: 'dashboard', label: '학습 대시보드', shortLabel: '대시보드', icon: TrendingUp },
    { id: 'community', label: '코드 리뷰', shortLabel: '리뷰', icon: MessageSquare },
    { id: 'challenges', label: '챌린지 랭킹', shortLabel: '랭킹', icon: Trophy },
    { id: 'store', label: '프리미엄 팩', shortLabel: '스토어', icon: Sparkles },
    { id: 'mypage', label: '마이페이지', shortLabel: '마이', icon: UserIcon },
  ];

  return (
    <>
      {/* Offline Status Alert Banner */}
      {!isOnline && (
        <aside
          aria-label="네트워크 상태 알림"
          className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs flex items-center justify-center gap-2"
        >
          <WifiOff className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
          <span className="truncate">오프라인 모드 — 캐시된 학습 이력과 오답노트를 안전하게 조회할 수 있습니다.</span>
        </aside>
      )}

      {/* Top Bar following 3-Zone Contract */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
          
          {/* Zone 1: Brand title, single line text wordmark */}
          <button
            onClick={() => setActiveTab('debugger')}
            className="flex items-center gap-2 text-left text-slate-900 dark:text-white group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1 shrink-0 cursor-pointer"
            aria-label="DevDoctor 홈으로 이동"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 shrink-0">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold tracking-tight font-sans whitespace-nowrap">
                DevDoctor<span className="text-indigo-600 dark:text-indigo-400">.ai</span>
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation links for desktop screens (>=1024px) */}
          <nav
            aria-label="주요 메뉴"
            className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-2 whitespace-nowrap shrink-0 transition-colors relative cursor-pointer ${
                  activeTab === item.id
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
                {activeTab === item.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: Action cluster (Dark mode + Notifications + User Profile) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            <button
              onClick={openNotificationModal}
              aria-label={`알림 ${unreadCount}개 확인`}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* User Profile / Login */}
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 pr-2 sm:pr-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              aria-label="내 계정 정보 및 소셜 로그인 관리"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                {user.name.charAt(0)}
              </div>
              <span className="max-w-[65px] sm:max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
              <span className="hidden sm:inline text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{user.tier}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Bottom Navigation Bar (Responsive, Touch Friendly >= 48px) */}
      <nav
        aria-label="모바일 및 태블릿 하단 메뉴"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-1.5 px-1 shadow-lg shadow-black/10 safe-area-bottom"
      >
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-0.5 text-[10px] sm:text-xs font-medium transition-colors cursor-pointer select-none ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="leading-tight truncate max-w-full">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
