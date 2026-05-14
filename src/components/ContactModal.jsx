import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ShieldCheckIcon, UserIcon } from "@heroicons/react/24/outline";
import useBodyScrollLock from "../hooks/useBodyScrollLock";

const ContactModal = ({ open, onClose, onSubmit, value, setValue, contact, intentType, user }) => {
  useBodyScrollLock(open);

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center p-3 sm:items-center sm:p-4">
        <DialogPanel className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,245,238,0.94))] shadow-[0_28px_80px_rgba(15,23,42,0.24)] backdrop-blur-xl">
          <div className="overflow-y-auto p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b6b3f]">
                  {intentType === "brochure" ? "Brochure request" : "Contact request"}
                </p>
                <DialogTitle className="mt-2 text-2xl font-bold text-slate-900">
                  {intentType === "brochure" ? "Request property brochure" : "Request owner contact"}
                </DialogTitle>
              </div>
              <div className="rounded-full border border-[#eadbc4] bg-[#fff8ef] p-2 text-[#8b6b3f]">
                <ShieldCheckIcon className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {intentType === "brochure"
                ? "We will send your request so the brochure and project information can be shared with you."
                : "Your contact request will be sent to the property owner for approval before details are revealed."}
            </p>

            {user ? (
              <div className="mt-5 rounded-3xl border border-white/70 bg-white/75 p-4">
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
              <div className="mt-4 flex items-center gap-4 rounded-3xl border border-white/70 bg-white/82 p-4">
                <div className="rounded-full bg-[#fff8ef] p-3 text-[#8b6b3f]">
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
                className="site-input min-h-[120px] resize-none"
                placeholder={
                  intentType === "brochure"
                    ? "I would like to receive the brochure for this property."
                    : "Hi, I am interested in this property. Please share the contact details."
                }
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
