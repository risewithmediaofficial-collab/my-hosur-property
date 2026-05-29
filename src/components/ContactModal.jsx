import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ShieldCheckIcon, UserIcon } from "./AppIcons";
import useBodyScrollLock from "../hooks/useBodyScrollLock";

const ContactModal = ({ open, onClose, onSubmit, value, setValue, contact, intentType, user }) => {
  useBodyScrollLock(open);

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Solid dark overlay for contrast on all screens */}
      <div className="fixed inset-0 bg-slate-950/50" aria-hidden="true" />

      {/* Bottom-sheet on mobile, centered on desktop */}
      <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <DialogPanel
          className="modal-panel-white flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl border border-slate-200 shadow-card sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl"
          style={{ background: "#ffffff" }}
        >
          {/* Drag handle indicator on mobile */}
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-slate-200" />
          </div>

          <div className="overflow-y-auto p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  {intentType === "brochure" ? "Brochure request" : "Contact request"}
                </p>
                <DialogTitle className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                  {intentType === "brochure" ? "Request property brochure" : "Request owner contact"}
                </DialogTitle>
              </div>
              <div className="rounded-full border border-slate-200 p-2 text-slate-900" style={{ background: "#f8fafc" }}>
                <ShieldCheckIcon className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {intentType === "brochure"
                ? "We will send your request so the brochure and project information can be shared with you."
                : "Your contact request will be sent to the property owner for approval before details are revealed."}
            </p>

            {user ? (
              <div className="mt-5 rounded-2xl border border-slate-200 p-4" style={{ background: "#f8fafc" }}>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Your shared details</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">Name</p>
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Mobile</p>
                    <p className="text-sm font-semibold text-slate-900">{user.phone}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {intentType !== "brochure" && contact ? (
              <div className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-200 p-4" style={{ background: "#f8fafc" }}>
                <div className="rounded-full border border-slate-200 p-3 text-slate-900" style={{ background: "#ffffff" }}>
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{contact.name || "Poster"}</p>
                  <p className="text-xs text-slate-500">The owner will review your request before contact is shared.</p>
                </div>
              </div>
            ) : null}

            <div className="mt-5">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Message
              </label>
              <textarea
                className="site-input min-h-[100px] resize-none sm:min-h-[120px]"
                style={{ background: "#ffffff" }}
                placeholder={
                  intentType === "brochure"
                    ? "I would like to receive the brochure for this property."
                    : "Hi, I am interested in this property. Please share the contact details."
                }
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 pb-2 sm:mt-6 sm:flex-row sm:justify-end sm:pb-0">
              <button type="button" className="site-button-secondary px-5 py-3 text-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="site-button-primary px-5 py-3 text-sm" onClick={onSubmit}>
                {intentType === "brochure" ? "Send brochure request" : "Send contact request"}
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ContactModal;
