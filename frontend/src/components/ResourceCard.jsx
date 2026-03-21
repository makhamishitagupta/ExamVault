import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { API_BASE, apiFetch, consumePendingAction, setPendingAction, toggleLike } from '../utils/auth';

const ResourceCard = ({ item, type = 'paper', isFavorite: initialFav, onLike: onLikeProp }) => {
  const [isFavorite, setIsFavorite] = useState(initialFav);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item?.likes?.length ?? 0);
  const [liking, setLiking] = useState(false);
  const [shareMessage, setShareMessage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const itemType = type === "paper" ? "Paper" : "Notes";
  const resourceType = type === "paper" ? "paper" : "notes";

  const redirectToLoginWithAction = useCallback((action) => {
    setPendingAction({
      ...action,
      returnTo: location.pathname,
    });
    navigate("/login", { state: { from: location.pathname } });
  }, [location.pathname, navigate]);

  const runFavorite = useCallback(async () => {
    const res = await apiFetch(`/favorite/addFav/${item._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemType }),
    });

    if (res.status === 401) {
      redirectToLoginWithAction({ type: "favorite", itemId: item._id, itemType });
      return;
    }

    const data = await res.json();
    setIsFavorite(data.favorited);
  }, [item._id, itemType, redirectToLoginWithAction]);

  const runDownload = useCallback(async () => {
    const url =
      type === "paper"
        ? `/paper/download/${item._id}`
        : `/notes/download/${item._id}`;

    const res = await apiFetch(url);

    if (res.status === 401) {
      redirectToLoginWithAction({ type: "download", itemId: item._id, resourceType: type });
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
  }, [item._id, redirectToLoginWithAction, type]);

  const runLikeToggle = useCallback(async () => {
    if (liking) return;
    if (onLikeProp) {
      onLikeProp();
      return;
    }
    setLiking(true);
    try {
      const result = await toggleLike({ id: item._id, resourceType });
      if (result.needsAuth) {
        redirectToLoginWithAction({ type: "like", itemId: item._id, resourceType, itemType });
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
  }, [item._id, resourceType, itemType, redirectToLoginWithAction, onLikeProp, liking]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/${type === "paper" ? "paper" : "notes"}/${item._id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title || "Resource",
          url,
          text: item.title || "Check out this resource",
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
  }, [item._id, item.title, type]);

  useEffect(() => {
    setIsFavorite(initialFav);
  }, [initialFav]);

  useEffect(() => {
    setLikeCount(item?.likes?.length ?? 0);
    const uid = (() => {
      try {
        const u = localStorage.getItem("user");
        if (!u) return null;
        const parsed = JSON.parse(u);
        return parsed?._id ?? parsed?.id ?? null;
      } catch { return null; }
    })();
    if (uid && Array.isArray(item?.likes)) {
      const idStr = String(uid);
      const isLikedByUser = item.likes.some((lid) => {
        const lidStr = lid != null ? (lid._id != null ? String(lid._id) : String(lid)) : "";
        return lidStr === idStr;
      });
      setLiked(isLikedByUser);
    } else {
      setLiked(Boolean(item?.isLiked));
    }
  }, [item?._id, item?.likes, item?.isLiked]);

  useEffect(() => {
    if (shareMessage) {
      const t = setTimeout(() => setShareMessage(null), 2000);
      return () => clearTimeout(t);
    }
  }, [shareMessage]);

  useEffect(() => {
    const pending = consumePendingAction();
    if (!pending) return;

    if (pending.returnTo !== location.pathname) {
      setPendingAction(pending);
      return;
    }

    if (pending.type === "favorite" && pending.itemId === item._id) {
      runFavorite();
      return;
    }

    if (pending.type === "download" && pending.itemId === item._id) {
      runDownload();
      return;
    }

    if (pending.type === "like" && pending.itemId === item._id) {
      runLikeToggle();
      return;
    }

    setPendingAction(pending);
  }, [item._id, location.pathname, runDownload, runFavorite, runLikeToggle]);

  const handleFavorite = async (e) => {
    e.preventDefault();

    try {
      await runFavorite();
    } catch (err) {
      console.error("Favorite error", err);
    }
  };

  const handleDownload = async () => {
    await runDownload();
  };

  return (
    <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* Header with Title and Favorite */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">
          {item.title}
        </h3>

        <button
          onClick={handleFavorite}
          className="ml-3 flex-shrink-0 focus:outline-none transition-transform hover:scale-110"
        >
          <svg
            className={`w-6 h-6 transition-all duration-300 ${
              isFavorite
                ? "text-blue-500 fill-blue-500"
                : "text-gray-400 dark:text-gray-500 hover:text-blue-400"
            }`}
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3a2 2 0 00-2 2v16l9-4 9 4V5a2 2 0 00-2-2H5z"
            />
          </svg>
        </button>
      </div>

      {/* Author / Uploaded By */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        By <span className="font-semibold text-gray-900 dark:text-gray-200">{item.uploadedBy?.username ?? item.uploadedBy?.name ?? (typeof item.uploadedBy === "string" ? "—" : "Anonymous")}</span>
      </p>

      {/* Tags Section - Subject code, Subject name, Exam type / Unit */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(item.subject?.code || item.subject?.name) && (
          <>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              {item.subject?.code ?? "—"}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              {item.subject?.name ?? "—"}
            </span>
          </>
        )}
        {type === 'paper' ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
            {item.examType ?? "—"}
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
            Unit {item.unit ?? "—"}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-6 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{item.downloadCount ?? 0} downloads</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{likeCount} likes</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 items-center">
        <Link
          to={`/${type === 'paper' ? 'paper' : 'notes'}/${item._id}`}
          className="flex-1 min-w-0 bg-linear-to-r !text-white from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 font-semibold py-2.5 px-4 rounded-full transition-all duration-300 text-center shadow-md hover:shadow-lg hover:shadow-blue-500/30 transform hover:scale-105"
        >
          View
        </Link>
        <button
          onClick={handleDownload}
          className="flex-1 min-w-0 border-2 border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold py-2.5 px-4 rounded-full transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-500/10"
        >
          Download
        </button>
        <button
          onClick={runLikeToggle}
          disabled={liking}
          className={`p-2.5 rounded-full border-2 transition-all duration-300 flex-shrink-0 ${liked ? "border-red-500/50 text-red-500 bg-red-500/10" : "border-gray-300 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-500 text-gray-600 dark:text-gray-400 hover:text-red-500"} ${liking ? "opacity-60 cursor-not-allowed" : ""}`}
          title="Like"
        >
          <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button
          onClick={handleShare}
          className="p-2.5 rounded-full border-2 border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-all duration-300 flex-shrink-0 relative"
          title="Share"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {shareMessage && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-gray-800 dark:bg-gray-700 text-white text-xs whitespace-nowrap">
              {shareMessage}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;