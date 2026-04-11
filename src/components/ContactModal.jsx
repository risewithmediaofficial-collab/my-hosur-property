import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { UserIcon } from "@heroicons/react/24/outline";

const ContactModal = ({ open, onClose, onSubmit, value, setValue, contact, intentType, user }) => (
  <Dialog open={open} onClose={onClose} className="relative z-50">
    <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel className="glass-panel w-full max-w-md rounded-2xl border border-white/70 bg-white/60 p-6 shadow-soft animate-fade-in">
        <DialogTitle className="text-xl font-bold text-ink">
          {intentType === "brochure" ? "Request Property Brochure" : "Contact Request"}
        </DialogTitle>
        
        {user && (
          <div className="mt-4 p-4 bg-sage/5 rounded-xl border border-sage/10 space-y-2">
             <p className="text-[10px] font-bold text-sage uppercase tracking-wider">You are sharing your details</p>
             <div className="flex items-center justify-between text-sm">
                <span className="text-ink/60 font-semibold italic">Name:</span>
                <span className="font-bold text-ink">{user.name}</span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <span className="text-ink/60 font-semibold italic">Mobile:</span>
                <span className="font-bold text-ink">{user.phone}</span>
             </div>
             <p className="text-[9px] text-ink/40 italic">A contact request with these details will be sent to the owner for approval.</p>
          </div>
        )}

        {intentType !== "brochure" && contact && (
          <div className="mt-4 p-4 bg-ink/5 rounded-xl border border-ink/5 flex items-center gap-4">
             <div className="p-3 bg-white rounded-full shadow-sm">
                <UserIcon className="h-6 w-6 text-sage" />
             </div>
             <div>
                <p className="text-sm font-bold text-ink">Requesting from: {contact.name || "Poster"}</p>
                <p className="text-xs text-ink/60">A contact request will be sent for approval.</p>
             </div>
          </div>
        )}

        {intentType === "brochure" ? (
          <p className="mt-2 text-sm text-ink/70">Please provide your details below to receive the property brochure and layout plans.</p>
        ) : (
          <p className="mt-2 text-xs text-ink/60 italic italic">The owner's mobile number will be revealed on the property page once they approve your request.</p>
        )}

        <div className="mt-5">
           <label className="block text-xs font-bold text-ink/70 uppercase mb-2">Send a message (Optional)</label>
           <textarea
            className="soft-input w-full rounded-lg p-3 text-sm border border-clay/40 bg-white/50 focus:bg-white transition-all outline-none"
            rows="3"
            placeholder={intentType === "brochure" ? "I'd like to receive the brochure for this property." : "Hi, I am interested in this property. Please share your contact details."}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="px-5 py-2 text-sm font-bold text-ink/70 hover:bg-stone rounded-lg transition-all" onClick={onClose}>Cancel</button>
          <button className="rounded-lg bg-ink px-6 py-2.5 text-sm font-bold text-stone shadow-md hover:bg-[#2c3e50] transition-all" onClick={onSubmit}>
            {intentType === "brochure" ? "Get Brochure" : "Send Contact Request"}
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
);

export default ContactModal;
