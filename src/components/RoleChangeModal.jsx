import { useState } from "react";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { requestRoleChange } from "../services/api/userApi";
import { XMarkIcon } from "./AppIcons";

const roleOptions = [
  { value: "seller", label: "Property Seller / Owner" },
  { value: "agent", label: "Agent / Media" },
  { value: "broker", label: "Developer / Broker" },
  { value: "builder", label: "Builder" },
  { value: "buyer", label: "Property Buyer" },
];

const RoleChangeModal = ({ open, onClose, onSuccess }) => {
  const { user, token, refreshProfile } = useAuth();
  const [requestedRole, setRequestedRole] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestedRole) {
      toast.error("Please select the user type you want to change to.");
      return;
    }
    if (requestedRole === user?.role) {
      toast.error(`You are already registered as ${user.role}. Please select a different user type.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await requestRoleChange(token, { requestedRole, reason });
      toast.success(res.message || "Role change request submitted to Admin!");
      if (refreshProfile) {
        await refreshProfile().catch(() => {});
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit role change request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs transition-all">
      <div className="modal-panel-white flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Request User Type Change</h3>
            <p className="text-xs text-slate-500">Selected wrong role? Request admin to change your account type.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 overflow-y-auto">
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Current User Type: </span>
            <span className="capitalize font-bold text-indigo-700">{user?.role || "User"}</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Select New User Type *
            </label>
            <select
              required
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value)}
              className="site-input w-full rounded-lg border-slate-300 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">-- Choose New User Type --</option>
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.value === user?.role}>
                  {opt.label} {opt.value === user?.role ? "(Current)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Reason for Request (Optional)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Selected Agent by mistake during registration, I am actually a property seller/owner."
              className="site-input w-full rounded-lg border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-1/2 rounded-lg bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {submitting ? "Sending Request..." : "Send to Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleChangeModal;
