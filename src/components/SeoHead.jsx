import { useEffect } from "react";
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

const upsertMeta = (attributeName, attributeValue, content) => {
  const selector = `meta[${attributeName}="${attributeValue}"]`;
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attributeName, attributeValue);
    document.head.appendChild(node);
  }
  node.setAttribute("content", content);
};

const upsertLink = (rel, href) => {
  let node = document.head.querySelector(`link[rel="${rel}"]`);
  if (!node) {
    node = document.createElement("link");
    node.setAttribute("rel", rel);
    document.head.appendChild(node);
  }
  node.setAttribute("href", href);
};

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

  useEffect(() => {
    const canonicalUrl = absoluteUrl(canonicalPath || location.pathname);
    const imageUrl = absoluteUrl(image);
    const resolvedTitle = buildPageTitle(title);
    const resolvedDescription = description || SITE_DESCRIPTION;
    const twitterCard = image ? "summary_large_image" : "summary";

    document.title = resolvedTitle;
    document.documentElement.lang = "en";

    upsertMeta("name", "description", resolvedDescription);
    upsertMeta("name", "keywords", keywords || SITE_KEYWORDS);
    upsertMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    upsertMeta("name", "twitter:card", twitterCard);
    upsertMeta("name", "twitter:title", resolvedTitle);
    upsertMeta("name", "twitter:description", resolvedDescription);
    upsertMeta("name", "twitter:image", imageUrl);
    upsertMeta("property", "og:title", resolvedTitle);
    upsertMeta("property", "og:description", resolvedDescription);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", imageUrl);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", "en_IN");
    upsertLink("canonical", canonicalUrl);

    document.querySelectorAll('script[data-seo-schema="true"]').forEach((node) => node.remove());
    schema
      .filter(Boolean)
      .forEach((item) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.dataset.seoSchema = "true";
        script.text = JSON.stringify(item);
        document.head.appendChild(script);
      });

    return () => {
      // Keep the latest page metadata in place during route changes.
    };
  }, [canonicalPath, description, image, keywords, location.pathname, noIndex, schema, title, type]);

  return null;
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
