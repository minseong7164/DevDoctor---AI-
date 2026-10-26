import React, { useState } from 'react';
import {
  User as UserIcon,
  Bookmark,
  History,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Download,
  Trash2,
  ExternalLink,
  BookOpen,
  Award,
  Search,
  Check,
  Zap,
} from 'lucide-react';
import { AnalysisResult, UserProfile } from '../types';
import { storage } from '../utils/storage';

interface MyPageViewProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  history: AnalysisResult[];
  onSelectHistoryItem: (item: AnalysisResult) => void;
  onClearHistory: () => void;
  onOpenReviewQuiz: () => void;
}

export const MyPageView: React.FC<MyPageViewProps> = ({
  user,
  onUpdateUser,
  history,
  onSelectHistoryItem,
  onClearHistory,
  onOpenReviewQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'history' | 'accounts'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const bookmarks = storage.getBookmarks();

  // Filter bookmarked history items
  const bookmarkedItems = history.filter(h => bookmarks.includes(h.id));

  const filteredHistory = history.filter(h => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      h.errorTitle.toLowerCase().includes(q) ||
      h.errorType.toLowerCase().includes(q) ||
      h.language.toLowerCase().includes(q)
    );
  });

  const filteredNotes = bookmarkedItems.filter(h => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      h.errorTitle.toLowerCase().includes(q) ||
      h.errorType.toLowerCase().includes(q) ||
      h.language.toLowerCase().includes(q)
    );
  });

  // Toggle Social Account Link
  const handleToggleLink = (provider: 'google' | 'naver' | 'kakao') => {
    const updatedUser: UserProfile = {
      ...user,
      linkedAccounts: {
        ...user.linkedAccounts,
        [provider]: !user.linkedAccounts[provider],
      },
    };
    onUpdateUser(updatedUser);
    storage.saveUser(updatedUser);
  };

  // Export JSON backup
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `devdoctor_learning_archive_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* User Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs transition-colors min-w-0 max-w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-md shadow-indigo-600/20 shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  {user.name}
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
                  {user.tier} 티어
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {user.email} · {user.universityOrOrg}
              </p>
            </div>
          </div>

          {/* Points & Stats Pill & Quiz Button */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 sm:p-3 flex-1 sm:flex-initial justify-around sm:justify-start">
              <div>
                <div className="text-[10px] text-slate-500">누적 포인트</div>
                <div className="text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                  {user.points.toLocaleString()}P
                </div>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <div className="text-[10px] text-slate-500">해결 과제</div>
                <div className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200 font-mono tabular-nums">
                  {user.resolvedCount}건
                </div>
              </div>
            </div>

            <button
              onClick={onOpenReviewQuiz}
              className="px-3.5 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 w-full sm:w-auto"
              title="오답노트 기반 3분 복습 퀴즈 풀기"
            >
              <Zap className="w-3.5 h-3.5 fill-white shrink-0" />
              <span>복습 퀴즈</span>
            </button>
          </div>
        </div>

        {/* Offline Cache Notice */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <HardDrive className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">
              <strong>오프라인 캐싱 활성화:</strong> {history.length}개의 분석 기록이 로컬 저장소에 캐시되었습니다.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportData}
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>백업 내보내기</span>
            </button>
            <span>·</span>
            <button
              onClick={onClearHistory}
              className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>캐시 비우기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 sm:gap-4 border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold overflow-x-auto no-scrollbar min-w-0">
        <button
          onClick={() => setActiveTab('notes')}
          className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'notes'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4 shrink-0" />
          <span>내 오답노트 ({bookmarkedItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4 shrink-0" />
          <span>전체 학습 이력 ({history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'accounts'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>소셜 계정 연동</span>
        </button>
      </div>

      {/* Search Input for Notes / History */}
      {activeTab !== 'accounts' && (
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="오류 제목, 에러 유형, 언어 검색..."
            className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
          />
        </div>
      )}

      {/* Tab 1: Bookmarked Notes (오답노트) */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          {filteredNotes.length > 0 ? (
            filteredNotes.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors hover:border-indigo-300 dark:hover:border-indigo-700 min-w-0 max-w-full"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase shrink-0">
                      {item.language}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-rose-600 dark:text-rose-400 font-semibold shrink-0">{item.errorType}</span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-slate-400 shrink-0">{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white break-words">
                    {item.errorTitle}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {item.rootCause}
                  </p>
                </div>

                <button
                  onClick={() => onSelectHistoryItem(item)}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shrink-0 transition-colors self-end sm:self-auto cursor-pointer"
                >
                  <span>다시 열기</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
              북마크된 오답노트가 없습니다. AI 디버거에서 상단의 <strong>[오답노트]</strong> 버튼을 눌러 중요한 버그를 보관하세요!
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Full History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {filteredHistory.length > 0 ? (
            filteredHistory.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors hover:border-indigo-300 dark:hover:border-indigo-700 min-w-0 max-w-full"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase shrink-0">
                      {item.language}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-slate-500 shrink-0">{item.errorType}</span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-slate-400 shrink-0">{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white break-words">
                    {item.errorTitle}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {item.diffSummary}
                  </p>
                </div>

                <button
                  onClick={() => onSelectHistoryItem(item)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shrink-0 transition-colors self-end sm:self-auto cursor-pointer"
                >
                  <span>상세 보기</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
              학습 이력이 비어 있습니다.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Social Account Linking */}
      {activeTab === 'accounts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              소셜 간편 로그인 &amp; 계정 통합 연동
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              구글, 네이버, 카카오 계정을 연동하면 모바일 앱과 데스크톱 어디서나 동일한 학습 이력을 열람할 수 있습니다.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Google */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-sm text-blue-600">
                  G
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Google 계정</div>
                  <div className="text-[11px] text-slate-500">{user.email}</div>
                </div>
              </div>

              <button
                onClick={() => handleToggleLink('google')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  user.linkedAccounts.google
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {user.linkedAccounts.google && <Check className="w-3.5 h-3.5" />}
                <span>{user.linkedAccounts.google ? '연동됨' : '연동하기'}</span>
              </button>
            </div>

            {/* Naver */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#03C75A] text-white flex items-center justify-center font-black text-sm">
                  N
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">네이버 (Naver)</div>
                  <div className="text-[11px] text-slate-500">
                    {user.linkedAccounts.naver ? '네이버 아이디로 로그인 연동 완료' : '미연동 상태'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleToggleLink('naver')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  user.linkedAccounts.naver
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {user.linkedAccounts.naver && <Check className="w-3.5 h-3.5" />}
                <span>{user.linkedAccounts.naver ? '연동됨' : '연동하기'}</span>
              </button>
            </div>

            {/* Kakao */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FEE500] text-amber-950 flex items-center justify-center font-black text-sm">
                  K
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">카카오톡 (Kakao)</div>
                  <div className="text-[11px] text-slate-500">
                    {user.linkedAccounts.kakao ? '카카오 계정으로 간편 로그인 연동 완료' : '미연동 상태'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleToggleLink('kakao')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  user.linkedAccounts.kakao
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {user.linkedAccounts.kakao && <Check className="w-3.5 h-3.5" />}
                <span>{user.linkedAccounts.kakao ? '연동됨' : '연동하기'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
