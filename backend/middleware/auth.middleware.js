import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const auth = async (req, res, next) => {
  try {
    if (User.db?.readyState !== 1) {
      return res.status(503).json({ message: "Database unavailable" });
    }

    const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "dev_secret_change_me" : null);
    if (!jwtSecret) return res.status(500).json({ message: "Server misconfigured: JWT_SECRET missing" });

    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
    const xAuthToken = req.headers["x-auth-token"];

    // Try JWT first (cookie, Authorization, or x-auth-token)
    const jwtToken = cookieToken || bearerToken || xAuthToken;
    if (jwtToken) {
      try {
        const payload = jwt.verify(jwtToken, jwtSecret);
        const user = await User.findById(payload.sub);
        if (!user) {
          return res.status(401).json({ message: "Invalid token (user not found)" });
        }
        req.user = user;
        return next();
      } catch (jwtErr) {
        // If x-auth-token is a legacy random token, fall through to legacy lookup.
        if (!xAuthToken) throw jwtErr;
      }
    }

    // Backward-compatibility: legacy DB-stored token (x-auth-token only)
    if (xAuthToken) {
      const user = await User.findOne({
        token: xAuthToken,
        tokenExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      req.user = user;
      return next();
    }

    return res.status(401).json({ message: "Authentication required" });
  } catch (err) {
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err?.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    console.error("❌ Auth middleware error:", err);
    res.status(500).json({ message: "Auth middleware error", error: err.message });
  }
};


export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }

  next();
};

export const verifyToken = async (req, res, next) => {
  // Kept for backward compatibility (old code might import verifyToken).
  // Prefer using `auth` which supports JWT + legacy tokens.
  return auth(req, res, next);
};
