export type SupportedLanguage = 'python' | 'javascript' | 'typescript' | 'java' | 'cpp' | 'go' | 'rust';

export interface DiffLine {
  type: 'same' | 'added' | 'removed';
  content: string;
  lineNumberOld?: number;
  lineNumberNew?: number;
}

export interface TestCase {
  id: string;
  name: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
}

export interface EdgeCaseItem {
  id: string;
  category: 'Boundary' | 'Empty/Null' | 'Scale/Overflow' | 'Duplicates' | 'Special';
  title: string;
  inputDescription: string;
  riskReason: string;
  expectedOutcome: string;
  passed?: boolean;
}

export interface MemoryTraceStep {
  step: number;
  instruction: string;
  callStack: { frame: string; functionName: string; line: number }[];
  stackVariables: { name: string; value: string; type: string }[];
  heapObjects: { address: string; label: string; details: string }[];
  pointers: { name: string; pointsTo: string }[];
  insight: string;
}

export interface TranspileResult {
  targetLanguage: SupportedLanguage;
  transpiledCode: string;
  keyDifferences: string[];
  memoryModelDifferences: string;
}

export interface ReviewQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedErrorType: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  language: SupportedLanguage;
  errorTitle: string;
  errorType: string;
  errorLocation: string;
  rootCause: string;
  fixedCode: string;
  diffSummary: string;
  conceptExplanation: string;
  complexity: {
    timeOld: string;
    timeNew: string;
    spaceOld: string;
    spaceNew: string;
    details: string;
  };
  performanceTips: string[];
  simulationTestCases: TestCase[];
  edgeCases?: EdgeCaseItem[];
  memoryTraces?: MemoryTraceStep[];
  originalCode: string;
  errorLog: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  provider: 'google' | 'naver' | 'kakao' | 'guest';
  avatarUrl: string;
  universityOrOrg: string;
  tier: string;
  points: number;
  resolvedCount: number;
  linkedAccounts: {
    google: boolean;
    naver: boolean;
    kakao: boolean;
  };
  isPremium: boolean;
  purchasedCourses: string[];
}

export interface CommunityComment {
  id: string;
  author: string;
  authorAvatar?: string;
  authorTier: string;
  content: string;
  createdAt: number;
  likes: number;
}

export interface CommunityPost {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  authorTier: string;
  language: SupportedLanguage;
  codeSnippet: string;
  errorLog: string;
  solved: boolean;
  upvotes: number;
  hasUpvoted?: boolean;
  views: number;
  comments: CommunityComment[];
  tags: string[];
  createdAt: number;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: SupportedLanguage;
  category: string;
  points: number;
  solvedCount: number;
  description: string;
  buggyCode: string;
  errorLog: string;
  hint: string;
  testCases: TestCase[];
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  tier: string;
  points: number;
  solvedChallenges: number;
  badge: string;
  isCurrentUser?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'debug' | 'community' | 'challenge' | 'payment';
  timestamp: number;
  read: boolean;
}

export interface PremiumCourse {
  id: string;
  title: string;
  subtitle: string;
  instructor: string;
  originalPrice: number;
  discountPrice: number;
  badge: string;
  rating: number;
  reviewCount: number;
  highlights: string[];
  syllabusCount: number;
}
