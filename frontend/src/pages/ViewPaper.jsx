import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { API_BASE, apiFetch, consumePendingAction, setPendingAction } from '../utils/auth';
import { FiMessageCircle } from 'react-icons/fi';

const ViewPaper = () => {
  const { id } = useParams();
  const location = useLocation();
  const isPaperRoute = location.pathname.startsWith('/paper/');
  const type = isPaperRoute ? 'papers' : 'notes';
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  const itemType = isPaperRoute ? 'Paper' : 'Notes';

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
    setComments(prev => [data.comment, ...prev]);
    setNewComment("");
  }, [id, itemType, redirectToLoginWithAction]);


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

    setPendingAction(pending);
  }, [id, location.pathname, runDownload, runPostComment]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
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

  const handleDownload = async () => {
    await runDownload();
  };

  if (!loading && !resource) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col space-y-4">
        <p className="text-lg font-semibold text-gray-800">
          Resource not found.
        </p>
        <button
          onClick={() => navigate(`/${type}`)}
          className="text-blue-600 hover:text-blue-700"
        >
          Back to {type === 'papers' ? 'Papers' : 'Notes'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(`/${type}`)}
          className="mb-4 text-blue-600 hover:text-blue-700 flex items-center space-x-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to {type === 'papers' ? 'Papers' : 'Notes'}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PDF Preview Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="aspect-4/3 bg-gray-100 rounded-lg overflow-hidden mb-4">
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
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500">PDF Preview</p>
                      <p className="text-sm text-gray-400 mt-1">Preview not available</p>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={handleDownload} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Download PDF
              </button>
            </div>

            {/* Discussion Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiMessageCircle className="w-5 h-5 text-blue-600" />
                Discussion
              </h3>

              {comments.length === 0 && (
                <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
              )}

              {comments.length > 0 && (
                <div className="space-y-4 mb-6">
                  {comments.map((comment, idx) => (
                    <div key={comment._id || comment.id || idx} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">{comment.user.username}</span>
                        <span className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={handlePostComment}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>

          {/* Paper Details Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {resource?.title || resource?.subject?.name || "Resource"}
              </h2>

              <div className="space-y-4 mb-6">
                {/* <div>
                  <span className="text-sm text-gray-500">Year</span>
                  <p className="font-medium text-gray-900">{resource.year}</p>
                </div> */}
                <div>
                  <span className="text-sm text-gray-500">Subject Code</span>
                  <p className="font-medium text-gray-900">
                    {resource?.subject?.code || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Exam Type</span>
                  <p className="font-medium text-gray-900">
                    {resource?.examType || (resource?.unit != null ? `Unit ${resource.unit}` : "N/A")}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center space-x-1 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm">
                    {resource?.likes?.length ?? 0} likes
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="text-sm">
                    {resource?.downloadCount ?? 0} downloads
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors">
                  <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
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

