import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CurrencyRupeeIcon } from "../components/AppIcons";
import SeoHead from "../components/SeoHead";
import useAuth from "../hooks/useAuth";
import { createCustomerRequest } from "../services/api/customerRequestApi";
import { BANK_OPTIONS, SERVICE_REQUEST_CATEGORY_LIST, SERVICE_REQUEST_OPTIONS } from "../constants/serviceRequests";

// Import service images from assets
import buyGuidanceImg from "../assets/property buy guideance.jpg";
import sellGuidanceImg from "../assets/property sell guidance.jpg";
import houseImg from "../assets/house.png";
import commercialImg from "../assets/commerical.jpg";
import plotSearchImg from "../assets/plot search.jpg";
import homeLoanImg from "../assets/Home loan.jpg";
import plotLoanImg from "../assets/Plot loa.jpg";
import agricultureLoanImg from "../assets/Agriculture loan.jpg";
import registrationImg from "../assets/Sale deed registration.jpg";
import pattaImg from "../assets/patta.jpg";
import landSurveyImg from "../assets/Land survey.jpg";
import interiorsImg from "../assets/interiros.jpg";
import constructionImg from "../assets/contarcts works.jpg";
import applianceServiceImg from "../assets/pankaj-ac-and-homeappliances-repair-centre-rama-mandi-chowk-jalandhar-ac-installation-services-p9tplahzyn.avif";
import cleaningServiceImg from "../assets/toilet-washroom-cleaning-service.jpg.jpeg";
import carpentryServiceImg from "../assets/shreya-interior-work-govindpura-bhopal-carpenters-5e67m81n6x.avif";

const getServiceImageDetails = (category, serviceType = "", propertyType = "") => {
  const sType = (serviceType || "").toLowerCase();
  const pType = (propertyType || "").toLowerCase();

  switch (category) {
    case "property_buy":
      if (pType.includes("plot") || pType.includes("land")) {
        return { image: plotSearchImg, badge: "Plot & Land", caption: "Verified Plots & Land in Hosur" };
      }
      if (pType.includes("commercial") || pType.includes("office") || pType.includes("warehouse")) {
        return { image: commercialImg, badge: "Commercial Property", caption: "Premium Commercial Spaces" };
      }
      if (sType.includes("deed") || sType.includes("legal") || sType.includes("agreement")) {
        return { image: registrationImg, badge: "Registration & Legal", caption: "Legal Verification & Registration Support" };
      }
      if (sType.includes("patta")) {
        return { image: pattaImg, badge: "Patta Transfer", caption: "Fast & Reliable Patta Transfer Services" };
      }
      if (sType.includes("survey")) {
        return { image: landSurveyImg, badge: "Land Survey", caption: "Professional Land Measurement & Survey" };
      }
      return { image: buyGuidanceImg, badge: "Buy Guidance", caption: "Expert Guidance to Buy Your Ideal Property" };

    case "property_sell":
      if (pType.includes("plot") || pType.includes("land")) {
        return { image: plotSearchImg, badge: "Plot Sale", caption: "Sell Your Plot with Best Market Value" };
      }
      if (pType.includes("commercial") || pType.includes("office") || pType.includes("warehouse")) {
        return { image: commercialImg, badge: "Commercial Sale", caption: "Sell Commercial Real Estate Fast" };
      }
      return { image: sellGuidanceImg, badge: "Sell Guidance", caption: "Get Maximum Value for Your Property" };

    case "property_rent":
      if (pType.includes("commercial") || pType.includes("office") || pType.includes("warehouse") || pType.includes("industrial")) {
        return { image: commercialImg, badge: "Commercial Rent", caption: "Commercial Spaces & Warehouses for Rent" };
      }
      return { image: houseImg, badge: "Residential Rent", caption: "Find Homes & Apartments for Rent in Hosur" };

    case "loan":
      if (sType.includes("plot")) {
        return { image: plotLoanImg, badge: "Plot Loan", caption: "Lowest Interest Rates on Plot Loans" };
      }
      if (sType.includes("agriculture")) {
        return { image: agricultureLoanImg, badge: "Agriculture Loan", caption: "Hassle-free Agricultural & Land Financing" };
      }
      return { image: homeLoanImg, badge: "Home & Personal Loan", caption: "Quick Approval Home Loan Solutions" };

    case "interior":
      if (sType.includes("carpentry") || sType.includes("office")) {
        return { image: carpentryServiceImg, badge: "Interior & Carpentry", caption: "Custom Carpentry & Interior Work" };
      }
      return { image: interiorsImg, badge: "Home Interiors", caption: "Modern Interior Designs for Beautiful Homes" };

    case "construction":
      return { image: constructionImg, badge: "Construction Services", caption: "Quality House & Commercial Building Construction" };

    case "property_management":
      if (sType.includes("land") || sType.includes("garden")) {
        return { image: landSurveyImg, badge: "Land & Garden Maintenance", caption: "Landscaping & Lawn Maintenance" };
      }
      if (sType.includes("nri") || sType.includes("amc") || sType.includes("facility")) {
        return { image: pattaImg, badge: "Facility AMC & Management", caption: "Comprehensive Property & Facility Management" };
      }
      return { image: landSurveyImg, badge: "Property Management", caption: "Dedicated Maintenance & Asset Care in Hosur" };

    case "home_office_services":
      if (sType.includes("clean") || sType.includes("tank") || sType.includes("sump") || sType.includes("sofa")) {
        return { image: cleaningServiceImg, badge: "Deep Cleaning", caption: "Professional Cleaning Services" };
      }
      if (sType.includes("appliance") || sType.includes("electrical") || sType.includes("plumbing")) {
        return { image: applianceServiceImg, badge: "Appliance & Utility Care", caption: "Expert Appliance, Electrical & Plumbing Service" };
      }
      if (sType.includes("carpentry") || sType.includes("painting") || sType.includes("interior")) {
        return { image: carpentryServiceImg, badge: "Carpentry & Repairs", caption: "Quality Woodwork & Painting Services" };
      }
      return { image: applianceServiceImg, badge: "Home & Office Care", caption: "Reliable Service Support for Home & Office" };

    default:
      return { image: buyGuidanceImg, badge: "Property Service", caption: "Trusted Real Estate Services in Hosur" };
  }
};

const initialForm = {
  city: "Hosur",
  area: "",
  selectedBank: BANK_OPTIONS[0],
  budget: "",
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

  const bankFromQuery = searchParams.get("bank") || "";

  useEffect(() => {
    const nextOption = SERVICE_REQUEST_OPTIONS[categoryFromQuery] || SERVICE_REQUEST_OPTIONS.loan;
    setRequestCategory(nextOption.requestCategory);
    setPropertyType(nextOption.propertyTypes?.[0] || "");
    setServiceType(nextOption.serviceTypes?.includes(typeFromQuery) ? typeFromQuery : nextOption.serviceTypes?.[0] || "");
    if (bankFromQuery && BANK_OPTIONS.includes(bankFromQuery)) {
      setForm((prev) => ({ ...prev, selectedBank: bankFromQuery }));
    }
  }, [categoryFromQuery, typeFromQuery, bankFromQuery]);

  const currentOption = useMemo(
    () => SERVICE_REQUEST_OPTIONS[requestCategory] || SERVICE_REQUEST_OPTIONS.loan,
    [requestCategory]
  );

  const categoryTitle = currentOption.label;
  const showPropertyType = Boolean(currentOption.propertyTypes?.length);
  const showServiceType = Boolean(currentOption.serviceTypes?.length);

  const imageDetails = useMemo(
    () => getServiceImageDetails(requestCategory, serviceType, propertyType),
    [requestCategory, serviceType, propertyType]
  );

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
      const reqNotes = [
        currentOption.showBankDropdown ? `Preferred Bank: ${form.selectedBank}` : "",
        form.additionalRequirements.trim(),
      ].filter(Boolean).join("\n");

      const budgetValue = currentOption.showBudget !== false ? Number(form.budget || 0) : 0;

      await createCustomerRequest(token, {
        requestCategory,
        propertyType: showPropertyType ? propertyType : undefined,
        serviceType: showServiceType ? serviceType : undefined,
        location: {
          city: form.city.trim(),
          area: form.area.trim(),
        },
        budgetMin: budgetValue,
        budgetMax: budgetValue,
        additionalRequirements: reqNotes,
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
        <div className="marketing-card p-6 sm:p-8 md:p-10">
          <div>
            <p className="section-tag">Logged-in service desk</p>
            <h1 className="mt-3 text-3xl font-bold text-navy md:text-4xl lg:text-5xl">{categoryTitle} request</h1>
            <p className="mt-4 max-w-xl text-sm leading-8 text-slate-600">
              Submit what you need, and the request will go straight to admin so your team can contact you quickly with the right next steps.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300">
            <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 w-full overflow-hidden bg-slate-100">
              <img
                src={imageDetails.image}
                alt={`${categoryTitle} Service`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white">
                <span className="inline-block rounded-md bg-orange px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm mb-2 w-fit">
                  {imageDetails.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-bold leading-snug text-white drop-shadow-sm">
                  {imageDetails.caption}
                </h3>
              </div>
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
                    : "border border-slate-200 bg-white text-slate-800 hover:border-orange hover:bg-orange hover:text-white"
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

            {currentOption.showBankDropdown ? (
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Select Bank (Bank Preference)</span>
                <select
                  className="site-input font-bold text-navy"
                  value={form.selectedBank}
                  onChange={(event) => setForm((prev) => ({ ...prev, selectedBank: event.target.value }))}
                >
                  {BANK_OPTIONS.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

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

            {currentOption.showBudget !== false ? (
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">{currentOption.budgetLabel || "Budget"}</span>
                <div className="relative">
                  <CurrencyRupeeIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className="site-input pl-10"
                    type="number"
                    min="0"
                    value={form.budget}
                    onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))}
                    placeholder=" "
                  />
                </div>
              </label>
            ) : null}
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
