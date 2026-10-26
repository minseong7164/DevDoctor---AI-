import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  Code2,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { Challenge, LeaderboardUser, UserProfile } from '../types';
import { calculateTier } from '../utils/debugger-engine';
import { storage } from '../utils/storage';

interface ChallengesViewProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({ user, onUpdateUser }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{
    passed: boolean;
    message: string;
    earnedPoints?: number;
  } | null>(null);

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([
    { rank: 1, name: '알고리즘신선', tier: 'Grandmaster', points: 3450, solvedChallenges: 62, badge: '💎' },
    { rank: 2, name: '코드마스터민', tier: 'Master', points: 2890, solvedChallenges: 54, badge: '🔮' },
    { rank: 3, name: '백엔드원탑', tier: 'Master', points: 2610, solvedChallenges: 48, badge: '🔮' },
    { rank: 4, name: '자바스크립트장인', tier: 'Diamond', points: 1940, solvedChallenges: 39, badge: '🔷' },
    { rank: 5, name: '파이썬머신', tier: 'Diamond', points: 1720, solvedChallenges: 35, badge: '🔷' },
    { rank: 6, name: 'DevDoctor김개발 (나)', tier: user.tier, points: user.points, solvedChallenges: user.resolvedCount, badge: '💠', isCurrentUser: true },
    { rank: 7, name: '새싹코더', tier: 'Platinum', points: 690, solvedChallenges: 21, badge: '💠' },
    { rank: 8, name: '알고리즘초보', tier: 'Gold', points: 410, solvedChallenges: 14, badge: '🥇' },
  ]);

  // Fetch challenges from server API
  useEffect(() => {
    fetch('/api/challenges')
      .then(res => res.json())
      .then((data: Challenge[]) => {
        setChallenges(data);
        if (data.length > 0) {
          setSelectedChallenge(data[0]);
          setCode(data[0].buggyCode);
        }
      })
      .catch(err => console.error('Failed to fetch challenges', err));
  }, []);

  const handleSelectChallenge = (c: Challenge) => {
    setSelectedChallenge(c);
    setCode(c.buggyCode);
    setFeedback(null);
    setShowHint(false);
  };

  const handleSubmitSolution = async () => {
    if (!selectedChallenge) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: selectedChallenge.id,
          code,
        }),
      });

      const res = await response.json();
      setFeedback({
        passed: res.passed,
        message: res.message,
        earnedPoints: res.earnedPoints,
      });

      if (res.passed) {
        // Update user points and tier
        const newPoints = user.points + (res.earnedPoints || selectedChallenge.points);
        const { tier } = calculateTier(newPoints);
        const updatedUser: UserProfile = {
          ...user,
          points: newPoints,
          tier,
          resolvedCount: user.resolvedCount + 1,
        };
        onUpdateUser(updatedUser);
        storage.saveUser(updatedUser);

        // Update leaderboard rank dynamically
        setLeaderboard(prev =>
          prev
            .map(u => (u.isCurrentUser ? { ...u, points: newPoints, tier, solvedChallenges: u.solvedChallenges + 1 } : u))
            .sort((a, b) => b.points - a.points)
            .map((u, idx) => ({ ...u, rank: idx + 1 }))
        );
      }
    } catch (err) {
      console.error(err);
      alert('제출 도중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Hero Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors min-w-0 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
              <span>실시간 코드 챌린지 &amp; 버그 수정 랭킹</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              버그가 잠복한 소스 코드를 올바르게 패치하고 테스트 케이스를 통과시켜 랭킹 포인트를 획득하세요.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl px-4 py-2.5 shrink-0 self-start sm:self-auto">
            <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">내 랭킹 포인트</div>
              <div className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                {user.points}P <span className="text-xs font-normal">({user.tier})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Challenge Problem & Editor vs Live Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start min-w-0 max-w-full">
        
        {/* Left 2 Cols: Challenge Solver */}
        <div className="lg:col-span-2 space-y-4 min-w-0 max-w-full">
          {/* Challenge Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 min-w-0 max-w-full">
            {challenges.map(c => (
              <button
                key={c.id}
                onClick={() => handleSelectChallenge(c)}
                className={`p-3 rounded-xl border text-left transition-all whitespace-nowrap shrink-0 ${
                  selectedChallenge?.id === c.id
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 text-[11px] mb-1">
                  <span
                    className={`font-semibold ${
                      c.difficulty === 'Easy'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : c.difficulty === 'Medium'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {c.difficulty}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">+{c.points}P</span>
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                  {c.title}
                </div>
              </button>
            ))}
          </div>

          {selectedChallenge && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 transition-colors">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-mono uppercase">{selectedChallenge.language}</span>
                  <span>·</span>
                  <span>{selectedChallenge.category}</span>
                  <span>·</span>
                  <span>{selectedChallenge.solvedCount.toLocaleString()}명 해결</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedChallenge.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {selectedChallenge.description}
                </p>
              </div>

              {/* Error Log clue */}
              <div className="bg-rose-950/20 border border-rose-900/30 text-rose-300 rounded-lg p-3 text-xs font-mono">
                <span className="text-slate-400 block text-[10px] mb-0.5 font-sans">에러 로그 (Traceback):</span>
                {selectedChallenge.errorLog}
              </div>

              {/* Code Editor */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    버그 수정 에디터 (아래 코드를 수정하세요)
                  </span>
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHint ? '힌트 닫기' : '힌트 보기'}</span>
                  </button>
                </div>

                {showHint && (
                  <div className="mb-2 p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs rounded-lg">
                    💡 <strong>힌트:</strong> {selectedChallenge.hint}
                  </div>
                )}

                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  rows={9}
                  className="w-full bg-slate-950 text-slate-100 font-mono text-xs rounded-lg p-3 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* Action & Feedback */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setCode(selectedChallenge.buggyCode)}
                  className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>초기 코드로 리셋</span>
                </button>

                <button
                  onClick={handleSubmitSolution}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{isSubmitting ? '채점 시뮬레이션 중...' : '코드 제출 및 채점'}</span>
                </button>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
                    feedback.passed
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  {feedback.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-bold">{feedback.passed ? '정답입니다! 🎉' : '오답입니다'}</div>
                    <div>{feedback.message}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Leaderboard */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              전국 대학/개발자 랭킹
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">실시간</span>
          </div>

          <div className="space-y-2">
            {leaderboard.map(userItem => (
              <div
                key={userItem.rank}
                className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                  userItem.isCurrentUser
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 font-semibold'
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate mr-2">
                  <span
                    className={`w-5 text-center font-mono font-bold ${
                      userItem.rank === 1
                        ? 'text-amber-500'
                        : userItem.rank === 2
                        ? 'text-slate-400'
                        : userItem.rank === 3
                        ? 'text-amber-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {userItem.rank}
                  </span>
                  <span className="text-sm">{userItem.badge}</span>
                  <div className="truncate">
                    <div className="text-slate-800 dark:text-slate-200 truncate">
                      {userItem.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {userItem.tier} · {userItem.solvedChallenges}개 해결
                    </div>
                  </div>
                </div>

                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold tabular-nums shrink-0">
                  {userItem.points.toLocaleString()}P
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
