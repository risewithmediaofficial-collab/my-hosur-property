import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { lazy } from "react";

const UserDashboardPage = lazy(() => import("./UserDashboardPage"));
const AgentDashboardPage = lazy(() => import("./AgentDashboardPage"));
const AdminDashboardPage = lazy(() => import("./AdminDashboardPage"));
const CustomerDashboardPage = lazy(() => import("./CustomerDashboardPage"));

const DashboardRouterPage = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/auth" replace />;
  if (["agent", "broker", "seller", "builder"].includes(user.role)) return <AgentDashboardPage />;
  if (user.role === "admin") return <AdminDashboardPage />;
  if (user.role === "customer") return <CustomerDashboardPage />;
  return <UserDashboardPage />;
};

export default DashboardRouterPage;
