import { AnalysisResult, CommunityPost, NotificationItem, UserProfile } from '../types';

const STORAGE_KEYS = {
  HISTORY: 'devdoctor_history_v1',
  BOOKMARKS: 'devdoctor_bookmarks_v1',
  USER: 'devdoctor_user_v1',
  COMMUNITY: 'devdoctor_community_v1',
  NOTIFICATIONS: 'devdoctor_notifications_v1',
  SOLVED_CHALLENGES: 'devdoctor_solved_challenges_v1',
  PURCHASED_COURSES: 'devdoctor_purchased_courses_v1',
  THEME: 'devdoctor_theme_v1',
};

// Initial default user profile
export const DEFAULT_USER: UserProfile = {
  id: 'usr_student_01',
  name: '김개발 (컴퓨터공학과 3학년)',
  email: 'king72572@gmail.com',
  provider: 'google',
  avatarUrl: '',
  universityOrOrg: '한국대학교 소프트웨어학부',
  tier: 'Platinum',
  points: 740,
  resolvedCount: 38,
  linkedAccounts: {
    google: true,
    naver: false,
    kakao: false,
  },
  isPremium: false,
  purchasedCourses: [],
};

// Initial preset community posts
export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post_1',
    title: '[Python] 이진 탐색 트리 삽입 시 무한 루프 도는데 어디가 문제일까요?',
    author: '알고리즘새싹',
    authorTier: 'Gold',
    language: 'python',
    codeSnippet: `def insert(root, val):\n    curr = root\n    while curr:\n        if val < curr.val:\n            curr = curr.left\n        else:\n            curr = curr.right\n    curr = Node(val)\n    return root`,
    errorLog: `RuntimeError: Node is not linked to parent; tree does not update.`,
    solved: true,
    upvotes: 14,
    hasUpvoted: false,
    views: 182,
    createdAt: Date.now() - 3600000 * 5,
    tags: ['이진탐색트리', '포인터참조', '자료구조'],
    comments: [
      {
        id: 'c_1',
        author: '박멘토',
        authorTier: 'Grandmaster',
        content: 'curr = Node(val)을 생성해도 이전 부모 노드의 left 또는 right 포인터와 연결되지 않고 지역변수만 재할당됩니다! parent = curr를 기억해두고 parent.left = Node(val) 형태로 연결해주셔야 합니다.',
        createdAt: Date.now() - 3600000 * 3,
        likes: 9,
      },
    ],
  },
  {
    id: 'post_2',
    title: '[JavaScript] Promise.all 사용 시 하나만 reject되어도 전체가 날아갑니다..',
    author: '웹프론트지망생',
    authorTier: 'Silver',
    language: 'javascript',
    codeSnippet: `const results = await Promise.all([\n  fetchDataA(),\n  fetchDataB(),\n  fetchDataC()\n]);`,
    errorLog: `UnhandledPromiseRejection: Error in fetchDataB`,
    solved: true,
    upvotes: 21,
    hasUpvoted: false,
    views: 310,
    tags: ['비동기', 'Promise', 'ES2020'],
    createdAt: Date.now() - 3600000 * 18,
    comments: [
      {
        id: 'c_2',
        author: '풀스택개발러',
        authorTier: 'Diamond',
        content: '실패한 요청이 있더라도 나머지 결과를 살리고 싶다면 Promise.all 대신 Promise.allSettled()를 사용해 보세요! 각 결과의 status(fulfilled/rejected)를 개별 핸들링할 수 있습니다.',
        createdAt: Date.now() - 3600000 * 12,
        likes: 15,
      },
    ],
  },
  {
    id: 'post_3',
    title: '[Java] Spring Boot 컨트롤러에서 JPA N+1 문제와 NullPointerException',
    author: '백엔드러너',
    authorTier: 'Platinum',
    language: 'java',
    codeSnippet: `List<Order> orders = orderRepository.findAll();\nfor (Order order : orders) {\n    System.out.println(order.getUser().getName());\n}`,
    errorLog: `NullPointerException at OrderController.java:42`,
    solved: false,
    upvotes: 8,
    hasUpvoted: false,
    views: 142,
    tags: ['Spring', 'JPA', 'N+1문제'],
    createdAt: Date.now() - 3600000 * 2,
    comments: [],
  },
];

// Initial notifications
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n_1',
    title: '디버깅 완료 알림',
    message: '요청하신 Python 알고리즘 코드의 IndexError 원인 분석이 완료되었습니다.',
    type: 'debug',
    timestamp: Date.now() - 1000 * 60 * 10,
    read: false,
  },
  {
    id: 'n_2',
    title: '커뮤니티 답변 등록',
    message: '작성하신 질문글에 박멘토(Grandmaster)님이 답변을 남겼습니다.',
    type: 'community',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    read: false,
  },
  {
    id: 'n_3',
    title: '주간 챌린지 랭킹 변동',
    message: '새로운 디버깅 과제를 해결하여 랭킹 포인트 +120P를 획득했습니다!',
    type: 'challenge',
    timestamp: Date.now() - 1000 * 60 * 60 * 14,
    read: true,
  },
];

export const storage = {
  getHistory(): AnalysisResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveHistory(item: AnalysisResult): void {
    try {
      const list = this.getHistory();
      const filtered = list.filter(h => h.id !== item.id);
      filtered.unshift(item);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered.slice(0, 50)));
    } catch (e) {
      console.warn('Failed to save history to offline storage', e);
    }
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch {}
  },

  getBookmarks(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleBookmark(id: string): boolean {
    try {
      const bookmarks = this.getBookmarks();
      const idx = bookmarks.indexOf(id);
      let isBookmarked = false;
      if (idx >= 0) {
        bookmarks.splice(idx, 1);
        isBookmarked = false;
      } else {
        bookmarks.push(id);
        isBookmarked = true;
      }
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return isBookmarked;
    } catch {
      return false;
    }
  },

  getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  },

  saveUser(user: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save user', e);
    }
  },

  getCommunityPosts(): CommunityPost[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMUNITY);
      return data ? JSON.parse(data) : INITIAL_COMMUNITY_POSTS;
    } catch {
      return INITIAL_COMMUNITY_POSTS;
    }
  },

  saveCommunityPosts(posts: CommunityPost[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMUNITY, JSON.stringify(posts));
    } catch {}
  },

  getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  saveNotifications(notifs: NotificationItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    } catch {}
  },
};
