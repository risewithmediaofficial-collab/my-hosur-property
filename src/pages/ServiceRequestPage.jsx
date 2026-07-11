import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { BuildingOffice2Icon, ClipboardDocumentCheckIcon, CurrencyRupeeIcon, WrenchScrewdriverIcon } from "../components/AppIcons";
import SeoHead from "../components/SeoHead";
import useAuth from "../hooks/useAuth";
import { createCustomerRequest } from "../services/api/customerRequestApi";
import { SERVICE_REQUEST_CATEGORY_LIST, SERVICE_REQUEST_OPTIONS } from "../constants/serviceRequests";

const initialForm = {
  city: "Hosur",
  area: "",
  budgetMin: "",
  budgetMax: "",
  additionalRequirements: "",
};

const ServiceRequestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, user } = useAuth();

  const categoryFromQuery = searchParams.get("category") || "loan";
  const typeFromQuery = searchParams.get("type") || "";

  const defaultOption = SERVICE_REQUEST_OPTIONS[categoryFromQuery] || SERVICE_REQUEST_OPTIONS.loan;
  const defaultPropertyType = defaultOption.propertyTypes?.[0] || "";
  const defaultServiceType = defaultOption.serviceTypes?.includes(typeFromQuery)
    ? typeFromQuery
    : defaultOption.serviceTypes?.[0] || "";

  const [form, setForm] = useState(initialForm);
  const [requestCategory, setRequestCategory] = useState(defaultOption.requestCategory);
  const [propertyType, setPropertyType] = useState(defaultPropertyType);
  const [serviceType, setServiceType] = useState(defaultServiceType);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const nextOption = SERVICE_REQUEST_OPTIONS[categoryFromQuery] || SERVICE_REQUEST_OPTIONS.loan;
    setRequestCategory(nextOption.requestCategory);
    setPropertyType(nextOption.propertyTypes?.[0] || "");
    setServiceType(nextOption.serviceTypes?.includes(typeFromQuery) ? typeFromQuery : nextOption.serviceTypes?.[0] || "");
  }, [categoryFromQuery, typeFromQuery]);

  const currentOption = useMemo(
    () => SERVICE_REQUEST_OPTIONS[requestCategory] || SERVICE_REQUEST_OPTIONS.loan,
    [requestCategory]
  );

  const categoryTitle = currentOption.label;
  const showPropertyType = Boolean(currentOption.propertyTypes?.length);
  const showServiceType = Boolean(currentOption.serviceTypes?.length);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.city.trim() || !form.area.trim()) {
      toast.error("City and area are required");
      return;
    }

    if (showPropertyType && !propertyType) {
      toast.error("Please choose the property type");
      return;
    }

    if (showServiceType && !serviceType) {
      toast.error("Please choose the service type");
      return;
    }

    try {
      setSubmitting(true);
      await createCustomerRequest(token, {
        requestCategory,
        propertyType: showPropertyType ? propertyType : undefined,
        serviceType: showServiceType ? serviceType : undefined,
        location: {
          city: form.city.trim(),
          area: form.area.trim(),
        },
        budgetMin: Number(form.budgetMin || 0),
        budgetMax: Number(form.budgetMax || 0),
        additionalRequirements: form.additionalRequirements.trim(),
      });
      toast.success("Request sent to admin successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-shell w-full px-4 py-8 sm:px-5 md:py-12 lg:px-6">
      <SeoHead
        title={`${categoryTitle} Request | MyHosurProperty`}
        description={`Submit your ${categoryTitle.toLowerCase()} request on MyHosurProperty and let our admin team contact you.`}
      />

      <section className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <div className="marketing-card p-8 md:p-10">
          <p className="section-tag">Logged-in service desk</p>
          <h1 className="mt-3 text-3xl font-bold text-navy md:text-4xl lg:text-5xl">{categoryTitle} request</h1>
          <p className="mt-4 max-w-xl text-sm leading-8 text-slate-600">
            Submit what you need, and the request will go straight to admin so your team can contact you quickly with the right next steps.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="stat-card">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-orange" />
              <p className="mt-3 text-sm font-bold text-navy">Admin tracked</p>
              <p className="mt-1 text-xs leading-6 text-slate-600">Every request is stored in the admin dashboard.</p>
            </div>
            <div className="stat-card">
              <BuildingOffice2Icon className="h-6 w-6 text-orange" />
              <p className="mt-3 text-sm font-bold text-navy">Hosur focused</p>
              <p className="mt-1 text-xs leading-6 text-slate-600">Share area and requirement details for better follow-up.</p>
            </div>
            <div className="stat-card">
              <WrenchScrewdriverIcon className="h-6 w-6 text-orange" />
              <p className="mt-3 text-sm font-bold text-navy">Service ready</p>
              <p className="mt-1 text-xs leading-6 text-slate-600">Loan, interior, construction, buy, sell, and rent requests all work here.</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="marketing-card p-6 md:p-8">
          <div className="flex flex-wrap gap-2">
            {SERVICE_REQUEST_CATEGORY_LIST.map((item) => (
              <button
                key={item.requestCategory}
                type="button"
                onClick={() => {
                  setRequestCategory(item.requestCategory);
                  setPropertyType(item.propertyTypes?.[0] || "");
                  setServiceType(item.serviceTypes?.[0] || "");
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  requestCategory === item.requestCategory
                    ? "bg-orange text-white"
                    : "border border-slate-200 bg-white text-navy hover:border-orange hover:text-orange"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">City</span>
              <input
                className="site-input"
                value={form.city}
                onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                placeholder=" "
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Area</span>
              <input
                className="site-input"
                value={form.area}
                onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))}
                placeholder=" "
              />
            </label>

            {showPropertyType ? (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Property type</span>
                <select className="site-input" value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>
                  {currentOption.propertyTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {showServiceType ? (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Service type</span>
                <select className="site-input" value={serviceType} onChange={(event) => setServiceType(event.target.value)}>
                  {currentOption.serviceTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">{currentOption.budgetLabel} min</span>
              <div className="relative">
                <CurrencyRupeeIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="site-input pl-10"
                  type="number"
                  min="0"
                  value={form.budgetMin}
                  onChange={(event) => setForm((prev) => ({ ...prev, budgetMin: event.target.value }))}
                  placeholder=" "
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">{currentOption.budgetLabel} max</span>
              <div className="relative">
                <CurrencyRupeeIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="site-input pl-10"
                  type="number"
                  min="0"
                  value={form.budgetMax}
                  onChange={(event) => setForm((prev) => ({ ...prev, budgetMax: event.target.value }))}
                  placeholder=" "
                />
              </div>
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Additional details</span>
            <textarea
              className="site-input min-h-[150px]"
              value={form.additionalRequirements}
              onChange={(event) => setForm((prev) => ({ ...prev, additionalRequirements: event.target.value }))}
              placeholder={`Tell us more about your ${categoryTitle.toLowerCase()} requirement`}
            />
          </label>

          <div className="mt-6 rounded-xl border border-slate-200 bg-surface p-4 text-sm text-slate-600">
            Requesting as <span className="font-semibold text-navy">{user?.name || "User"}</span>. Admin will use your registered phone and email to follow up.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="site-button-primary mt-6 inline-flex w-full items-center justify-center rounded-lg px-5 py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting request..." : "Submit request"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default ServiceRequestPage;
