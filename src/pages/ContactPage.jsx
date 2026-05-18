import { motion } from "framer-motion";
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import Breadcrumbs from "../components/Breadcrumbs";
import SeoHead from "../components/SeoHead";
import { buildBreadcrumbSchema, buildRealEstateAgentSchema } from "../utils/seo";

const MotionSection = motion.section;

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const contactCards = [
  {
    title: "Email us",
    value: "support@myhosurproperty.com",
    caption: "For property enquiries, support, and service requests.",
    icon: EnvelopeIcon,
    href: "mailto:support@myhosurproperty.com",
  },
  {
    title: "Call us",
    value: "+91 98765 43210",
    caption: "Speak with our team for direct real-estate assistance.",
    icon: PhoneIcon,
    href: "tel:+919876543210",
  },
  {
    title: "Visit us",
    value: "Hosur, Tamil Nadu",
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
    <main className="w-full space-y-6 px-4 py-6 sm:px-5 md:space-y-8 md:py-8 lg:px-6">
      <SeoHead
        title="Contact MyHosurProperty"
        description="Contact MyHosurProperty for property assistance, real-estate services, and verified listing support in Hosur."
        keywords="contact MyHosurProperty, Hosur property contact, real estate contact Hosur"
        canonicalPath="/contact"
        schema={[buildRealEstateAgentSchema(), buildBreadcrumbSchema(breadcrumbs)]}
      />

      <Breadcrumbs items={breadcrumbs} className="px-1" />

      <MotionSection
        initial="hidden"
        animate="show"
        variants={reveal}
        className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-[0_12px_30px_rgba(17,17,17,0.04)] sm:px-8 lg:px-10 lg:py-12"
      >
        <div className="max-w-3xl">
          <motion.div variants={reveal} custom={0.05} className="site-kicker">
            Contact us
          </motion.div>
          <motion.h1 variants={reveal} custom={0.1} className="mt-5 text-4xl font-semibold leading-[1.03] tracking-[-0.04em] text-slate-900 sm:text-5xl lg:text-6xl">
            Talk to My Hosur Property.
          </motion.h1>
          <motion.p variants={reveal} custom={0.15} className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
            Reach our team for property discovery, buying and selling support, registration help, loans, construction coordination, and local real-estate services.
          </motion.p>
        </div>
      </MotionSection>

      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={reveal}
        className="grid gap-4 md:grid-cols-3"
      >
        {contactCards.map((item, index) => {
          const Icon = item.icon;
          const card = (
            <motion.article
              key={item.title}
              variants={reveal}
              custom={index * 0.05}
              className="rounded-[1.8rem] border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-slate-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">{item.title}</h2>
              <p className="mt-3 text-lg font-medium text-slate-800">{item.value}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.caption}</p>
            </motion.article>
          );

          if (item.href) {
            return (
              <a key={item.title} href={item.href} className="block">
                {card}
              </a>
            );
          }

          return card;
        })}
      </MotionSection>
    </main>
  );
};

export default ContactPage;
