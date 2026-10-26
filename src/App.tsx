/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DebuggerView } from './components/DebuggerView';
import { DashboardView } from './components/DashboardView';
import { CommunityView } from './components/CommunityView';
import { ChallengesView } from './components/ChallengesView';
import { StoreView } from './components/StoreView';
import { MyPageView } from './components/MyPageView';
import { SocialAuthModal } from './components/SocialAuthModal';
import { NotificationModal } from './components/NotificationModal';
import { ReviewQuizModal } from './components/ReviewQuizModal';
import { AnalysisResult, NotificationItem, UserProfile } from './types';
import { storage } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('debugger');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('devdoctor_dark_mode');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return true;
    }
  });

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [user, setUser] = useState<UserProfile>(() => storage.getUser());
  const [history, setHistory] = useState<AnalysisResult[]>(() => storage.getHistory());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => storage.getNotifications());

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // Sync dark mode class on document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('devdoctor_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Online/Offline network listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Reopen past session in Debugger
  const handleSelectHistoryItem = (item: AnalysisResult) => {
    setActiveTab('debugger');
  };

  const handleSaveToNotes = (item: AnalysisResult) => {
    setHistory(storage.getHistory());
  };

  const handleShareToCommunity = (item: AnalysisResult) => {
    setActiveTab('community');
  };

  const handleClearHistory = () => {
    if (confirm('모든 오프라인 디버깅 캐시를 초기화하시겠습니까?')) {
      storage.clearHistory();
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 w-full max-w-full overflow-x-hidden">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isOnline={isOnline}
        user={user}
        notifications={notifications}
        openAuthModal={() => setIsAuthModalOpen(true)}
        openNotificationModal={() => setIsNotificationModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-12 min-w-0 max-w-full overflow-x-hidden">
        {activeTab === 'debugger' && (
          <DebuggerView
            onSaveToNotes={handleSaveToNotes}
            onShareToCommunity={handleShareToCommunity}
            isOnline={isOnline}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            user={user}
            history={history}
            onSelectHistoryItem={handleSelectHistoryItem}
            onOpenReviewQuiz={() => setIsQuizModalOpen(true)}
          />
        )}

        {activeTab === 'community' && (
          <CommunityView user={user} />
        )}

        {activeTab === 'challenges' && (
          <ChallengesView
            user={user}
            onUpdateUser={setUser}
          />
        )}

        {activeTab === 'store' && (
          <StoreView
            user={user}
            onUpdateUser={setUser}
          />
        )}

        {activeTab === 'mypage' && (
          <MyPageView
            user={user}
            onUpdateUser={setUser}
            history={history}
            onSelectHistoryItem={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
            onOpenReviewQuiz={() => setIsQuizModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">DevDoctor.ai</span>
            <span>·</span>
            <span>AI 기반 전공/코딩 과제 자동 디버거 &amp; 리뷰어</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Python · Java · JavaScript · C++ 지원</span>
            <span>·</span>
            <span>오프라인 캐싱 동기화 지원</span>
            <span>·</span>
            <span>PWA 크로스 플랫폼</span>
          </div>
        </div>
      </footer>

      {/* Social Auth Modal */}
      <SocialAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onUpdateUser={setUser}
      />

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onUpdateNotifications={setNotifications}
      />

      {/* Review Quiz Modal */}
      <ReviewQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        user={user}
        onUpdateUser={setUser}
      />
    </div>
  );
}
