import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  BookOpen,
  Award,
  ArrowRight,
  Receipt,
  Lock,
  X,
} from 'lucide-react';
import { PremiumCourse, UserProfile } from '../types';
import { storage } from '../utils/storage';

interface StoreViewProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const StoreView: React.FC<StoreViewProps> = ({ user, onUpdateUser }) => {
  const courses: PremiumCourse[] = [
    {
      id: 'course-algo-master',
      title: 'CS 전공 핵심 알고리즘 & 자료구조 집중 디버깅 마스터팩',
      subtitle: '시간/공간 복잡도 O(N) 최적화 및 시험/과제 단골 버그 150제 AI 심층 해설',
      instructor: '전 카카오 테크리드 & 알고리즘 연구원',
      originalPrice: 79000,
      discountPrice: 39000,
      badge: '베스트셀러',
      rating: 4.9,
      reviewCount: 428,
      highlights: [
        '트리, 그래프, DP 빈출 런타임 에러 100% 완전 정복',
        'AI 디버거 무제한 토큰 및 1:1 리팩토링 검증 패키지 포함',
        '학기말 시험 대비 오답노트 PDF 및 가상 샌드박스 실습 환경 제공',
      ],
      syllabusCount: 32,
    },
    {
      id: 'course-codingtest-trap',
      title: '대기업 코딩 테스트 단골 함정 100제 & 반례 생성 AI 팩',
      subtitle: '99%의 지원자가 놓치는 Corner Case와 메모리 한도 초과(MLE) 완벽 탈출',
      instructor: '삼성전자 SW 역량평가 만점 멘토',
      originalPrice: 99000,
      discountPrice: 49000,
      badge: '추천 코스',
      rating: 4.95,
      reviewCount: 612,
      highlights: [
        '테스트 케이스 히든 반례(Edge Case) 자동 생성기 제공',
        '시간 복잡도 O(N log N) 이하 최적화 패턴 집중 훈련',
        '실전 모의고사 10회분 및 자동 채점 시스템 연동',
      ],
      syllabusCount: 28,
    },
    {
      id: 'course-system-c',
      title: '시스템 프로그래밍 & C/C++ 메모리 최적화 심화 과정',
      subtitle: 'Segfault, Buffer Overflow, Double Free, 메모리 릭 Valgrind 완벽 디버깅',
      instructor: '시스템 소프트웨어 연구소 수석',
      originalPrice: 120000,
      discountPrice: 59000,
      badge: '전공 필수',
      rating: 4.88,
      reviewCount: 290,
      highlights: [
        '가상 메모리 모델, 스택 프레임, 포인터 연산 심층 시각화',
        '동적 할당 객체 생명주기 관리 및 RAII 패턴 실습',
        'OS 커널 및 멀티스레드 Race Condition 방어 기법',
      ],
      syllabusCount: 24,
    },
  ];

  // Checkout Modal State
  const [selectedCourse, setSelectedCourse] = useState<PremiumCourse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'toss' | 'kakaopay' | 'naverpay' | 'card'>('toss');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{
    orderId: string;
    courseTitle: string;
    paidAmount: number;
    paymentMethod: string;
    paidAt: string;
  } | null>(null);

  const handleOpenCheckout = (course: PremiumCourse) => {
    setSelectedCourse(course);
    setReceipt(null);
  };

  const handleProcessPayment = async () => {
    if (!selectedCourse) return;
    setIsProcessing(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          paymentMethod,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      // Update user purchased courses
      const updatedUser: UserProfile = {
        ...user,
        isPremium: true,
        purchasedCourses: Array.from(new Set([...user.purchasedCourses, selectedCourse.id])),
      };
      onUpdateUser(updatedUser);
      storage.saveUser(updatedUser);

      setReceipt({
        orderId: data.orderId,
        courseTitle: selectedCourse.title,
        paidAmount: selectedCourse.discountPrice,
        paymentMethod:
          paymentMethod === 'toss'
            ? '토스페이 (Toss)'
            : paymentMethod === 'kakaopay'
            ? '카카오페이'
            : paymentMethod === 'naverpay'
            ? '네이버페이'
            : '신용/체크카드',
        paidAt: new Date().toLocaleString(),
      });
    } catch (err) {
      console.error(err);
      alert('결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              프리미엄 학습 패키지 &amp; 전공 심화 디버깅 팩
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              토스페이, 카카오페이, 네이버페이, 신용카드로 간편 결제 후 즉시 무제한 AI 디버깅과 전공 마스터 강의를 수강하세요.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-lg shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>안전 결제 &amp; 즉시 활성화 보장</span>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0 max-w-full">
        {courses.map(course => {
          const isPurchased = user.purchasedCourses.includes(course.id);

          return (
            <div
              key={course.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-colors relative"
            >
              <div>
                {/* Badge & Rating */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                    {course.badge}
                  </span>
                  <span className="text-amber-500 font-bold">★ {course.rating} ({course.reviewCount})</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {course.subtitle}
                </p>

                {/* Highlights */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {course.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xs line-through text-slate-400 font-mono">
                    ₩{course.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                    ₩{course.discountPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-rose-500 font-mono">
                    {Math.round(((course.originalPrice - course.discountPrice) / course.originalPrice) * 100)}% OFF
                  </span>
                </div>

                {isPurchased ? (
                  <button
                    disabled
                    className="w-full py-2.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>이미 보유 중인 패키지 (학습 중)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenCheckout(course)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>수강신청 및 패키지 구매</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {receipt ? '결제 완료 영수증' : '보안 간편 결제'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                aria-label="닫기"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If Receipt Ready */}
            {receipt ? (
              <div className="space-y-4 text-xs">
                <div className="text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    결제가 성공적으로 완료되었습니다!
                  </h4>
                  <p className="text-slate-500 mt-1">즉시 마이페이지 및 AI 디버거에서 이용 가능합니다.</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">주문 번호:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{receipt.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">상품명:</span>
                    <span className="truncate max-w-[180px] font-bold text-slate-800 dark:text-slate-200">{receipt.courseTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">결제 수단:</span>
                    <span className="text-slate-800 dark:text-slate-200">{receipt.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 text-sm">
                    <span className="text-slate-500">결제 금액:</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">₩{receipt.paidAmount.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCourse(null)}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-colors"
                >
                  확인 및 학습 시작하기
                </button>
              </div>
            ) : (
              /* Payment Form */
              <div className="space-y-4 text-xs">
                {/* Order Summary */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[11px] text-slate-500">주문 상품</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedCourse.title}</div>
                  <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                    ₩{selectedCourse.discountPrice.toLocaleString()}
                  </div>
                </div>

                {/* Payment Gateway Selector */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    결제 수단 선택
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('toss')}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                        paymentMethod === 'toss'
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span>토스페이 (Toss)</span>
                      {paymentMethod === 'toss' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('kakaopay')}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                        paymentMethod === 'kakaopay'
                          ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span>카카오페이</span>
                      {paymentMethod === 'kakaopay' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('naverpay')}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                        paymentMethod === 'naverpay'
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span>네이버페이</span>
                      {paymentMethod === 'naverpay' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                        paymentMethod === 'card'
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span>신용/체크카드</span>
                      {paymentMethod === 'card' && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                    </button>
                  </div>
                </div>

                {/* Email Confirmation */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    영수증 수신 이메일
                  </label>
                  <input
                    type="email"
                    readOnly
                    value={user.email}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-600 dark:text-slate-400 font-mono"
                  />
                </div>

                {/* Pay Button */}
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isProcessing
                      ? '결제 승인 중...'
                      : `₩${selectedCourse.discountPrice.toLocaleString()}원 결제하기`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
