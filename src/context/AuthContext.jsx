import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getProfile } from "../services/api/authApi";
import { AuthContext } from "./authContextValue";

const TOKEN_KEY = "mhp_token";
const USER_KEY = "mhp_user";

const readSession = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY) || "";
    const raw = localStorage.getItem(USER_KEY);
    return { token, user: token && raw ? JSON.parse(raw) : null };
  } catch {
    return { token: "", user: null };
  }
};

const persistSession = (token, user) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // Keep the current session usable when browser storage is disabled.
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(readSession);
  const { token, user } = session;
  const sessionVersion = useRef(0);
  const [loading, setLoading] = useState(Boolean(token));

  const logout = useCallback(() => {
    sessionVersion.current += 1;
    setSession({ token: "", user: null });
    setLoading(false);
    persistSession("", null);
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    const controller = new AbortController();
    const version = sessionVersion.current;
    const isCurrent = () => !controller.signal.aborted && version === sessionVersion.current;
    getProfile(token, controller.signal)
      .then((res) => {
        if (!isCurrent()) return;
        setSession({ token, user: res.user });
        persistSession(token, res.user);
      })
      .catch(() => { if (isCurrent()) logout(); })
      .finally(() => { if (isCurrent()) setLoading(false); });
    return () => controller.abort();
  }, [token, logout]);

  const login = useCallback((payload) => {
    sessionVersion.current += 1;
    setSession({ token: payload.token, user: payload.user });
    setLoading(false);
    persistSession(payload.token, payload.user);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    const version = sessionVersion.current;
    const res = await getProfile(token);
    if (version !== sessionVersion.current) return null;
    setSession({ token, user: res.user });
    persistSession(token, res.user);
    return res.user;
  }, [token]);

  const value = useMemo(
    () => ({ token, user, loading, login, logout, refreshProfile, isAuthenticated: Boolean(token) }),
    [token, user, loading, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
