import { memo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_NUMBERS,
  SOCIAL_LINKS,
} from "../constants/contactInfo";
import BrandLogo from "./BrandLogo";
import LanguageSelector from "./LanguageSelector";
import useMediaQuery from "../hooks/useMediaQuery";
import useScrollToTop from "../hooks/useScrollToTop";
import { useAppLanguage } from "../hooks/useAppLanguage";
import {
  ChevronDownIcon,
  EnvelopeIcon,
  FacebookIcon,
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  ThreadsIcon,
  WhatsAppIcon,
  XIcon,
  YouTubeIcon,
} from "./AppIcons";
import "../styles/footer.css";

const socialLinks = [
  ["instagram", "Instagram", InstagramIcon],
  ["facebook", "Facebook", FacebookIcon],
  ["youtube", "YouTube", YouTubeIcon],
  ["threads", "Threads", ThreadsIcon],
  ["x", "X (Twitter)", XIcon],
  ["whatsapp", "WhatsApp", WhatsAppIcon],
];

const locationLinks = [
  ["Anand Nagar Plots", "anand-nagar-plots"],
  ["Bagalur Road Property", "bagalur-road-property"],
  ["Mathigiri Plots", "mathigiri-plots"],
  ["Mookandapalli Property", "mookandapalli-property"],
  ["Zuzuvadi Land", "zuzuvadi-land"],
  ["Shoolagiri Property", "shoolagiri-property"],
  ["Rayakottai Road Plots", "rayakottai-road-plots"],
  ["Hosur SIPCOT Property", "hosur-sipcot-property"],
  ["TVS Nagar Plots", "tvs-nagar-plots"],
  ["Titan Township Property", "titan-township-property"],
  ["Denkanikottai Road Land", "denkanikottai-road-land"],
  ["Chennathur Plots", "chennathur-plots"],
  ["Kelamangalam Road Property", "kelamangalam-road-property"],
  ["Avalapalli Land", "avalapalli-land"],
  ["DTCP Plots Bagalur Road", "dtcp-plots-bagalur-road"],
  ["Villas in Mathigiri", "villas-in-mathigiri"],
  ["Land near SIPCOT Hosur", "land-near-sipcot-hosur"],
  ["Best Real Estate Company in Hosur", "best-real-estate-company-in-hosur"],
  ["Trusted Property Dealer in Hosur", "trusted-property-dealer-in-hosur"],
];

const Footer = () => {
  const { t } = useAppLanguage();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [quickLinksOpen, setQuickLinksOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const scrollToTop = useScrollToTop();
  const quickLinks = [
    ["nav.home", "Home", "/"],
    ["nav.services", "Our Services", "/services"],
    ["nav.bankLoans", "Bank Loans", "/bank-loans"],
    ["nav.plans", "Plans", "/plans"],
    ["nav.aboutUs", "About Us", "/about"],
    ["nav.contact", "Contact Us", "/contact"],
    ["nav.postFreeProperty", "Post Property", "/post-property"],
    ["search.tabBuy", "Buy Property", "/listings?intent=buy"],
    ["search.tabRent", "Rent Property", "/listings?intent=rent"],
    ["search.tabProjects", "New Projects", "/listings?intent=new-project"],
  ];

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-brand-heading">
              <BrandLogo className="footer-logo" />
              <div>
                <p className="footer-partner">{t("footer.partnerText")}</p>
                <p className="footer-powered">{t("nav.poweredBy")} {t("nav.companyName")}</p>
              </div>
            </div>
            <p className="footer-bio">{t("footer.brandBio")}</p>
            <nav className="footer-socials" aria-label={t("footer.followUs")}>
              {socialLinks.map(([key, label, Icon]) => (
                <a key={key} href={SOCIAL_LINKS[key]} target="_blank" rel="noopener noreferrer" title={label} aria-label={label}>
                  <Icon aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>

          <details className="footer-quick-links" open={isDesktop || quickLinksOpen} onToggle={event => {
            if (!isDesktop) setQuickLinksOpen(event.currentTarget.open);
          }}>
            <summary><span>{t("footer.quickLinks")}</span><ChevronDownIcon aria-hidden="true" /></summary>
            <nav className="footer-link-grid" aria-label="Footer navigation">
              {quickLinks.map(([key, fallback, to]) => (
                <NavLink key={to} to={to} onClick={scrollToTop}>{t(key, { defaultValue: fallback })}</NavLink>
              ))}
            </nav>
          </details>

          <details className="footer-contact" open={isDesktop || contactOpen} onToggle={event => {
            if (!isDesktop) setContactOpen(event.currentTarget.open);
          }}>
            <summary><span>{t("nav.contact")}</span><ChevronDownIcon aria-hidden="true" /></summary>
            <div className="footer-contact-content">
              <a href={`mailto:${CONTACT_EMAIL}`} className="footer-email"><EnvelopeIcon aria-hidden="true" /><span>{CONTACT_EMAIL}</span></a>
              <div className="footer-phones">
                {CONTACT_PHONE_NUMBERS.map(phone => (
                  <a key={phone.tel} href={`tel:${phone.tel}`} title={phone.role}><PhoneIcon aria-hidden="true" /><span>{phone.display}</span></a>
                ))}
              </div>
              <address><MapPinIcon aria-hidden="true" /><span>{CONTACT_ADDRESS}</span></address>
              <a className="footer-whatsapp" href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" title="Chat with our team directly on WhatsApp for quick support.">
                <WhatsAppIcon aria-hidden="true" />{t("common.whatsApp")}
                <span>{t("footer.whatsAppSupport", { defaultValue: "Chat with our team" })}</span>
              </a>
            </div>
          </details>
        </div>

        <details className="footer-locations">
          <summary><span>Hosur locations &amp; property guides</span><ChevronDownIcon aria-hidden="true" /></summary>
          <nav className="footer-location-grid" aria-label="Hosur property locations">
            {locationLinks.map(([name, slug]) => (
              <NavLink key={slug} to={`/location/${slug}`} onClick={scrollToTop}>{name}</NavLink>
            ))}
          </nav>
        </details>

        <div className="footer-preferences">
          <LanguageSelector variant="footerCompact" className="footer-language" />
          <p>{t("footer.serving")}</p>
        </div>

        <div className="footer-bottom">
          <div className="footer-credits">
            <p>Copyright {new Date().getFullYear()} MyHosurProperty. {t("footer.allRightsReserved")}</p>
            <p>Developed with <a href="https://risewithmedia.com" target="_blank" rel="noopener noreferrer">risewithmedia.com</a></p>
          </div>
          <nav aria-label="Footer account and information">
            {[["nav.aboutUs", "/about"], ["nav.contact", "/contact"], ["hero.exploreProperties", "/listings"], ["nav.login", "/auth"]].map(([key, to]) => (
              <NavLink key={to} to={to} onClick={scrollToTop}>{t(key)}</NavLink>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
