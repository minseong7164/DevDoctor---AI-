import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Layers,
  Bug,
  Brain,
  Code2,
  Calendar,
  Award,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { AnalysisResult, UserProfile } from '../types';

interface DashboardViewProps {
  user: UserProfile;
  history: AnalysisResult[];
  onSelectHistoryItem: (item: AnalysisResult) => void;
  onOpenReviewQuiz: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  history,
  onSelectHistoryItem,
  onOpenReviewQuiz,
}) => {
  // Weekly solving data
  const weeklyData = [
    { day: '월', count: 4, height: '40%' },
    { day: '화', count: 7, height: '70%' },
    { day: '수', count: 5, height: '50%' },
    { day: '목', count: 9, height: '90%' },
    { day: '금', count: 12, height: '100%' },
    { day: '토', count: 8, height: '80%' },
    { day: '일', count: 6, height: '60%' },
  ];

  // Frequent error categories
  const errorCategories = [
    { name: 'IndexError / 경계값 초과', count: 16, percent: 38, color: 'bg-indigo-500' },
    { name: 'NullPointerException / 객체 미할당', count: 11, percent: 26, color: 'bg-rose-500' },
    { name: 'TypeError / 타입 불일치', count: 8, percent: 19, color: 'bg-amber-500' },
    { name: 'Recursion / 콜스택 오버플로우', count: 4, percent: 10, color: 'bg-violet-500' },
    { name: 'Memory / 포인터 누수', count: 3, percent: 7, color: 'bg-emerald-500' },
  ];

  // Competency metrics
  const competencies = [
    { name: '자료구조 (Data Structures)', score: 88, desc: '배열, 연결 리스트, 해시맵 이해 우수' },
    { name: '알고리즘 (Algorithm Optimization)', score: 76, desc: '시간 복잡도 O(N log N) 개선 필요' },
    { name: '메모리 & 포인터 (Memory Safety)', score: 65, desc: 'C++ 동적 할당 소멸자 방어 강화 요망' },
    { name: '비동기 & 동시성 (Concurrency)', score: 82, desc: 'Promise & Async 가드 숙련' },
    { name: '방어적 프로그래밍 (Defensive Coding)', score: 91, desc: 'Null 가드 및 예외 처리 철저' },
  ];

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-7 border border-slate-800 shadow-sm relative overflow-hidden min-w-0 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="max-w-2xl min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs text-indigo-200 mb-3 backdrop-blur-xs">
              <Award className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">학습 역량 분석 리포트 · {user.tier} 티어 ({user.points}P)</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight break-words">
              {user.name.split(' ')[0]} 님의 코딩 학습 및 디버깅 성장 지표
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              최근 4주간 총 <strong className="text-white font-mono">{user.resolvedCount}건</strong>의 코딩 과제 오류를 해결했습니다.
              평균 디버깅 소요 시간이 <strong className="text-emerald-400">42분에서 6분으로 85% 단축</strong>되었습니다.
            </p>
          </div>

          <button
            onClick={onOpenReviewQuiz}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap self-stretch sm:self-auto transition-colors cursor-pointer shrink-0"
          >
            <Zap className="w-4 h-4 fill-white shrink-0" />
            <span>오답노트 3분 복습 퀴즈</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-w-0 max-w-full">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xs min-w-0">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs gap-1">
            <span className="truncate">해결된 과제 수</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 sm:mt-2 font-mono tabular-nums truncate">
            {user.resolvedCount} <span className="text-xs font-normal text-slate-500">건</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-0.5 truncate">
            <TrendingUp className="w-3 h-3 shrink-0" />
            <span className="truncate">지난주 대비 +12%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xs min-w-0">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs gap-1">
            <span className="truncate">디버깅 성공률</span>
            <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 sm:mt-2 font-mono tabular-nums truncate">
            94.2<span className="text-xs font-normal text-slate-500">%</span>
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 truncate">
            <span>상위 8% 우수 코더</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xs min-w-0">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs gap-1">
            <span className="truncate">평균 단축 시간</span>
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 sm:mt-2 font-mono tabular-nums truncate">
            36<span className="text-xs font-normal text-slate-500">분 절약</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            <span>과제 1건당 평균 소요</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xs min-w-0">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs gap-1">
            <span className="truncate">오답노트 복습률</span>
            <Brain className="w-4 h-4 text-violet-500 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 sm:mt-2 font-mono tabular-nums truncate">
            87<span className="text-xs font-normal text-slate-500">%</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 truncate">
            <span>동일 오류 재발률 1.2%</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Weekly Solving Activity & Error Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Solving Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  주간 과제 해결 및 디버깅 추이
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  이번 주 총 51개의 테스트 케이스를 성공적으로 통과했습니다.
                </p>
              </div>
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-2 py-1 rounded-md">
                주간 누적 51건
              </span>
            </div>

            {/* Custom Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-1.5 sm:gap-3 pt-6 pb-2 px-1 sm:px-2 border-b border-slate-100 dark:border-slate-800">
              {weeklyData.map(item => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group min-w-0">
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}건
                  </span>
                  <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-t-lg h-32 flex items-end p-0.5 sm:p-1">
                    <div
                      style={{ height: item.height }}
                      className="w-full bg-indigo-600 dark:bg-indigo-500 rounded-t-sm transition-all duration-500 group-hover:bg-indigo-400"
                    />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Type Distribution */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Bug className="w-4 h-4 text-rose-500 shrink-0" />
              <span>자주 발생하는 오류 유형 분석</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              내 코드에서 가장 빈번하게 발생하는 취약점 패턴입니다.
            </p>

            <div className="space-y-3">
              {errorCategories.map(cat => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{cat.name}</span>
                    <span className="text-slate-500 font-mono tabular-nums shrink-0">
                      {cat.count}회 ({cat.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${cat.percent}%` }}
                      className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: CS Competency Assessment & Recent Sessions */}
        <div className="space-y-6">
          {/* CS Competencies */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              CS 전공 역량 진단
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              디버깅 패턴 기반의 5개 전공 영역 숙련도
            </p>

            <div className="space-y-3.5">
              {competencies.map(comp => (
                <div key={comp.name} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{comp.name}</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold tabular-nums">
                      {comp.score}점
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1.5">
                    <div
                      style={{ width: `${comp.score}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{comp.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access to Recent Sessions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-500" />
              최근 디버깅 세션
            </h3>
            {history.length > 0 ? (
              <div className="space-y-2">
                {history.slice(0, 4).map(item => (
                  <button
                    key={item.id}
                    onClick={() => onSelectHistoryItem(item)}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/50 dark:bg-slate-800/30 transition-colors group flex items-center justify-between"
                  >
                    <div className="truncate mr-2">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                        {item.errorTitle}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.language.toUpperCase()} · {item.errorType}
                      </span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
                아직 저장된 디버깅 기록이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
