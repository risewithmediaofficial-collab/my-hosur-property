import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ShieldCheckIcon, UserIcon } from "@heroicons/react/24/outline";

const ContactModal = ({ open, onClose, onSubmit, value, setValue, contact, intentType, user }) => (
  <Dialog open={open} onClose={onClose} className="relative z-50">
    <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
              {intentType === "brochure" ? "Brochure request" : "Contact request"}
            </p>
            <DialogTitle className="mt-2 text-2xl font-bold text-slate-900">
              {intentType === "brochure" ? "Request property brochure" : "Request owner contact"}
            </DialogTitle>
          </div>
          <div className="rounded-full bg-slate-100 p-2 text-slate-500">
            <ShieldCheckIcon className="h-5 w-5" />
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {intentType === "brochure"
            ? "We will send your request so the brochure and project information can be shared with you."
            : "Your contact request will be sent to the property owner for approval before details are revealed."}
        </p>

        {user ? (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
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
          <div className="mt-4 flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4">
            <div className="rounded-full bg-slate-100 p-3 text-slate-600">
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
      </DialogPanel>
    </div>
  </Dialog>
);

export default ContactModal;
