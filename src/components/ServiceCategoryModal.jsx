import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, ChevronDownIcon, XMarkIcon } from "./AppIcons";
import useBodyScrollLock from "../hooks/useBodyScrollLock";

const ServiceCategoryModal = ({ category, onClose }) => {
  useBodyScrollLock(Boolean(category));
  const [expandedService, setExpandedService] = useState(null);

  if (!category) return null;

  const CategoryIcon = category.icon;

  return (
    <Dialog open={Boolean(category)} onClose={onClose} className="relative z-[80]">
      <div className="fixed inset-0 bg-slate-950/50" aria-hidden="true" />

      <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <DialogPanel className="modal-panel-white flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl border border-slate-200 shadow-card sm:max-h-[min(640px,calc(100dvh-2rem))] sm:rounded-xl">
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-slate-200" />
          </div>

          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-navy text-white">
                <CategoryIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange">Service details</p>
                <DialogTitle className="mt-1 text-lg font-bold leading-tight text-navy sm:text-xl">{category.title}</DialogTitle>
                <p className="mt-1 text-sm leading-6 text-slate-600">{category.description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-surface hover:text-navy"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <ul className="space-y-2">
              {category.services.map((service) => {
                const ServiceIcon = service.icon;
                const isExpanded = expandedService === service.label;

                if (service.subItems?.length) {
                  return (
                    <li key={service.label} className="rounded-xl border border-orange/30 bg-orange/5 p-2 transition">
                      <button
                        type="button"
                        onClick={() => setExpandedService(isExpanded ? null : service.label)}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-orange/10"
                      >
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange/20 text-orange">
                          <ServiceIcon className="h-4 w-4" />
                        </div>
                        <span className="min-w-0 flex-1 text-sm font-extrabold leading-snug text-navy">
                          {service.label} <span className="text-xs font-bold text-orange">(Click to view plans)</span>
                        </span>
                        <ChevronDownIcon className={`h-4 w-4 text-orange transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      {/* Expanded Sub-items List */}
                      {isExpanded ? (
                        <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-orange/40 ml-4 pb-1">
                          {service.subItems.map((subItem) => {
                            const SubIcon = subItem.icon || ServiceIcon;
                            return (
                              <Link
                                key={subItem.label}
                                to={subItem.requestPath}
                                onClick={onClose}
                                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-navy shadow-xs transition hover:border-orange hover:bg-orange/10 hover:text-orange"
                              >
                                <span className="flex items-center gap-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded bg-orange/10 text-orange">
                                    <SubIcon className="h-3.5 w-3.5" />
                                  </div>
                                  <span>{subItem.label}</span>
                                </span>
                                <ArrowRightIcon className="h-3.5 w-3.5 text-slate-400" />
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </li>
                  );
                }

                const content = (
                  <>
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange/10 text-orange">
                      <ServiceIcon className="h-4 w-4" />
                    </div>
                    <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-navy">{service.label}</span>
                    {service.requestPath ? <ArrowRightIcon className="h-4 w-4 flex-shrink-0 text-slate-400" /> : null}
                  </>
                );

                if (service.requestPath) {
                  return (
                    <li key={service.label}>
                      <Link
                        to={service.requestPath}
                        onClick={onClose}
                        className="flex w-full items-center gap-3 rounded-lg border border-slate-100 bg-surface px-3 py-3 transition hover:border-orange hover:bg-orange/5"
                      >
                        {content}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={service.label}>
                    <div className="flex w-full items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 py-3">
                      {content}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
            <Link
              to="/contact"
              onClick={onClose}
              className="site-button-primary inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold"
            >
              Request this service
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ServiceCategoryModal;
