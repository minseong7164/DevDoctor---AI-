import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { analyzeCodeOffline, simulateCodeExecution } from './src/utils/debugger-engine';
import { Challenge, SupportedLanguage, TestCase } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with required httpOptions header
let aiClient: GoogleGenAI | null = null;
const envApiKey = process.env.GEMINI_API_KEY;
if (envApiKey && envApiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: envApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with provided key, using offline fallback', err);
  }
}

// Preset Coding Challenges
const PRESET_CHALLENGES: Challenge[] = [
  {
    id: 'ch-1',
    title: '[자료구조] 연결 리스트의 순환 참조 탐색 버그 수정',
    difficulty: 'Medium',
    language: 'python',
    category: '자료구조 & 포인터',
    points: 150,
    solvedCount: 1420,
    description: '단방향 연결 리스트에서 Cycle(순환 루프)이 존재하는지 판별하는 Floyd의 토끼와 거북이 알고리즘을 구현하던 중 fast 포인터의 None 참조 에러가 발생합니다. 안전하게 순환 여부를 boolean으로 반환하도록 수정하세요.',
    buggyCode: `def has_cycle(head):\n    slow = head\n    fast = head\n    # 버그: fast.next가 None일 때 fast.next.next를 참조하여 AttributeError 발생\n    while fast:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast:\n            return True\n    return False`,
    errorLog: `AttributeError: 'NoneType' object has no attribute 'next' at line 6`,
    hint: 'while 조건문에 fast 뿐만 아니라 fast.next가 존재하는지도 반드시 함께 검사해야 합니다.',
    testCases: [
      { id: 't1', name: '순환이 있는 리스트 (1->2->3->2)', input: 'head = [1, 2, 3, 2(cycle)]', expectedOutput: 'True' },
      { id: 't2', name: '순환이 없는 단일 리스트 (1->2->3->None)', input: 'head = [1, 2, 3]', expectedOutput: 'False' },
      { id: 't3', name: '빈 리스트 (None)', input: 'head = None', expectedOutput: 'False' },
    ],
  },
  {
    id: 'ch-2',
    title: '[알고리즘] 동적 계획법(DP) 피보나치 메모이제이션 누수 해결',
    difficulty: 'Easy',
    language: 'python',
    category: '다이나믹 프로그래밍',
    points: 80,
    solvedCount: 2310,
    description: '대량의 N(N=100)을 계산할 때 기존 재귀 함수는 시간 복잡도가 O(2^N)에 달하여 시간 초과(Time Limit Exceeded)가 발생합니다. 메모이제이션(Memoization) 테이블을 적용하여 O(N)으로 최적화하세요.',
    buggyCode: `def fib(n):\n    # 버그: 메모이제이션 없이 단순 재귀 호출로 연산 중복 발생\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)`,
    errorLog: `TimeLimitExceeded: Execution took > 5000ms for N=40`,
    hint: 'memo 딕셔너리나 리스트를 파라미터로 넘겨 이미 계산된 n의 값을 즉시 반환(O(1))하도록 만드세요.',
    testCases: [
      { id: 't1', name: '기본 N=10', input: 'n = 10', expectedOutput: '55' },
      { id: 't2', name: '대규모 N=50', input: 'n = 50', expectedOutput: '12586269025' },
    ],
  },
  {
    id: 'ch-3',
    title: '[시스템] C++ 이중 해제(Double Free) 메모리 손상 패치',
    difficulty: 'Hard',
    language: 'cpp',
    category: '시스템 프로그래밍',
    points: 250,
    solvedCount: 680,
    description: '동적 할당된 배열 버퍼를 복사 생성자에서 얕은 복사(Shallow Copy)하여 객체 소멸 시 동일한 힙 주소를 두 번 해제하는 SIGSEGV/Double Free 크래시가 발생합니다. 깊은 복사(Deep Copy)를 적용하거나 스마트 포인터 패턴으로 변경하세요.',
    buggyCode: `class IntBuffer {\npublic:\n    int* data;\n    int size;\n    IntBuffer(int s) : size(s), data(new int[s]) {}\n    // 버그: 복사 생성자 미정의로 기본 얕은 복사 수행됨\n    ~IntBuffer() { delete[] data; }\n};`,
    errorLog: `free(): double free detected in tcache 2 / SIGSEGV`,
    hint: '복사 생성자에서 새 메모리를 new int[s]로 별도 할당하고 std::copy로 내용을 복제하세요.',
    testCases: [
      { id: 't1', name: '단일 인스턴스 생성 및 소멸', input: 'IntBuffer a(10);', expectedOutput: '0 (정상 종료)' },
      { id: 't2', name: '복사 생성 후 순차 소멸 (Double Free 방지)', input: 'IntBuffer a(10); IntBuffer b = a;', expectedOutput: '0 (정상 종료)' },
    ],
  },
];

// API: AI Code Debugging & Deep Review
app.post('/api/debug-analyze', async (req, res) => {
  const { language, code, errorLog, assignmentContext } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({ error: '코드를 입력해주세요.' });
  }

  const selectedLang = (language || 'python') as SupportedLanguage;
  const inputError = (errorLog || '').trim();

  // If Gemini API is available, try generating rich AI response
  if (aiClient) {
    try {
      const prompt = `당신은 전공 코딩 과제 및 소프트웨어 공학 수석 교수이자 엘리트 코드 리뷰어 "DevDoctor"입니다.
학생이 작성한 아래 코드와 에러 로그를 분석하여, 학생들이 직관적으로 이해하고 성장할 수 있도록 입체적인 진단 보고서를 JSON 형태로 작성하세요.

[프로그래밍 언어]: ${selectedLang}
[과제/프로젝트 배경]: ${assignmentContext || '일반 전공 실습 과제'}
[에러 로그]:
${inputError || '명시적 에러 로그 없음 (런타임 오동작 또는 로직 결함)'}

[학생 코드]:
${code}

다음 JSON 구조에 맞춰 한국어로 자세하고 정중하게 답변해주세요:
{
  "errorTitle": "간결하고 명확한 오류 요약 (예: 인덱스 경계값 초과 오류)",
  "errorType": "기술적 오류 분류 (예: IndexError / OutOfBounds)",
  "errorLocation": "문제가 발생한 코드 라인 번호 및 구문",
  "rootCause": "이 오류가 왜 발생했는지에 대한 명확하고 친절한 원인 설명 (단순 지적이 아니라 메모리/로직 관점 설명)",
  "fixedCode": "완벽하게 수정된 전체 소스 코드 (주석 포함, 복사해서 바로 실행 가능해야 함)",
  "diffSummary": "어떤 부분이 수정되었는지 1~2줄 요약",
  "conceptExplanation": "해당 오류와 관련된 컴퓨터공학(CS) 전공 핵심 개념 설명 (자료구조, 메모리 모델, 스택 프레임, 비동기 큐, 시간/공간 복잡도 등)",
  "complexity": {
    "timeOld": "기존 시간 복잡도 (예: O(N^2))",
    "timeNew": "수정 후 시간 복잡도 (예: O(N log N))",
    "spaceOld": "기존 공간 복잡도",
    "spaceNew": "수정 후 공간 복잡도",
    "details": "복잡도 변화에 대한 간단한 코멘트"
  },
  "performanceTips": [
    "실무/코딩테스트에서 동일한 실수를 방지하기 위한 핵심 팁 1",
    "성능 및 코드 가독성을 높이는 Best Practice 팁 2",
    "방어적 프로그래밍(Defensive Programming) 관련 팁 3"
  ],
  "simulationTestCases": [
    {
      "id": "tc-1",
      "name": "기본 정상 입력 테스트",
      "input": "샘플 입력값",
      "expectedOutput": "기대 출력값",
      "passed": true
    },
    {
      "id": "tc-2",
      "name": "경계값(Boundary) 테스트 (0, 빈 배열 등)",
      "input": "경계 입력값",
      "expectedOutput": "기대 출력값",
      "passed": true
    }
  ]
}
응답은 반드시 유효한 JSON 형식이어야 합니다. 마크다운 백틱(\`\`\`json) 없이 순수 JSON만 반환하세요.`;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timed out')), 5000)
      );

      const generatePromise = aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const response: any = await Promise.race([generatePromise, timeoutPromise]);

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText.trim());

      const result = {
        id: `analysis_${Date.now()}`,
        timestamp: Date.now(),
        language: selectedLang,
        originalCode: code,
        errorLog: inputError,
        ...parsed,
      };

      return res.json(result);
    } catch (aiErr) {
      console.warn('Gemini API call failed, falling back to expert offline engine:', aiErr);
    }
  }

  // Resilient offline fallback analyzer
  const offlineResult = analyzeCodeOffline(selectedLang, code, inputError);
  return res.json(offlineResult);
});

// API: Run Code Simulation
app.post('/api/simulate-run', (req, res) => {
  const { code, testCases, isFixed } = req.body;
  const result = simulateCodeExecution(code || '', testCases || [], !!isFixed);
  res.json(result);
});

// API: Challenges
app.get('/api/challenges', (req, res) => {
  res.json(PRESET_CHALLENGES);
});

app.post('/api/challenges/submit', (req, res) => {
  const { challengeId, code } = req.body;
  const challenge = PRESET_CHALLENGES.find(c => c.id === challengeId);
  if (!challenge) {
    return res.status(404).json({ error: '해당 챌린지를 찾을 수 없습니다.' });
  }

  const simulation = simulateCodeExecution(code || '', challenge.testCases, true);
  const earnedPoints = simulation.allPassed ? challenge.points : Math.round(challenge.points * 0.2);

  res.json({
    passed: simulation.allPassed,
    earnedPoints,
    simulation,
    message: simulation.allPassed
      ? `축하합니다! 모든 테스트 케이스를 통과하여 ${earnedPoints}P를 획득했습니다!`
      : '일부 테스트 케이스에서 실패했습니다. 힌트를 확인해 보세요.',
  });
});

// API: Premium Checkout Simulation
app.post('/api/checkout', (req, res) => {
  const { courseId, paymentMethod, userEmail } = req.body;
  const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  res.json({
    success: true,
    orderId,
    courseId,
    paymentMethod,
    userEmail,
    paidAt: new Date().toISOString(),
    receiptUrl: `https://devdoctor.study/receipts/${orderId}`,
    message: '결제가 성공적으로 완료되었습니다! 즉시 강의 및 프리미엄 디버깅 팩이 활성화되었습니다.',
  });
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`DevDoctor server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
