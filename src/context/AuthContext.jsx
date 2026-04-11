import { useCallback, useEffect, useMemo, useState } from "react";
import { getProfile } from "../services/api/authApi";
import { AuthContext } from "./authContextValue";

const TOKEN_KEY = "mhp_token";
const USER_KEY = "mhp_user";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));

  const logout = () => {
    setToken("");
    setUser(null);
    setLoading(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    getProfile(token)
      .then((res) => {
        setUser(res.user);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [token]);

  const login = (payload) => {
    setToken(payload.token);
    setUser(payload.user);
    setLoading(false);
    localStorage.setItem(TOKEN_KEY, payload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  };

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    const res = await getProfile(token);
    setUser(res.user);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    return res.user;
  }, [token]);

  const value = useMemo(
    () => ({ token, user, loading, login, logout, refreshProfile, isAuthenticated: Boolean(token) }),
    [token, user, loading, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
