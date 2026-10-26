import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  CheckCircle,
  Clock,
  Tag,
  Plus,
  Send,
  Sparkles,
  Code2,
  Search,
  X,
} from 'lucide-react';
import { CommunityPost, SupportedLanguage, UserProfile } from '../types';
import { storage } from '../utils/storage';

interface CommunityViewProps {
  user: UserProfile;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ user }) => {
  const [posts, setPosts] = useState<CommunityPost[]>(() => storage.getCommunityPosts());
  const [filterLang, setFilterLang] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New Post Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLang, setNewLang] = useState<SupportedLanguage>('python');
  const [newCode, setNewCode] = useState('');
  const [newErrorLog, setNewErrorLog] = useState('');
  const [newTags, setNewTags] = useState('');

  // Selected post for commenting
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Handle Upvote
  const handleUpvote = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const hasUpvoted = !p.hasUpvoted;
        return {
          ...p,
          hasUpvoted,
          upvotes: hasUpvoted ? p.upvotes + 1 : p.upvotes - 1,
        };
      }
      return p;
    });
    setPosts(updated);
    storage.saveCommunityPosts(updated);
  };

  // Submit comment
  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;

    const newComment = {
      id: `c_${Date.now()}`,
      author: user.name.split(' ')[0],
      authorTier: user.tier,
      content: commentText.trim(),
      createdAt: Date.now(),
      likes: 0,
    };

    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, newComment],
        };
      }
      return p;
    });

    setPosts(updated);
    storage.saveCommunityPosts(updated);
    setCommentText('');
  };

  // Submit new review post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) {
      alert('제목과 코드를 입력해주세요.');
      return;
    }

    const post: CommunityPost = {
      id: `post_${Date.now()}`,
      title: newTitle.trim(),
      author: user.name.split(' ')[0],
      authorTier: user.tier,
      language: newLang,
      codeSnippet: newCode.trim(),
      errorLog: newErrorLog.trim(),
      solved: false,
      upvotes: 1,
      hasUpvoted: true,
      views: 1,
      comments: [],
      tags: newTags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
      createdAt: Date.now(),
    };

    const updated = [post, ...posts];
    setPosts(updated);
    storage.saveCommunityPosts(updated);

    // Reset & close
    setNewTitle('');
    setNewCode('');
    setNewErrorLog('');
    setNewTags('');
    setIsModalOpen(false);
  };

  // Filtered posts
  const filteredPosts = posts.filter(p => {
    if (filterLang !== 'all' && p.language !== filterLang) return false;
    if (statusFilter === 'solved' && !p.solved) return false;
    if (statusFilter === 'unsolved' && p.solved) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchTag = p.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchTag) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Top Header & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors min-w-0 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>피어 코드 리뷰 &amp; 지식 커뮤니티</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              동료 개발자 및 전공 학생들과 막힌 코드를 공유하고, 실무 팁과 리팩토링 답변을 나눠보세요.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors self-stretch sm:self-auto cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>새 코드 리뷰 요청</span>
          </button>
        </div>

        {/* Filters and search input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 min-w-0">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            {/* Language filter */}
            <select
              value={filterLang}
              onChange={e => setFilterLang(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none flex-1 sm:flex-initial"
            >
              <option value="all">모든 언어</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>

            {/* Status filter */}
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setStatusFilter('unsolved')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === 'unsolved'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                답변 대기
              </button>
              <button
                onClick={() => setStatusFilter('solved')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === 'solved'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                해결됨
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="제목, 에러, 태그 검색..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => {
            const isSelected = selectedPostId === post.id;

            return (
              <div
                key={post.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors"
              >
                {/* Post Top Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      {post.solved ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          해결 완료
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          답변 대기 중
                        </span>
                      )}
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="font-mono text-slate-500 uppercase">{post.language}</span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-slate-500">{post.author} ({post.authorTier})</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {post.title}
                    </h3>
                  </div>

                  {/* Upvote button */}
                  <button
                    onClick={() => handleUpvote(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors shrink-0 ${
                      post.hasUpvoted
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="tabular-nums font-mono">{post.upvotes}</span>
                  </button>
                </div>

                {/* Code Snippet Box */}
                <div className="mt-3 bg-slate-950 text-slate-200 rounded-lg p-3 font-mono text-xs overflow-x-auto max-h-48 border border-slate-800">
                  <pre className="whitespace-pre">{post.codeSnippet}</pre>
                </div>

                {/* Error Log */}
                {post.errorLog && (
                  <div className="mt-2 text-xs text-rose-400 bg-rose-950/20 border border-rose-900/30 rounded-lg p-2 font-mono">
                    {post.errorLog}
                  </div>
                )}

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <Tag className="w-3.5 h-3.5" />
                    {post.tags.map(tag => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                )}

                {/* Comments Section Toggle */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setSelectedPostId(isSelected ? null : post.id)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>댓글 및 답변 ({post.comments.length}개) {isSelected ? '접기 ▲' : '열기 ▼'}</span>
                  </button>
                  <span className="text-slate-400">조회 {post.views}회</span>
                </div>

                {/* Expanded Comments & Reply Form */}
                {isSelected && (
                  <div className="mt-4 pt-3 space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    {post.comments.map(c => (
                      <div key={c.id} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {c.author} ({c.authorTier})
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {c.content}
                        </p>
                      </div>
                    ))}

                    {/* Add reply input */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder="이 문제에 대한 해결 팁이나 의견을 남겨주세요..."
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                        title="답변 등록"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            조건에 맞는 질문이 없습니다. 첫 번째 코드 리뷰를 등록해 보세요!
          </div>
        )}
      </div>

      {/* Modal: Create New Post */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                새 코드 리뷰 요청 질문 작성
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="닫기"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  질문 제목
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="예: [Python] 이진 트리 순회 중 RecursionError 질문드립니다"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  언어 선택
                </label>
                <select
                  value={newLang}
                  onChange={e => setNewLang(e.target.value as SupportedLanguage)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  문제 소스 코드
                </label>
                <textarea
                  required
                  rows={5}
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  placeholder="디버깅이 필요한 코드를 붙여넣으세요..."
                  className="w-full font-mono bg-slate-950 text-slate-100 rounded-lg p-2.5 border border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  에러 로그 또는 문제 증상
                </label>
                <input
                  type="text"
                  value={newErrorLog}
                  onChange={e => setNewErrorLog(e.target.value)}
                  placeholder="예: RecursionError: maximum depth exceeded"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  태그 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="자료구조, 재귀함수, 백준"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                >
                  리뷰 요청 게시
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
