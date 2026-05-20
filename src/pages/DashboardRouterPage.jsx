import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import UserDashboardPage from "./UserDashboardPage";
import AgentDashboardPage from "./AgentDashboardPage";
import AdminDashboardPage from "./AdminDashboardPage";
import CustomerDashboardPage from "./CustomerDashboardPage";

const DashboardRouterPage = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/auth" replace />;
  if (["agent", "broker", "seller", "builder"].includes(user.role)) return <AgentDashboardPage />;
  if (user.role === "admin") return <AdminDashboardPage />;
  if (user.role === "customer") return <CustomerDashboardPage />;
  return <UserDashboardPage />;
};

export default DashboardRouterPage;
