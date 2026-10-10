import { useLocation } from "react-router-dom";
import { useAppLanguage } from "../hooks/useAppLanguage";
import Breadcrumbs from "./Breadcrumbs";

const pages = {
  "/about": ["nav.aboutUs", "About us"],
  "/contact": ["nav.contact", "Contact us"],
  "/services": ["nav.services", "Services"],
  "/bank-loans": ["nav.bankLoans", "Bank loans"],
  "/plans": ["nav.plans", "Plans"],
  "/post-property": ["nav.postFreeProperty", "Post property"],
  "/request-service": ["services.requestService", "Request a service"],
};

const PageBreadcrumbs = () => {
  const { pathname } = useLocation();
  const { t } = useAppLanguage();
  const page = pages[pathname] || (pathname.startsWith("/edit-property/")
    ? ["propertyDetail.editProperty", "Edit property"] : null);
  if (!page) return null;

  return (
    <div className="page-breadcrumb-bar px-5 sm:px-8 lg:px-10">
      <Breadcrumbs className="mx-auto max-w-[1440px]" items={[
        { label: t("nav.home") || "Home", to: "/" },
        { label: t(page[0]) || page[1] },
      ]} />
    </div>
  );
};

export default PageBreadcrumbs;
