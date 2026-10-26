import { SupportedLanguage } from '../types';

export interface CodePreset {
  id: string;
  name: string;
  language: SupportedLanguage;
  context: string;
  code: string;
  errorLog: string;
}

export const CODE_PRESETS: CodePreset[] = [
  {
    id: 'py-index',
    name: '[Python] 리스트 인덱스 범위 초과 (IndexError)',
    language: 'python',
    context: '컴퓨터공학과 자료구조 실습 과제: 배열 누적합 계산기',
    code: `def calculate_running_sum(arr):\n    result = []\n    current_sum = 0\n    # 버그 발생 지점: range(len(arr) + 1)로 인해 마지막 순회에서 인덱스 초과\n    for i in range(len(arr) + 1):\n        current_sum += arr[i]\n        result.append(current_sum)\n    return result\n\nnumbers = [10, 20, 30, 40, 50]\nprint(calculate_running_sum(numbers))`,
    errorLog: `Traceback (most recent call last):\n  File "solution.py", line 6, in calculate_running_sum\n    current_sum += arr[i]\nIndexError: list index out of range`,
  },
  {
    id: 'py-recursion',
    name: '[Python] 피보나치 무한 재귀 (RecursionError)',
    language: 'python',
    context: '알고리즘 과제: 분할 정복 기반 수열 생성',
    code: `def fibonacci(n):\n    # 버그: n <= 0 또는 n == 1 등의 기저 조건(Base Case)이 누락됨\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nprint(fibonacci(5))`,
    errorLog: `RecursionError: maximum recursion depth exceeded in comparison\n  [Previous line repeated 996 more times]`,
  },
  {
    id: 'js-async',
    name: '[JavaScript] 비동기 데이터 Undefined 참조',
    language: 'javascript',
    context: '웹 프로그래밍 과제: 비동기 유저 프로필 데이터 파싱',
    code: `async function getUserGreeting(userId) {\n  const response = await fetchUserData(userId);\n  // 버그: API 응답이 실패하거나 profile이 null일 때의 방어 코드가 없음\n  const displayName = response.user.profile.name;\n  return \`환영합니다, \${displayName}님!\`;\n}\n\ngetUserGreeting('guest_99');`,
    errorLog: `TypeError: Cannot read properties of undefined (reading 'profile')\n    at getUserGreeting (user.js:4:32)`,
  },
  {
    id: 'java-null',
    name: '[Java] NullPointerException 참조 예외',
    language: 'java',
    context: '객체지향 프로그래밍 과제: 학생 수강신청 관리 시스템',
    code: `public class StudentManager {\n    public static void printStudentGrade(Student student) {\n        // 버그: student 또는 student.getTranscript()가 null인 경우 크래시\n        String grade = student.getTranscript().getMajorGrade();\n        System.out.println("전공 학점: " + grade);\n    }\n}`,
    errorLog: `Exception in thread "main" java.lang.NullPointerException: Cannot invoke "Transcript.getMajorGrade()" because the return value of "Student.getTranscript()" is null\n\tat StudentManager.printStudentGrade(StudentManager.java:4)`,
  },
  {
    id: 'cpp-segfault',
    name: '[C++] 포인터 경계값 침범 및 Segfault',
    language: 'cpp',
    context: '시스템 소프트웨어 실습: 동적 배열 반전 함수',
    code: `#include <iostream>\n\nvoid reverseArray(int* arr, int size) {\n    // 버그: 루프 조건이 i <= size로 설정되어 유효하지 않은 메모리 주소 접근\n    for (int i = 0; i <= size; ++i) {\n        int temp = arr[i];\n        arr[i] = arr[size - i];\n        arr[size - i] = temp;\n    }\n}`,
    errorLog: `Segmentation fault (core dumped) at 0x7ffd582b1c48`,
  },
];
