import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { API_BASE, apiFetch, consumePendingAction, setPendingAction, toggleLike } from '../utils/auth';
import { FiMessageCircle } from 'react-icons/fi';

const ViewPaper = () => {
  const { id } = useParams();
  const location = useLocation();
  const isPaperRoute = location.pathname.startsWith('/paper/');
  const type = isPaperRoute ? 'papers' : 'notes';
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const currentUserId = (() => {
    try {
      const u = localStorage.getItem("user");
      if (!u) return null;
      const parsed = JSON.parse(u);
      return parsed?._id ?? parsed?.id ?? null;
    } catch { return null; }
  })();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);
  const [shareMessage, setShareMessage] = useState(null);

  const itemType = isPaperRoute ? 'Paper' : 'Notes';
  const resourceType = isPaperRoute ? 'paper' : 'notes';

  const redirectToLoginWithAction = useCallback((action) => {
    setPendingAction({
      ...action,
      returnTo: location.pathname,
    });
    navigate("/login", { state: { from: location.pathname } });
  }, [location.pathname, navigate]);

  const runDownload = useCallback(async () => {
    const url =
      isPaperRoute
        ? `/paper/download/${id}`
        : `/notes/download/${id}`;

    const res = await apiFetch(url);

    if (res.status === 401) {
      redirectToLoginWithAction({ type: "download", itemId: id, resourceType: isPaperRoute ? "paper" : "notes" });
      return;
    }

    if (!res.ok) {
      throw new Error(`Failed to download resource: ${res.status}`);
    }

    const data = await res.json();
    const makeAbsolute = (u) => {
      if (!u) return u;
      if (/^https?:\/\//i.test(u)) return u;
      if (u.startsWith('/')) return `${API_BASE}${u}`;
      return `${API_BASE}/${u}`;
    };

    window.open(makeAbsolute(data.pdfUrl));
  }, [id, isPaperRoute, redirectToLoginWithAction]);

  const runPostComment = useCallback(async (content) => {
    const res = await apiFetch(`/comments/${itemType}/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });

    if (res.status === 401) {
      redirectToLoginWithAction({ type: "comment", itemId: id, itemType, content });
      return;
    }

    if (!res.ok) {
      throw new Error(`Failed to post comment: ${res.status}`);
    }

    const data = await res.json();

    const newCommentObj = { 
      ...data.comment, 
      user: (() => {
        try {
          const uStr = localStorage.getItem("user");
          if (uStr) {
            const parsed = JSON.parse(uStr);
            return {
              _id: currentUserId,
              name: parsed.name,
              username: parsed.username
            };
          }
        } catch {}
        return { _id: currentUserId };
      })() 
    };

    setComments(prev => [newCommentObj, ...prev]);
    setNewComment("");
  }, [id, itemType, redirectToLoginWithAction, currentUserId]);

  const runLikeToggle = useCallback(async () => {
    if (liking) return;
    setLiking(true);
    try {
      const result = await toggleLike({ id, resourceType });
      if (result.needsAuth) {
        redirectToLoginWithAction({ type: "like", itemId: id, resourceType, itemType });
        return;
      }
      if (result.ok && result.liked !== undefined) {
        setLiked(result.liked);
        if (typeof result.likesCount === "number") setLikeCount(result.likesCount);
      }
    } catch (err) {
      console.error("Like error", err);
    } finally {
      setLiking(false);
    }
  }, [id, resourceType, itemType, redirectToLoginWithAction, liking]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/${resourceType}/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: resource?.title || "Resource",
          url,
          text: resource?.title || "Check out this resource",
        });
        setShareMessage("Shared!");
      } else {
        await navigator.clipboard.writeText(url);
        setShareMessage("Link copied!");
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(url);
          setShareMessage("Link copied!");
        } catch {
          setShareMessage("Copy failed");
        }
      }
    }
  }, [id, resource?.title, resourceType]);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const url = isPaperRoute
          ? `${API_BASE}/paper/view/${id}`
          : `${API_BASE}/notes/view/${id}`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Failed to fetch resource: ${res.status}`);
        }

        const data = await res.json();
        setResource(data);
      } catch (err) {
        console.error("Failed to fetch resource", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id, isPaperRoute]);

  useEffect(() => {
    if (!resource) return;
    setLikeCount(resource?.likes?.length ?? 0);
    const uid = currentUserId;
    if (uid && Array.isArray(resource?.likes)) {
      const idStr = String(uid);
      const isLikedByUser = resource.likes.some((lid) => {
        const lidStr = lid != null ? (lid._id != null ? String(lid._id) : String(lid)) : "";
        return lidStr === idStr;
      });
      setLiked(isLikedByUser);
    } else {
      setLiked(Boolean(resource?.isLiked));
    }
  }, [resource?._id, resource?.likes, resource?.isLiked]);

  useEffect(() => {
    if (shareMessage) {
      const t = setTimeout(() => setShareMessage(null), 2000);
      return () => clearTimeout(t);
    }
  }, [shareMessage]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/comments/${itemType}/${id}`
        );

        if (!res.ok) {
          console.error("Failed to fetch comments", res.status);
          return;
        }

        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      }
    };

    fetchComments();
  }, [id, itemType]);

  useEffect(() => {
    const pending = consumePendingAction();
    if (!pending) return;

    if (pending.returnTo !== location.pathname) {
      setPendingAction(pending);
      return;
    }

    if (pending.type === "download" && pending.itemId === id) {
      runDownload();
      return;
    }

    if (pending.type === "comment" && pending.itemId === id && typeof pending.content === "string") {
      runPostComment(pending.content);
      return;
    }

    if (pending.type === "like" && pending.itemId === id) {
      runLikeToggle();
      return;
    }

    setPendingAction(pending);
  }, [id, location.pathname, runDownload, runPostComment, runLikeToggle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading resource...</p>
        </div>
      </div>
    );
  }

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      await runPostComment(newComment);
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await apiFetch(`/comments/${itemType}/${id}/${commentId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => (c._id || c.id) !== commentId));
      } else {
        throw new Error("Failed to delete comment");
      }
    } catch (err) {
      console.error("Delete error", err);
      alert("Failed to delete comment");
    }
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment._id || comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEditComment = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      const res = await apiFetch(`/comments/${itemType}/${id}/${commentId}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent })
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => prev.map(c => 
          (c._id || c.id) === commentId ? { ...c, content: data.comment.content } : c
        ));
        setEditingCommentId(null);
        setEditContent("");
      } else {
        throw new Error("Failed to update comment");
      }
    } catch (err) {
      console.error("Edit error", err);
      alert("Failed to update comment");
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleDownload = async () => {
    await runDownload();
  };

  if (!loading && !resource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center flex-col space-y-4">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-xl font-semibold text-white mb-2">Resource not found</p>
          <p className="text-gray-400 mb-6">The resource you're looking for doesn't exist</p>
          <button
            onClick={() => navigate(`/${type}`)}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
          >
            Back to {type === 'papers' ? 'Papers' : 'Notes'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/${type}`)}
          className="mb-8 px-4 py-2 border-2 border-gray-700 text-gray-300 rounded-full hover:border-blue-500 hover:text-blue-300 transition-all duration-300 flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {type === 'papers' ? 'Papers' : 'Notes'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PDF Preview Area */}
          <div className="lg:col-span-2">
            {/* PDF Preview Card */}
            <div className="bg-gray-900/50 border-2 border-gray-800 rounded-2xl p-6 mb-6">
              <div className="aspect-4/3 bg-black/50 border border-gray-800 rounded-xl overflow-hidden mb-4">
                {resource ? (
                  <iframe
                    title={resource?.title || "PDF Preview"}
                    src={
                      isPaperRoute
                        ? `${API_BASE}/paper/preview/${id}`
                        : `${API_BASE}/notes/preview/${id}`
                    }
                    className="w-full h-full"
                    style={{ border: "none", minHeight: 480 }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-400">PDF Preview Not Available</p>
                      <p className="text-sm text-gray-500 mt-1">Download to view the full document</p>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={handleDownload} 
                className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
              >
                Download PDF
              </button>
            </div>

            {/* Discussion Section */}
            <div className="bg-gray-900/50 border-2 border-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center">
                  <FiMessageCircle className="w-4 h-4 text-blue-400" />
                </div>
                Discussion
              </h3>

              {/* Comments List */}
              {comments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {comments.map((comment, idx) => {
                    const commentId = comment._id || comment.id || idx;
                    const commentUserId = comment.user?._id || comment.user;
                    const isOwner = String(currentUserId) === String(commentUserId);
                    const isEditing = editingCommentId === commentId;
                    
                    return (
                    <div key={commentId} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-semibold">{(comment.user?.username || comment.user?.name || "?").charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-white">{comment.user?.username || comment.user?.name || "Anonymous"}</span>
                            <span className="text-xs text-gray-500 ml-2">{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {isOwner && currentUserId && (
                          <div className="flex gap-2 text-sm">
                            <button
                              onClick={() => isEditing ? handleCancelEdit() : startEditComment(comment)}
                              className="text-gray-400 hover:text-blue-400 transition-colors"
                            >
                              {isEditing ? "Cancel" : "Edit"}
                            </button>
                            <button
                              onClick={() => handleDeleteComment(commentId)}
                              className="text-gray-400 hover:text-red-400 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="mt-3">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows="2"
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition-all text-gray-200 placeholder-gray-500 resize-none text-sm mb-2"
                          />
                          <button
                            onClick={() => handleSaveEditComment(commentId)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-300">{comment.content}</p>
                      )}
                    </div>
                  )})}
                </div>
              )}

              {/* Comment Input */}
              <div className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a thoughtful comment..."
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-white placeholder-gray-500 resize-none"
                />
                <button
                  onClick={handlePostComment}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>

          {/* Resource Details Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 border-2 border-gray-800 rounded-2xl p-6 sticky top-28">
              <h2 className="text-2xl font-bold text-white mb-6">
                {resource?.title || resource?.subject?.name || "Resource"}
              </h2>

              {/* Details */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-800">
                <div>
                  <span className="text-sm text-gray-500 uppercase tracking-wider">Subject Code</span>
                  <p className="font-semibold text-gray-200 mt-1">
                    {resource?.subject?.code || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 uppercase tracking-wider">Exam Type</span>
                  <p className="font-semibold text-gray-200 mt-1">
                    {resource?.examType || (resource?.unit != null ? `Unit ${resource.unit}` : "N/A")}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm">{likeCount} Likes</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="text-sm">{resource?.downloadCount ?? 0} Downloads</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={runLikeToggle}
                  disabled={liking}
                  className={`flex-1 p-3 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${liked ? "border-red-500/50 text-red-400 bg-red-500/10" : "border-gray-700 text-gray-400 hover:border-red-500/50 hover:text-red-300 hover:bg-red-500/10"} ${liking ? "opacity-60 cursor-not-allowed" : ""}`}
                  title="Like"
                >
                  <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 p-3 rounded-full border-2 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-all duration-300 flex items-center justify-center relative"
                  title="Share"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {shareMessage && (
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-gray-700 text-white text-xs whitespace-nowrap">
                      {shareMessage}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPaper;

