import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  absoluteUrl,
  buildPageTitle,
  getSiteUrl,
} from "../utils/seo";

const SeoHead = ({
  title,
  description = SITE_DESCRIPTION,
  keywords = SITE_KEYWORDS,
  canonicalPath,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noIndex = false,
  schema = [],
}) => {
  const location = useLocation();
  const canonicalUrl = absoluteUrl(canonicalPath || location.pathname);
  const imageUrl = absoluteUrl(image);
  const resolvedTitle = buildPageTitle(title);
  const resolvedDescription = description || SITE_DESCRIPTION;
  const twitterCard = image ? "summary_large_image" : "summary";

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="keywords" content={keywords || SITE_KEYWORDS} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large"} />
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <link rel="canonical" href={canonicalUrl} />
      {schema.filter(Boolean).map((item, index) => (
        <script key={`${type}-schema-${index}`} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
};

export const PrivateRouteSeo = ({ title = SITE_NAME }) => (
  <SeoHead
    title={title}
    noIndex
    canonicalPath={typeof window !== "undefined" ? window.location.pathname : "/"}
    description={`${title} on ${SITE_NAME}.`}
    image={`${getSiteUrl()}/favicon.svg`}
  />
);

export default SeoHead;
