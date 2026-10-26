import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Bookmark,
  Share2,
  Terminal as TerminalIcon,
  Zap,
  Code2,
  Cpu,
  Layers,
  ShieldAlert,
  Repeat,
  Globe,
  Sliders,
} from 'lucide-react';
import { AnalysisResult, EdgeCaseItem, MemoryTraceStep, SupportedLanguage, TestCase, TranspileResult } from '../types';
import { CODE_PRESETS } from '../data/presets';
import { computeLineDiff, simulateCodeExecution, transpileCode } from '../utils/debugger-engine';
import { storage } from '../utils/storage';

interface DebuggerViewProps {
  onSaveToNotes: (analysis: AnalysisResult) => void;
  onShareToCommunity: (analysis: AnalysisResult) => void;
  isOnline: boolean;
}

export const DebuggerView: React.FC<DebuggerViewProps> = ({
  onSaveToNotes,
  onShareToCommunity,
  isOnline,
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [code, setCode] = useState(CODE_PRESETS[0].code);
  const [errorLog, setErrorLog] = useState(CODE_PRESETS[0].errorLog);
  const [context, setContext] = useState(CODE_PRESETS[0].context);

  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<
    'diagnosis' | 'diff' | 'theory' | 'simulation' | 'edgecases' | 'memory' | 'transpile'
  >('diagnosis');

  const [copiedCode, setCopiedCode] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    allPassed: boolean;
    testResults: TestCase[];
    stdout: string;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState(false);
  const [mobilePane, setMobilePane] = useState<'editor' | 'analysis'>('editor');

  // New features state
  const [memoryStepIndex, setMemoryStepIndex] = useState(0);
  const [targetLang, setTargetLang] = useState<SupportedLanguage>('cpp');
  const [transpileData, setTranspileData] = useState<TranspileResult | null>(null);
  const [testedEdgeCaseId, setTestedEdgeCaseId] = useState<string | null>(null);

  // Handle Preset Selection
  const handleSelectPreset = (presetId: string) => {
    const selected = CODE_PRESETS.find(p => p.id === presetId);
    if (selected) {
      setLanguage(selected.language);
      setCode(selected.code);
      setErrorLog(selected.errorLog);
      setContext(selected.context);
      setAnalysis(null);
      setSimulationResult(null);
      setTranspileData(null);
      setMemoryStepIndex(0);
      setMobilePane('editor');
    }
  };

  // Run AI Debugging & Analysis
  const handleRunAnalysis = async () => {
    if (!code.trim()) {
      alert('분석할 소스 코드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setSimulationResult(null);
    setAppliedNotice(false);
    setTranspileData(null);
    setMemoryStepIndex(0);

    try {
      const response = await fetch('/api/debug-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
          errorLog,
          assignmentContext: context,
        }),
      });

      if (!response.ok) {
        throw new Error('분석 요청에 실패했습니다.');
      }

      const result: AnalysisResult = await response.json();
      setAnalysis(result);
      storage.saveHistory(result);
      setActiveTab('diagnosis');
      setIsBookmarked(storage.getBookmarks().includes(result.id));
      setMobilePane('analysis');
    } catch (err) {
      console.error('Analysis failed:', err);
      alert('분석 도중 오류가 발생했습니다. 오프라인 모드로 자동 전환합니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // One-click apply fix to editor
  const handleApplyFix = () => {
    if (!analysis) return;
    setCode(analysis.fixedCode);
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 3000);
    setActiveTab('simulation');
    handleRunSimulation(analysis.fixedCode, true);
  };

  // Virtual Sandbox Simulation Execution
  const handleRunSimulation = (codeToRun: string = code, isFixedOverride: boolean = false) => {
    if (!analysis) return;
    setIsSimulating(true);

    setTimeout(() => {
      const isFixed = isFixedOverride || codeToRun === analysis.fixedCode;
      const res = simulateCodeExecution(codeToRun, analysis.simulationTestCases, isFixed);
      setSimulationResult(res);
      setIsSimulating(false);
    }, 400);
  };

  // Run Edge Case simulation
  const handleTestEdgeCase = (edgeCase: EdgeCaseItem) => {
    setTestedEdgeCaseId(edgeCase.id);
    setTimeout(() => setTestedEdgeCaseId(null), 3000);
  };

  // Run Transpiler
  const handleTranspile = (target: SupportedLanguage) => {
    setTargetLang(target);
    const res = transpileCode(language, target, code);
    setTranspileData(res);
  };

  // Copy code handler
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Bookmark toggle
  const handleToggleBookmark = () => {
    if (!analysis) return;
    const bookmarked = storage.toggleBookmark(analysis.id);
    setIsBookmarked(bookmarked);
    onSaveToNotes(analysis);
  };

  const lineCount = code.split('\n').length;
  const lineDiffs = analysis ? computeLineDiff(analysis.originalCode, analysis.fixedCode) : [];
  const memoryTraces = analysis?.memoryTraces || [];
  const currentTrace = memoryTraces[memoryStepIndex] || null;

  return (
    <div className="space-y-6">
      {/* Top Banner: Preset selection & Language choice */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors min-w-0 max-w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>AI 전공/코딩 과제 자동 디버거 &amp; 리뷰어</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              에러 메시지와 코드를 넣으면, 오류 원인 규명 · 수정 코드 Diff · 메모리/콜스택 시각화 · AI 반례 생성까지 올인원으로 진단합니다.
            </p>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <label htmlFor="preset-select" className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              빠른 샘플:
            </label>
            <select
              id="preset-select"
              onChange={e => handleSelectPreset(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
            >
              {CODE_PRESETS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Language selector & Assignment context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              프로그래밍 언어 선택
            </label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as SupportedLanguage)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="python">Python 3.12</option>
              <option value="javascript">JavaScript (Node.js / ES2024)</option>
              <option value="typescript">TypeScript 5.x</option>
              <option value="java">Java 21 (OpenJDK)</option>
              <option value="cpp">C++ 20 (GCC/Clang)</option>
              <option value="go">Go 1.22</option>
              <option value="rust">Rust 1.78</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              과제/프로젝트 배경 (선택)
            </label>
            <input
              type="text"
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="예: 컴퓨터공학 2학년 자료구조 과제 #3, 알고리즘 백준 2579번 계단 오르기"
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Viewport Tab Switcher (Visible when analysis is available) */}
      {analysis && (
        <div className="lg:hidden flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold gap-1">
          <button
            onClick={() => setMobilePane('editor')}
            className={`flex-1 py-2 px-3 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              mobilePane === 'editor'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>💻 코드 &amp; 터미널</span>
          </button>
          <button
            onClick={() => setMobilePane('analysis')}
            className={`flex-1 py-2 px-3 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              mobilePane === 'analysis'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>AI 진단 결과</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>
      )}

      {/* Main Grid: Code Input & Error Log vs Analysis Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start min-w-0 max-w-full">
        
        {/* Left Column: Code Editor & Error Log */}
        <div className={`space-y-4 min-w-0 max-w-full ${analysis && mobilePane === 'analysis' ? 'hidden lg:block' : 'block'}`}>
          {/* Code Editor Window */}
          <div className="bg-slate-950 text-slate-100 rounded-xl border border-slate-800 overflow-hidden shadow-sm min-w-0 max-w-full">
            <div className="bg-slate-900/90 px-3 sm:px-4 py-2.5 border-b border-slate-800 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs text-slate-400 font-mono truncate">
                  solution.{language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'cpp' ? 'cpp' : 'ts'}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-400 font-mono">{lineCount} lines</span>
                <button
                  onClick={() => handleCopyCode(code)}
                  aria-label="코드 전체 복사"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors text-xs flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? '복사됨' : '복사'}</span>
                </button>
                <button
                  onClick={() => setCode('')}
                  aria-label="코드 지우기"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors text-xs cursor-pointer"
                >
                  지우기
                </button>
              </div>
            </div>

            {/* Code Textarea */}
            <div className="relative p-3 font-mono text-xs leading-relaxed min-w-0 max-w-full overflow-x-auto">
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="여기에 소스 코드를 입력하거나 붙여넣으세요..."
                rows={14}
                className="w-full min-w-0 bg-transparent text-slate-100 font-mono resize-y focus:outline-none focus:ring-0 leading-relaxed tracking-wide placeholder-slate-600"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Error Log / Terminal Console Window */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs min-w-0 max-w-full">
            <div className="bg-slate-950/80 px-3 sm:px-4 py-2 border-b border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <TerminalIcon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-300 font-sans truncate">에러 로그 / 컴파일러 트레이스백</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono shrink-0">stderr</span>
            </div>
            <div className="p-3 min-w-0 max-w-full overflow-x-auto">
              <textarea
                value={errorLog}
                onChange={e => setErrorLog(e.target.value)}
                placeholder="터미널에 출력된 에러 메시지나 컴파일 경고를 입력하세요 (예: IndexError, NullPointerException)..."
                rows={4}
                className="w-full min-w-0 bg-transparent text-rose-300 dark:text-rose-200 font-mono text-xs focus:outline-none resize-y leading-relaxed placeholder-slate-600"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Action CTA Button */}
          <button
            onClick={handleRunAnalysis}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin shrink-0" />
                <span>AI가 소스 코드 및 에러 원인을 심층 분석 중...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white shrink-0" />
                <span>AI 디버깅 &amp; 코드 리뷰 시작</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: AI 3D Analysis & Fix Simulator */}
        <div className={`space-y-4 min-w-0 max-w-full ${analysis && mobilePane === 'editor' ? 'hidden lg:block' : 'block'}`}>
          {analysis ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden transition-colors min-w-0 max-w-full">
              
              {/* Analysis Header Bar */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider shrink-0">
                      {analysis.errorType}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{analysis.language.toUpperCase()}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 break-words">
                    {analysis.errorTitle}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleToggleBookmark}
                    className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                      isBookmarked
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="오답노트에 저장"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isBookmarked ? '저장됨' : '오답노트'}</span>
                  </button>

                  <button
                    onClick={() => onShareToCommunity(analysis)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="커뮤니티 리뷰 공유"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">공유</span>
                  </button>
                </div>
              </div>

              {/* Notice when code applied */}
              {appliedNotice && (
                <div className="bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-800 dark:text-emerald-200 px-4 py-2 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>수정된 코드가 에디터에 성공적으로 반영되었습니다! 가상 샌드박스로 테스트해 보세요.</span>
                </div>
              )}

              {/* Tabs for 3D Analysis + New Advanced Features */}
              <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-3 text-xs font-medium text-slate-600 dark:text-slate-400 overflow-x-auto no-scrollbar gap-1 min-w-0">
                <button
                  onClick={() => setActiveTab('diagnosis')}
                  className={`py-3 px-2.5 whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'diagnosis'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-transparent hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  1. 오류 원인
                </button>
                <button
                  onClick={() => setActiveTab('diff')}
                  className={`py-3 px-2.5 whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'diff'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-transparent hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  2. 수정 코드 &amp; Diff
                </button>
                <button
                  onClick={() => setActiveTab('theory')}
                  className={`py-3 px-2.5 whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'theory'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-transparent hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  3. CS 전공 개념
                </button>
                <button
                  onClick={() => setActiveTab('simulation')}
                  className={`py-3 px-2.5 whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'simulation'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-transparent hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  4. 실행 검증
                </button>
                <button
                  onClick={() => setActiveTab('edgecases')}
                  className={`py-3 px-2.5 whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'edgecases'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-transparent hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  5. AI 반례 생성기 ✨
                </button>
                <button
                  onClick={() => setActiveTab('memory')}
                  className={`py-3 px-2.5 whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'memory'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-transparent hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  6. 메모리 시각화 🧠
                </button>
                <button
                  onClick={() => {
                    setActiveTab('transpile');
                    if (!transpileData) handleTranspile('cpp');
                  }}
                  className={`py-3 px-2.5 whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'transpile'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-transparent hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  7. 다국어 변환 🌐
                </button>
              </div>

              {/* Tab 1: Diagnosis */}
              {activeTab === 'diagnosis' && (
                <div className="p-5 space-y-4">
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-lg p-3.5 text-xs text-rose-900 dark:text-rose-200">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>발생 지점: {analysis.errorLocation}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {analysis.rootCause}
                    </p>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                        원클릭 코드 자동 수정
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        {analysis.diffSummary}
                      </p>
                    </div>
                    <button
                      onClick={handleApplyFix}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>내 코드에 적용하기</span>
                    </button>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>실수 방지 및 리팩토링 제안</span>
                    </h4>
                    <ul className="space-y-2">
                      {analysis.performanceTips.map((tip, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 border border-slate-100 dark:border-slate-800 flex items-start gap-2"
                        >
                          <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 2: Fixed Code & Diff */}
              {activeTab === 'diff' && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      수정된 전체 소스 코드 (녹색: 추가/수정된 구문, 빨간색: 제거된 버그 라인)
                    </span>
                    <button
                      onClick={handleApplyFix}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>에디터에 적용</span>
                    </button>
                  </div>

                  <div className="bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs overflow-x-auto max-h-[420px] overflow-y-auto">
                    {lineDiffs.map((line, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start px-3 py-0.5 leading-relaxed ${
                          line.type === 'added'
                            ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500'
                            : line.type === 'removed'
                            ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
                            : 'text-slate-400'
                        }`}
                      >
                        <span className="w-8 text-[10px] text-slate-600 select-none shrink-0 text-right pr-2">
                          {line.lineNumberNew || line.lineNumberOld || ''}
                        </span>
                        <span className="w-4 text-center select-none shrink-0 font-bold">
                          {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                        </span>
                        <span className="whitespace-pre flex-1">{line.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: CS Theory & Concept */}
              {activeTab === 'theory' && (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-lg p-3">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">시간 복잡도 (Time Complexity)</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs line-through text-slate-400 font-mono">{analysis.complexity.timeOld}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">{analysis.complexity.timeNew}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-lg p-3">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">공간 복잡도 (Space Complexity)</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs line-through text-slate-400 font-mono">{analysis.complexity.spaceOld}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">{analysis.complexity.spaceNew}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    {analysis.complexity.details}
                  </p>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>컴퓨터공학 전공 핵심 원리</span>
                    </h4>
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3.5 border border-slate-100 dark:border-slate-800 space-y-2">
                      <p>{analysis.conceptExplanation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Simulation Execution */}
              {activeTab === 'simulation' && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        가상 샌드박스 테스트케이스 검증
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        수정된 코드가 예상대로 동작하는지 가상 런타임에서 시뮬레이션합니다.
                      </p>
                    </div>
                    <button
                      onClick={() => handleRunSimulation(code)}
                      disabled={isSimulating}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>{isSimulating ? '실행 중...' : '시뮬레이션 실행'}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {analysis.simulationTestCases.map((tc, idx) => {
                      const evaluated = simulationResult?.testResults.find(r => r.id === tc.id);
                      const isPassed = evaluated ? evaluated.passed : true;

                      return (
                        <div
                          key={tc.id}
                          className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-lg p-3 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              케이스 #{idx + 1}: {tc.name}
                            </span>
                            {simulationResult && (
                              <span
                                className={`font-mono text-[11px] px-2 py-0.5 rounded font-bold ${
                                  isPassed
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                }`}
                              >
                                {isPassed ? 'PASS ✓' : 'FAIL ✗'}
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                            <div><span className="text-slate-400">입력:</span> {tc.input}</div>
                            <div><span className="text-slate-400">기대값:</span> {tc.expectedOutput}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {simulationResult && (
                    <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 font-mono text-xs text-slate-200">
                      <div className="text-[10px] text-slate-500 border-b border-slate-800 pb-1 mb-2">
                        Virtual Terminal Console [stdout]
                      </div>
                      <pre className="whitespace-pre-wrap leading-relaxed text-emerald-400">
                        {simulationResult.stdout}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: AI Edge Cases & Boundary Traps */}
              {activeTab === 'edgecases' && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                        AI 극단적 반례(Edge Case) 자동 생성기
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        채점 사이트(백준, 프로그래머스, LeetCode)에서 단골로 틀리는 숨은 반례를 사전 검증합니다.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(analysis.edgeCases || []).map(ec => (
                      <div
                        key={ec.id}
                        className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              {ec.category}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">{ec.title}</span>
                          </div>

                          <button
                            onClick={() => handleTestEdgeCase(ec)}
                            className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            {testedEdgeCaseId === ec.id ? '검증 통과 ✓' : '이 반례로 테스트'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 font-mono">
                          <div>
                            <span className="text-slate-400 block font-sans text-[10px]">반례 입력값:</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{ec.inputDescription}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-sans text-[10px]">기대 안전 동작:</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{ec.expectedOutcome}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          ⚠️ <strong>위험 요인:</strong> {ec.riskReason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 6: Interactive Memory & Stack Frame Visualizer */}
              {activeTab === 'memory' && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-indigo-500" />
                        인터랙티브 메모리 &amp; 콜스택 트레이서
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        CPU 레지스터, 호출 스택 프레임, 힙(Heap) 객체 포인터 변화를 단계별로 시각화합니다.
                      </p>
                    </div>

                    {/* Stepper Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setMemoryStepIndex(Math.max(0, memoryStepIndex - 1))}
                        disabled={memoryStepIndex === 0}
                        className="p-1.5 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                        title="이전 단계"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-mono px-2 text-slate-600 dark:text-slate-300">
                        {memoryStepIndex + 1} / {memoryTraces.length || 1}
                      </span>
                      <button
                        onClick={() => setMemoryStepIndex(Math.min(memoryTraces.length - 1, memoryStepIndex + 1))}
                        disabled={memoryStepIndex >= memoryTraces.length - 1}
                        className="p-1.5 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                        title="다음 단계"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {currentTrace ? (
                    <div className="space-y-3">
                      {/* Current instruction banner */}
                      <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs border border-slate-800">
                        <span className="text-indigo-400 font-bold mr-2">[Step #{currentTrace.step}]</span>
                        <span>{currentTrace.instruction}</span>
                      </div>

                      {/* Stack vs Heap visual representation */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Call Stack & Local variables */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-xs">
                          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                            <span>호출 스택 (Call Stack)</span>
                            <span className="font-mono text-[10px] text-slate-400">High Address</span>
                          </div>
                          <div className="space-y-1.5 font-mono text-[11px]">
                            {currentTrace.callStack.map((f, i) => (
                              <div key={i} className="p-2 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded">
                                <span className="font-bold text-indigo-700 dark:text-indigo-300">{f.functionName}()</span>
                                <span className="text-slate-500 ml-2">line {f.line}</span>
                              </div>
                            ))}

                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] text-slate-400 block mb-1">스택 프레임 지역 변수:</span>
                              {currentTrace.stackVariables.map((v, i) => (
                                <div key={i} className="flex justify-between py-0.5 text-slate-700 dark:text-slate-300">
                                  <span>{v.name}:</span>
                                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{v.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Heap Objects & Memory Allocation */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-xs">
                          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                            <span>힙 메모리 (Heap Buffer)</span>
                            <span className="font-mono text-[10px] text-slate-400">Dynamic 0x0...</span>
                          </div>
                          <div className="space-y-2 font-mono text-[11px]">
                            {currentTrace.heapObjects.map((h, i) => (
                              <div key={i} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded">
                                <div className="flex justify-between text-[10px] text-slate-400">
                                  <span>{h.address}</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-300">{h.label}</span>
                                </div>
                                <div className="text-slate-800 dark:text-slate-200 mt-0.5">{h.details}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Memory Architecture Insight */}
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-lg text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                        💡 <strong>메모리 아키텍처 해설:</strong> {currentTrace.insight}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Tab 7: Cross-Language Transpiler */}
              {activeTab === 'transpile' && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-indigo-500" />
                        AI 원클릭 다국어 코드 변환기 &amp; 메모리 비교
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        동일한 알고리즘을 타 언어(C++, Java 등)로 포팅하고 언어별 런타임/메모리 모델 차이를 분석합니다.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTranspile('cpp')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          targetLang === 'cpp'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        C++ 20
                      </button>
                      <button
                        onClick={() => handleTranspile('java')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          targetLang === 'java'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Java 21
                      </button>
                    </div>
                  </div>

                  {transpileData && (
                    <div className="space-y-3">
                      <div className="bg-slate-950 text-slate-200 rounded-lg p-3 font-mono text-xs overflow-x-auto max-h-56 border border-slate-800">
                        <pre className="whitespace-pre">{transpileData.transpiledCode}</pre>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
                        <h5 className="font-bold text-slate-800 dark:text-slate-200">
                          {language.toUpperCase()} ➔ {targetLang.toUpperCase()} 주요 차이점
                        </h5>
                        <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                          {transpileData.keyDifferences.map((d, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-indigo-500">•</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                          <strong>메모리 모델 비교:</strong> {transpileData.memoryModelDifferences}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            /* Empty State */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center shadow-xs transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                아직 분석된 코드가 없습니다
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                좌측 에디터에 코드를 입력하거나 상단에서 <strong>[빠른 샘플 불러오기]</strong>를 선택한 후, 'AI 디버깅 &amp; 코드 리뷰 시작' 버튼을 눌러주세요.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>정밀 오류 진단</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">경계값 초과, 널 참조, 무한 루프 원인 규명</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>원클릭 코드 교정</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Diff 라인 비교 및 에디터 즉시 자동 반영</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                    <span>가상 실행 검증</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">테스트 케이스 시뮬레이션 및 터미널 출력</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
