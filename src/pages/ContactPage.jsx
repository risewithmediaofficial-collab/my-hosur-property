import { EnvelopeIcon, MapPinIcon, PhoneIcon } from "../components/AppIcons";
import MarketingCard, { IconCircle } from "../components/MarketingCard";
import PageHero from "../components/PageHero";
import PageSection from "../components/PageSection";
import SeoHead from "../components/SeoHead";
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "../constants/contactInfo";
import { buildBreadcrumbSchema, buildRealEstateAgentSchema } from "../utils/seo";

const contactCards = [
  {
    title: "Email us",
    value: CONTACT_EMAIL,
    caption: "For property enquiries, support, and service requests.",
    icon: EnvelopeIcon,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    title: "Call us",
    value: CONTACT_PHONE_DISPLAY,
    caption: "Speak with our team for direct real-estate assistance.",
    icon: PhoneIcon,
    href: `tel:${CONTACT_PHONE_TEL}`,
  },
  {
    title: "Visit us",
    value: CONTACT_ADDRESS,
    caption: "Serving local property buyers, sellers, and service needs.",
    icon: MapPinIcon,
    href: null,
  },
];

const ContactPage = () => {
  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <main className="page-shell w-full">
      <SeoHead
        title="Contact MyHosurProperty"
        description="Contact MyHosurProperty for property assistance, real-estate services, and verified listing support in Hosur."
        keywords="contact MyHosurProperty, Hosur property contact, real estate contact Hosur"
        canonicalPath="/contact"
        schema={[buildRealEstateAgentSchema(), buildBreadcrumbSchema(breadcrumbs)]}
      />

      <PageHero
        tag="Contact us"
        title="Talk to My Hosur Property."
        description="Reach our team for property discovery, buying and selling support, registration help, loans, construction coordination, and local real-estate services."
      />

      <PageSection tag="Get in touch" title="We are here to help with your property needs">
        <div className="grid gap-6 md:grid-cols-3">
          {contactCards.map((item) => {
            const Icon = item.icon;
            const card = (
              <MarketingCard className="h-full">
                <IconCircle>
                  <Icon className="h-6 w-6" />
                </IconCircle>
                <h2 className="mt-5 text-xl font-bold text-navy">{item.title}</h2>
                <p className="mt-3 text-lg font-semibold text-navy">{item.value}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.caption}</p>
              </MarketingCard>
            );

            if (item.href) {
              return (
                <a key={item.title} href={item.href} className="block h-full">
                  {card}
                </a>
              );
            }

            return <div key={item.title}>{card}</div>;
          })}
        </div>
      </PageSection>
    </main>
  );
};

export default ContactPage;
