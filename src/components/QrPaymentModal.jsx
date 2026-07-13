import { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ShieldCheckIcon, PhotoIcon, XMarkIcon } from "./AppIcons";
import toast from "react-hot-toast";
import { submitPaymentRequest } from "../services/api/paymentApi";
import qrCodeImage from "../assets/payment qr code .jpeg";

const QrPaymentModal = ({ open, onClose, selectedPlan, user, token, onSuccess }) => {
  const [phone, setPhone] = useState(user?.phone || "");
  const [amountPaid, setAmountPaid] = useState(selectedPlan?.price || "");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [transactionId, setTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedPlan) {
      setAmountPaid(selectedPlan.price || 0);
    }
  }, [selectedPlan]);

  // Sync phone from user when modal opens or user updates
  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  if (!selectedPlan) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone.trim()) {
      return toast.error("Phone number is required");
    }
    if (!amountPaid || Number(amountPaid) <= 0) {
      return toast.error("Please enter a valid amount paid");
    }
    if (!transactionId.trim()) {
      return toast.error("Transaction ID / UTR Number is required");
    }
    if (!paymentDate) {
      return toast.error("Payment Date is required");
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", user?.name || "");
      formData.append("email", user?.email || "");
      formData.append("phone", phone);
      formData.append("selectedPlan", selectedPlan.name);
      formData.append("amountPaid", amountPaid);
      formData.append("transactionId", transactionId);
      formData.append("paymentMethod", paymentMethod);
      formData.append("paymentDate", paymentDate);
      if (screenshot) {
        formData.append("screenshot", screenshot);
      }

      await submitPaymentRequest(token, formData);
      toast.success("Payment verification request submitted successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit payment request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" aria-hidden="true" />

      {/* Main modal alignment container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="modal-panel-white flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Payment Gate (Manual)
              </p>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Buy Plan - {selectedPlan.name}
              </DialogTitle>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto px-6 py-6 space-y-6">
            
            {/* QR Code and instructions */}
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-blue-50 bg-blue-50/30 p-5 text-center">
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-md max-w-[220px] transition-transform duration-300 hover:scale-105">
                <img
                  src={qrCodeImage}
                  alt="Payment QR Code"
                  className="h-full w-full object-contain rounded-lg"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Scan this QR Code using any UPI App
                </p>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">
                  After completing the payment, fill out the payment verification form below to submit details for approval.
                </p>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">
                  User Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user?.name || ""}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="soft-input w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">
                  Payment Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                      Selected Plan
                    </label>
                    <input
                      type="text"
                      disabled
                      value={selectedPlan.name}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Amount Paid (INR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="Amount paid"
                      className="soft-input w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="soft-input w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Google Pay">Google Pay</option>
                      <option value="PhonePe">PhonePe</option>
                      <option value="Paytm">Paytm</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Payment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="soft-input w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Transaction ID / UTR Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter UTR or UPI transaction reference"
                    className="soft-input w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Screenshot Uploader */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Payment Screenshot (Optional)
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center cursor-pointer transition-colors ${
                      dragOver
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-slate-300 hover:border-blue-400 bg-slate-50/50"
                    }`}
                    onClick={() => document.getElementById("screenshot-upload-input").click()}
                  >
                    <input
                      id="screenshot-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {screenshotPreview ? (
                      <div className="relative max-h-36 max-w-full">
                        <img
                          src={screenshotPreview}
                          alt="Screenshot Preview"
                          className="max-h-36 rounded-lg object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setScreenshot(null);
                            setScreenshotPreview(null);
                          }}
                          className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <PhotoIcon className="h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-xs text-slate-600">
                          Drag & drop or click to upload screenshot
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">
                          PNG, JPG, or WEBP up to 5MB
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-slate-100 pt-5 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="site-button-primary rounded-xl px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Payment"}
                </button>
              </div>
            </form>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default QrPaymentModal;
