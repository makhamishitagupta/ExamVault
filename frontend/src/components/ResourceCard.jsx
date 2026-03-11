import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { API_BASE, apiFetch, consumePendingAction, setPendingAction } from '../utils/auth';

const ResourceCard = ({ item, type = 'paper', isFavorite: initialFav }) => {
  const [isFavorite, setIsFavorite] = useState(initialFav);
  const navigate = useNavigate();
  const location = useLocation();

  const itemType = type === "paper" ? "Paper" : "Notes";

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

  useEffect(() => {
    setIsFavorite(initialFav);
  }, [initialFav]);

  useEffect(() => {
    const pending = consumePendingAction();
    if (!pending) return;

    if (pending.returnTo !== location.pathname) {
      // not for this page, put it back
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

    // Not for this card; restore so another card/page can consume it.
    setPendingAction(pending);
  }, [item._id, location.pathname, runDownload, runFavorite]);

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
    <div className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow border">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold">{item.title}</h3>

        <button onClick={handleFavorite}>
          <svg
            className={`w-5 h-5 ${
              isFavorite ? "text-red-500" : "text-gray-400"
            }`}
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
      {/* <p className="text-sm font-bold text-gray-900 mb-2">
        {} 
      </p> */}

      <p className="text-sm text-gray-600 mb-3">
        Uploaded by {item.uploadedBy?.username}
      </p>

      <div className="flex gap-2 mb-4">
        {type === 'paper' ? (
          <span className="px-2 py-1 bg-gray-100 text-xs rounded">
            {item.examType}
          </span>
        ) : (
          <span className="px-2 py-1 bg-gray-100 text-xs rounded">
            Unit {item.unit}
          </span>
        )}
        <span className="px-2 py-1 bg-gray-100 text-xs rounded">
          {item.subject?.code}
        </span>
        <span className="px-2 py-1 bg-gray-100 text-xs rounded">
          {item.subject?.name}
        </span>
      </div>

      <div className="flex gap-2 mb-2">
        <div className="text-sm text-gray-500 mb-4">
          Downloads: {item.downloadCount}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          Likes: {item.likes.length}
        </div>
      </div>

      <div className="flex space-x-2">
        <Link
          to={`/${type === 'paper' ? 'paper' : 'notes'}/${item._id}`}
          className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700"
        >
          View
        </Link>
        <button onClick={handleDownload} className="flex-1 bg-gray-100 py-2 rounded  hover:bg-blue-400 transition-colors">
          Download
        </button>
      </div>
    </div>
  );
};
export default ResourceCard;