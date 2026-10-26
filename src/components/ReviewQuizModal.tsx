import React, { useState } from 'react';
import { Award, CheckCircle2, HelpCircle, X, XCircle, Zap } from 'lucide-react';
import { ReviewQuizQuestion, UserProfile } from '../types';
import { calculateTier, generateReviewQuiz } from '../utils/debugger-engine';
import { storage } from '../utils/storage';

interface ReviewQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const ReviewQuizModal: React.FC<ReviewQuizModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  if (!isOpen) return null;

  const [questions] = useState<ReviewQuizQuestion[]>(() => generateReviewQuiz([]));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
      // Award points
      const earned = (score + (selectedOption === currentQ.correctIndex ? 0 : 0)) * 50;
      if (earned > 0) {
        const newPoints = user.points + earned;
        const { tier } = calculateTier(newPoints);
        const updated = {
          ...user,
          points: newPoints,
          tier,
        };
        onUpdateUser(updated);
        storage.saveUser(updated);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              오답노트 기반 3분 복습 퀴즈
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isCompleted ? (
          /* Completion Screen */
          <div className="text-center py-6 space-y-4 text-xs">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold">
              🎉
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              복습 퀴즈를 모두 완료했습니다!
            </h4>
            <p className="text-slate-500">
              총 {questions.length}문제 중 <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">{score}</strong>문제를 맞추어 <strong>+{score * 50}P</strong>를 획득했습니다!
            </p>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors cursor-pointer"
            >
              확인 및 대시보드로 돌아가기
            </button>
          </div>
        ) : (
          /* Question View */
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
              <span>문제 {currentIndex + 1} / {questions.length}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">+{50}P</span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
              {currentQ.question}
            </h4>

            {/* Options */}
            <div className="space-y-2 pt-1">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let btnStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400';
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-bold';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`w-full p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-5 text-center font-mono font-bold shrink-0 text-slate-400">
                      {idx + 1}.
                    </span>
                    <span className="flex-1 leading-relaxed">{opt}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation when answered */}
            {isAnswered && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 space-y-1">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block">해설:</span>
                <p className="leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {/* Next Button */}
            {isAnswered && (
              <button
                onClick={handleNext}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors cursor-pointer"
              >
                {currentIndex < questions.length - 1 ? '다음 문제' : '퀴즈 결과 확인'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
