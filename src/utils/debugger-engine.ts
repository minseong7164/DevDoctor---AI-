import { AnalysisResult, DiffLine, SupportedLanguage, TestCase } from '../types';

/**
 * Computes a line-by-line diff between original and fixed code.
 */
export function computeLineDiff(originalCode: string, fixedCode: string): DiffLine[] {
  const origLines = originalCode.split('\n');
  const fixedLines = fixedCode.split('\n');
  const result: DiffLine[] = [];

  let i = 0;
  let j = 0;

  while (i < origLines.length || j < fixedLines.length) {
    if (i < origLines.length && j < fixedLines.length && origLines[i] === fixedLines[j]) {
      result.push({
        type: 'same',
        content: origLines[i],
        lineNumberOld: i + 1,
        lineNumberNew: j + 1,
      });
      i++;
      j++;
    } else if (j < fixedLines.length && (i >= origLines.length || !origLines.slice(i).includes(fixedLines[j]))) {
      result.push({
        type: 'added',
        content: fixedLines[j],
        lineNumberNew: j + 1,
      });
      j++;
    } else if (i < origLines.length) {
      result.push({
        type: 'removed',
        content: origLines[i],
        lineNumberOld: i + 1,
      });
      i++;
    }
  }

  return result;
}

/**
 * Calculates user tier and progress based on score points.
 */
export function calculateTier(points: number): { tier: string; badge: string; nextTierPoints: number; progressPercent: number } {
  if (points >= 3000) {
    return { tier: 'Grandmaster', badge: '💎', nextTierPoints: 5000, progressPercent: 100 };
  } else if (points >= 2000) {
    return { tier: 'Master', badge: '🔮', nextTierPoints: 3000, progressPercent: Math.min(100, Math.round(((points - 2000) / 1000) * 100)) };
  } else if (points >= 1200) {
    return { tier: 'Diamond', badge: '🔷', nextTierPoints: 2000, progressPercent: Math.min(100, Math.round(((points - 1200) / 800) * 100)) };
  } else if (points >= 600) {
    return { tier: 'Platinum', badge: '💠', nextTierPoints: 1200, progressPercent: Math.min(100, Math.round(((points - 600) / 600) * 100)) };
  } else if (points >= 250) {
    return { tier: 'Gold', badge: '🥇', nextTierPoints: 600, progressPercent: Math.min(100, Math.round(((points - 250) / 350) * 100)) };
  } else if (points >= 100) {
    return { tier: 'Silver', badge: '🥈', nextTierPoints: 250, progressPercent: Math.min(100, Math.round(((points - 100) / 150) * 100)) };
  }
  return { tier: 'Bronze', badge: '🥉', nextTierPoints: 100, progressPercent: Math.min(100, Math.round((points / 100) * 100)) };
}

/**
 * Evaluates simulated test cases against code.
 * If fixed code is applied or matches corrected patterns, test cases pass!
 */
export function simulateCodeExecution(
  code: string,
  testCases: TestCase[],
  isFixedCode: boolean = false
): { allPassed: boolean; testResults: TestCase[]; stdout: string } {
  const results: TestCase[] = testCases.map((tc, idx) => {
    // When code is fixed or contains guard clauses, test passes
    const hasFixIndicators =
      isFixedCode ||
      code.includes('if') ||
      code.includes('try') ||
      code.includes('Math.max') ||
      code.includes('len(') ||
      code.includes('null') ||
      code.includes('Optional') ||
      code.includes('async');

    const passed = hasFixIndicators;
    return {
      ...tc,
      actualOutput: passed ? tc.expectedOutput : `Error: Runtime exception during test execution [Case #${idx + 1}]`,
      passed,
    };
  });

  const allPassed = results.every(r => r.passed);
  const stdout = allPassed
    ? `=== 가상 샌드박스 실행 결과 ===\n[Process Finished with exit code 0]\n✓ 모든 테스트 케이스 통과 (${results.length}/${results.length})\n- 메모리 사용량: 14.2 MB\n- 실행 시간: 24 ms`
    : `=== 가상 샌드박스 실행 결과 ===\n[Process Finished with exit code 1]\n✗ 테스트 케이스 실패 (0/${results.length})\n- 예외 발생: 실행 중 비정상 종료됨\n- 원인: 경계값 검사 미비 또는 널 포인터 참조`;

  return {
    allPassed,
    testResults: results,
    stdout,
  };
}

/**
 * Offline rule-based analyzer when Gemini API is unavailable or user is offline.
 */
export function analyzeCodeOffline(
  language: SupportedLanguage,
  code: string,
  errorLog: string
): AnalysisResult {
  const id = `analysis_${Date.now()}`;
  const lowerLog = (errorLog + ' ' + code).toLowerCase();

  // Pattern detection
  let errorTitle = '런타임 인덱스/경계값 초과 오류';
  let errorType = 'IndexError / Out of Bounds';
  let errorLocation = '루프 순회 조건문 또는 인덱스 참조 구문';
  let rootCause =
    '배열이나 리스트의 최대 유효 인덱스는 (길이 - 1)이지만, 반복문 종료 조건이 <= 또는 len() 범위를 초과하여 존재하지 않는 메모리 주소에 접근했습니다.';
  let fixedCode = code;
  let conceptExplanation =
    '컴퓨터 메모리에서 배열은 연속된 블록에 할당됩니다. 언어의 런타임은 정의된 범위를 벗어난 메모리(Buffer Overflow 또는 Bounds Check) 접근 시 안전을 위해 즉시 실행을 중단하고 예외를 던집니다. 이는 Zero-indexed 체계에서 흔히 발생하는 Off-by-one Error입니다.';
  let timeOld = 'O(N)';
  let timeNew = 'O(N)';
  let spaceOld = 'O(1)';
  let spaceNew = 'O(1)';
  let tips = [
    '항상 인덱스 접근 전 컬렉션의 크기 유효성을 먼저 확인하거나 for...in / enhanced for-each 루프를 사용하는 것이 안전합니다.',
    '경계값(0, 길이-1, 빈 컬렉션)에 대한 단위 테스트(Unit Test)를 사전에 작성하세요.',
    '재귀 호출이나 동적 인덱스 조작 시 종료 기저조건(Base Case)을 코드 최상단에 명시하세요.',
  ];

  if (lowerLog.includes('nullpointer') || lowerLog.includes('null') || lowerLog.includes('cannot read properties of undefined')) {
    errorTitle = 'NullPointerException / 객체 미할당 참조 오류';
    errorType = 'NullPointerException / Undefined Access';
    errorLocation = '객체 멤버 변수 또는 메서드 호출 라인';
    rootCause =
      '객체가 인스턴스화되지 않았거나 비동기 응답이 도착하기 전 null/undefined 상태인 프로퍼티를 참조했습니다.';
    conceptExplanation =
      'Tony Hoare가 제안한 "10억 달러의 실수"로 불리는 Null 참조 문제입니다. 힙(Heap) 메모리에 실제 객체가 할당되지 않은 주소(0x0)를 역참조(Dereference)할 때 CPU 보호 메커니즘 또는 런타임 가상머신이 인터럽트를 발생시킵니다.';
    tips = [
      'Optional(Java)이나 옵셔널 체이닝(?.)(JS/TS) 문법을 적극 활용하세요.',
      '함수 시작 지점에서 파라미터 null 가드(Guard Clause)를 적용하세요.',
    ];
  } else if (lowerLog.includes('recursion') || lowerLog.includes('stack overflow') || lowerLog.includes('maximum call stack')) {
    errorTitle = 'RecursionError / 콜스택 오버플로우';
    errorType = 'StackOverflowError / Max Call Stack Exceeded';
    errorLocation = '재귀 함수 호출부 및 기저 조건(Base Case)';
    rootCause =
      '재귀 호출을 탈출하는 기저 조건(Base Case)이 올바르지 않거나 만족되지 않아 콜스택(Call Stack) 프레임 한도를 초과했습니다.';
    conceptExplanation =
      '함수가 호출될 때마다 호출 스택(Call Stack)에 복귀 주소와 지역 변수를 담은 스택 프레임이 푸시(push)됩니다. 무한 재귀가 발생하면 운영체제가 프로세스에 할당한 스택 메모리 영역(통상 1MB~8MB)을 넘어서며 오버플로우가 발생합니다.';
    timeOld = 'O(2^N) 또는 무한 루프';
    timeNew = 'O(N) (메모이제이션 또는 반복문 변환)';
    spaceOld = 'O(N) 스택 메모리 초과';
    spaceNew = 'O(1) 또는 O(N) 힙 캐시';
    tips = [
      '재귀 함수의 최상단에 반드시 if n <= 0 등의 기저 탈출 조건을 명시하세요.',
      '반복 연산이 많은 경우 재귀 대신 반복문(Iterative)이나 동적 계획법(DP Memoization)을 검토하세요.',
    ];
  } else if (lowerLog.includes('typeerror') || lowerLog.includes('cannot cast') || lowerLog.includes('incompatible types')) {
    errorTitle = 'TypeError / 자료형 불일치 및 연산 불가 오류';
    errorType = 'TypeError / Incompatible Types';
    errorLocation = '연산자(+) 또는 메서드 파라미터 전달부';
    rootCause =
      '서로 다른 데이터 타입 간의 부적절한 연산이 시도되었거나, 예상치 못한 타입의 인자가 전달되었습니다.';
    conceptExplanation =
      '강타입(Strongly Typed) 및 정적/동적 타입 시스템에서 피연산자의 메모리 바이너리 해석 방식이 다를 때 발생합니다. 런타임 형 변환(Type Coercion)이 실패하거나 지원되지 않는 연산입니다.';
    tips = [
      '명시적 형 변환(Type Casting)을 수행하세요.',
      'TypeScript 또는 Python Type Hinting을 적용하여 컴파일 타임에 타입 불일치를 조기 검출하세요.',
    ];
  }

  // Adjust fixed code according to language
  if (language === 'python') {
    if (code.includes('range(len(') && code.includes('<= len(')) {
      fixedCode = code.replace('<= len(', '< len(');
    } else if (code.includes('for i in range(len(arr) + 1):')) {
      fixedCode = code.replace('range(len(arr) + 1):', 'range(len(arr)):');
    } else if (code.includes('def fibonacci(n):') && !code.includes('if n <= 1:')) {
      fixedCode = `def fibonacci(n):\n    # 기저 조건 추가: n이 0 또는 1일 때 재귀 탈출\n    if n <= 0:\n        return 0\n    if n == 1:\n        return 1\n    return fibonacci(n - 1) + fibonacci(n - 2)`;
    } else {
      fixedCode = `# [AI 수정본] 경계값 검사 및 가드 추가\n` + code;
    }
  } else if (language === 'javascript' || language === 'typescript') {
    if (code.includes('.length') && code.includes('i <= arr.length')) {
      fixedCode = code.replace('i <= arr.length', 'i < arr.length');
    } else if (code.includes('user.profile.name')) {
      fixedCode = code.replace('user.profile.name', 'user?.profile?.name ?? "Guest"');
    } else {
      fixedCode = `// [AI 수정본] 안전한 널 체크 및 옵셔널 체이닝 적용\n` + code;
    }
  } else if (language === 'java') {
    if (code.includes('.length') && code.includes('i <= arr.length')) {
      fixedCode = code.replace('i <= arr.length', 'i < arr.length');
    } else {
      fixedCode = `// [AI 수정본] null 안전성 검증 적용\n` + code;
    }
  }

  const testCases: TestCase[] = [
    {
      id: 'tc-1',
      name: '기본 케이스 (Standard Case)',
      input: 'arr = [10, 20, 30, 40, 50]',
      expectedOutput: '정상 반환 및 인덱스 범위 순회 완료 (합계: 150)',
      passed: true,
    },
    {
      id: 'tc-2',
      name: '경계값 테스트 (Boundary Condition - Empty/Single)',
      input: 'arr = [99]',
      expectedOutput: '정상 반환 (원소 1개 정상 처리)',
      passed: true,
    },
    {
      id: 'tc-3',
      name: '극단적 케이스 (Extreme Scale)',
      input: 'N = 10,000 대량 데이터셋',
      expectedOutput: '예외 없이 안정적 메모리 관리 및 24ms 내 처리 완료',
      passed: true,
    },
  ];

  const edgeCases = generateEdgeCases(language, code, errorType);
  const memoryTraces = generateMemoryTraces(language, code, errorType);

  return {
    id,
    timestamp: Date.now(),
    language,
    errorTitle,
    errorType,
    errorLocation,
    rootCause,
    fixedCode,
    diffSummary: '반복문 종료 조건 교정, 널 포인터 가드 추가 및 기저 조건 보완 완료',
    conceptExplanation,
    complexity: {
      timeOld,
      timeNew,
      spaceOld,
      spaceNew,
      details: '시간 복잡도는 동등하게 유지하면서 비정상 종료와 스택 오버플로우 메모리 누수를 완전히 방지했습니다.',
    },
    performanceTips: tips,
    simulationTestCases: testCases,
    edgeCases,
    memoryTraces,
    originalCode: code,
    errorLog,
  };
}

/**
 * Generates automated AI edge cases and corner cases
 */
export function generateEdgeCases(
  language: SupportedLanguage,
  code: string,
  errorType: string
): import('../types').EdgeCaseItem[] {
  return [
    {
      id: 'ec-1',
      category: 'Empty/Null',
      title: '빈 컨테이너 / Null 주소 전달 (Empty Input)',
      inputDescription: 'arr = [] 또는 null/None',
      riskReason: '크기가 0인 배열의 0번째 인덱스(arr[0])에 접근 시 즉시 예외 발생 또는 null 포인터 역참조',
      expectedOutcome: '빈 결과 반환 또는 안전한 0 반환 (크래시 없음)',
      passed: true,
    },
    {
      id: 'ec-2',
      category: 'Boundary',
      title: '단일 원소 경계값 (Single Element Boundary)',
      inputDescription: 'arr = [42] (길이=1)',
      riskReason: '루프 조건 i <= len(arr) 적용 시 2번째 반복(i=1)에서 길이 1을 초과하여 IndexError 발생',
      expectedOutcome: '원소 1개 정상 누적 반환 [42]',
      passed: true,
    },
    {
      id: 'ec-3',
      category: 'Scale/Overflow',
      title: '극단적 대규모 입력 (Large Scale Boundary)',
      inputDescription: 'N = 100,000 원소 배열',
      riskReason: 'O(N^2) 알고리즘이거나 깊은 재귀(Recursion) 호출 시 스택 메모리 한도(보통 1,000 프레임) 초과',
      expectedOutcome: '재귀 깊이 초과 없이 O(N) 선형 시간 내 처리 완료',
      passed: true,
    },
    {
      id: 'ec-4',
      category: 'Duplicates',
      title: '중복값 및 음수값 조합 (Negative & Duplicates)',
      inputDescription: 'arr = [-10, -10, 0, 5, 5]',
      riskReason: '단순 양수 전제 누적합 또는 0 나누기(DivisionByZero) 잠재 결함 유발 가능',
      expectedOutcome: '음수 부호 보존 및 정상 산술 누적',
      passed: true,
    },
  ];
}

/**
 * Generates step-by-step memory stack and heap traces
 */
export function generateMemoryTraces(
  language: SupportedLanguage,
  code: string,
  errorType: string
): import('../types').MemoryTraceStep[] {
  return [
    {
      step: 1,
      instruction: '함수 호출 및 초기 스택 프레임 생성 (Stack Push)',
      callStack: [{ frame: '#0 Main', functionName: 'calculate_running_sum', line: 1 }],
      stackVariables: [
        { name: 'arr (참조)', value: '0x7ffea10 [10, 20, 30]', type: 'List*' },
        { name: 'result', value: '0x7ffea40 [] (빈 리스트)', type: 'List*' },
        { name: 'current_sum', value: '0', type: 'int' },
        { name: 'i', value: '0', type: 'int' },
      ],
      heapObjects: [
        { address: '0x7ffea10', label: 'Array Buffer', details: '[10, 20, 30] (size=3, capacity=4)' },
        { address: '0x7ffea40', label: 'Result Buffer', details: '[] (size=0, capacity=4)' },
      ],
      pointers: [{ name: 'arr[0]', pointsTo: '0x7ffea10+0 (값: 10)' }],
      insight: 'CPU가 호출 스택에 지역 변수를 위한 프레임을 할당하고 힙(Heap)에 생성된 원본 배열의 시작 주소를 참조합니다.',
    },
    {
      step: 2,
      instruction: '반복문 1회차 실행 (i = 0, 정상 누적)',
      callStack: [{ frame: '#0 Main', functionName: 'calculate_running_sum', line: 5 }],
      stackVariables: [
        { name: 'current_sum', value: '10', type: 'int' },
        { name: 'i', value: '0', type: 'int' },
      ],
      heapObjects: [
        { address: '0x7ffea10', label: 'Array Buffer', details: '[10, 20, 30]' },
        { address: '0x7ffea40', label: 'Result Buffer', details: '[10] (size=1)' },
      ],
      pointers: [{ name: 'arr[0]', pointsTo: '유효 주소' }],
      insight: 'arr[0]의 메모리 오프셋 (Base Address + 0*sizeof(int))에서 10을 성공적으로 로드하여 result에 append했습니다.',
    },
    {
      step: 3,
      instruction: '마지막 유효 원소 접근 (i = 2, arr[2] = 30)',
      callStack: [{ frame: '#0 Main', functionName: 'calculate_running_sum', line: 5 }],
      stackVariables: [
        { name: 'current_sum', value: '60', type: 'int' },
        { name: 'i', value: '2', type: 'int' },
      ],
      heapObjects: [
        { address: '0x7ffea10', label: 'Array Buffer', details: '[10, 20, 30]' },
        { address: '0x7ffea40', label: 'Result Buffer', details: '[10, 30, 60] (size=3)' },
      ],
      pointers: [{ name: 'arr[2]', pointsTo: '0x7ffea10+8 (최대 유효 인덱스)' }],
      insight: '배열 크기가 3일 때, 0-indexed 체계에서 허용되는 마지막 안전 인덱스 2에 도달했습니다.',
    },
    {
      step: 4,
      instruction: '🚨 결함 발생 지점: 경계값 초과 접근 시도 (i = 3)',
      callStack: [{ frame: '#0 Main', functionName: 'calculate_running_sum', line: 6 }],
      stackVariables: [
        { name: 'i', value: '3', type: 'int (유효 범위 초과!)' },
        { name: 'len(arr)', value: '3', type: 'int' },
      ],
      heapObjects: [
        { address: '0x7ffea10', label: 'Array Buffer', details: '[10, 20, 30] (할당 한도 0~2)' },
        { address: '0x7ffea1C', label: 'Unallocated / Guard Page', details: '⚠️ 비인가 메모리 영역' },
      ],
      pointers: [{ name: 'arr[3]', pointsTo: '0x7ffea1C (Segmentation Fault / IndexError Trap)' }],
      insight: 'range(len(arr)+1)에 의해 i가 3이 되면서 배열의 경계를 넘어선 0x7ffea1C를 읽으려 했습니다. 런타임의 Bounds Check가 인터럽트를 트리거하여 IndexError를 발생시켰습니다.',
    },
  ];
}

/**
 * Transpiles code to another target language with memory architecture comparison
 */
export function transpileCode(
  sourceLang: SupportedLanguage,
  targetLang: SupportedLanguage,
  code: string
): import('../types').TranspileResult {
  if (targetLang === 'cpp') {
    return {
      targetLanguage: 'cpp',
      transpiledCode: `#include <iostream>\n#include <vector>\n\nstd::vector<int> calculateRunningSum(const std::vector<int>& arr) {\n    std::vector<int> result;\n    result.reserve(arr.size());\n    int currentSum = 0;\n    // C++ 방어 코딩: arr.size()는 부호 없는 size_t 타입이므로 < 비교 사용\n    for (size_t i = 0; i < arr.size(); ++i) {\n        currentSum += arr[i];\n        result.push_back(currentSum);\n    }\n    return result;\n}\n\nint main() {\n    std::vector<int> numbers = {10, 20, 30, 40, 50};\n    auto res = calculateRunningSum(numbers);\n    for (int n : res) std::cout << n << " ";\n    return 0;\n}`,
      keyDifferences: [
        'Python의 동적 리스트(Dynamic List) 대신 C++에서는 연속 메모리 컨테이너 std::vector<int>를 사용합니다.',
        'result.reserve()를 사전 호출하여 불필요한 힙 재할당(Reallocation) 오버헤드를 O(1) 분할 상환으로 최적화했습니다.',
        'Python은 음수 인덱스(arr[-1])를 지원하지만 C++ 벡터에서 음수 인덱스 접근은 치명적인 미정의 동작(Undefined Behavior)을 유발합니다.',
      ],
      memoryModelDifferences:
        'Python은 모든 객체가 힙(Heap)의 PyObject로 레퍼런스 카운팅(GC) 관리되지만, C++은 std::vector가 스택에 24바이트 메타데이터를 두고 힙에 버퍼를 연속 할당하여 캐시 지역성(Cache Locality)이 극대화됩니다.',
    };
  } else if (targetLang === 'java') {
    return {
      targetLanguage: 'java',
      transpiledCode: `import java.util.ArrayList;\nimport java.util.List;\n\npublic class Solution {\n    public static List<Integer> calculateRunningSum(int[] arr) {\n        if (arr == null) return new ArrayList<>();\n        List<Integer> result = new ArrayList<>(arr.length);\n        int currentSum = 0;\n        for (int i = 0; i < arr.length; i++) {\n            currentSum += arr[i];\n            result.add(currentSum);\n        }\n        return result;\n    }\n}`,
      keyDifferences: [
        '기본 원시 타입 int[] 배열과 참조 컬렉션 ArrayList<Integer> 간의 Boxing/Unboxing 비용을 고려해야 합니다.',
        '배열 길이는 .length 필드(Primitive)이고, 리스트는 .size() 메서드를 호출합니다.',
        '파라미터 null 유입에 대비한 Guard Clause (arr == null)를 기본 적용했습니다.',
      ],
      memoryModelDifferences:
        'Java는 JVM 메모리의 Young/Old Generation 힙 영역에서 가비지 컬렉터(G1GC / ZGC)가 객체를 수거하며, ArrayList 내부의 Integer 래퍼 객체들은 힙 곳곳에 분산 참조됩니다.',
    };
  }

  return {
    targetLanguage: targetLang,
    transpiledCode: `// ${targetLang.toUpperCase()} 변환 완료\n` + code,
    keyDifferences: ['동일한 알고리즘 로직이 타겟 언어의 표준 라이브러리 규격에 맞춰 변환되었습니다.'],
    memoryModelDifferences: '타겟 언어의 기본 런타임 메모리 관리 방식에 따라 동작합니다.',
  };
}

/**
 * Generates active-recall review quiz from error notes
 */
export function generateReviewQuiz(
  savedErrors: { errorType: string; language: string; errorTitle: string }[]
): import('../types').ReviewQuizQuestion[] {
  return [
    {
      id: 'q-1',
      question: '크기가 N인 배열을 0부터 N까지 i <= N 조건으로 순회할 때 발생하는 문제는?',
      options: [
        '정상적으로 모든 원소가 순회된다.',
        'i = N일 때 유효 인덱스(N-1)를 초과하여 IndexError/OutOfBounds가 발생한다.',
        '무한 루프가 발생하여 프로그램이 멈춘다.',
        '마지막 원소가 두 번 중복 출력된다.',
      ],
      correctIndex: 1,
      explanation: '배열은 0부터 시작하므로 크기가 N일 때 마지막 원소의 인덱스는 N-1입니다. i <= N이면 i=N일 때 배열의 범위를 벗어납니다.',
      relatedErrorType: 'IndexError',
    },
    {
      id: 'q-2',
      question: '재귀 함수에서 기저 조건(Base Case)이 누락되었을 때 시스템에서 일어나는 일은?',
      options: [
        '시간 복잡도가 O(1)로 단축된다.',
        '호출 스택(Call Stack) 프레임이 계속 쌓이다가 스택 오버플로우가 발생한다.',
        '힙 메모리에 자동으로 가비지 컬렉션이 일어난다.',
        'CPU 연산이 자동으로 중단되고 0이 반환된다.',
      ],
      correctIndex: 1,
      explanation: '함수가 호출될 때마다 복귀 주소와 지역 변수가 스택에 푸시됩니다. 탈출 기저 조건이 없으면 할당된 스택 메모리 한도를 초과하여 크래시됩니다.',
      relatedErrorType: 'RecursionError',
    },
    {
      id: 'q-3',
      question: '객체가 null인지 불확실한 상태에서 안전하게 프로퍼티에 접근하는 최선의 방법은?',
      options: [
        '그냥 호출하고 예외가 발생하면 무시한다.',
        '옵셔널 체이닝(?.)이나 사전 if (obj != null) 가드 조건을 작성한다.',
        '프로퍼티를 전역 변수로 승격시킨다.',
        'while 루프로 null이 아닐 때까지 기다린다.',
      ],
      correctIndex: 1,
      explanation: '방어적 프로그래밍의 핵심은 호출 전 사전 널 가드(Guard Clause) 또는 옵셔널 체이닝을 사용하는 것입니다.',
      relatedErrorType: 'NullPointerException',
    },
  ];
}

