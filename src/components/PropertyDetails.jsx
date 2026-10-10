import { useMemo } from "react";
import { CheckIcon, MapPinIcon, SparklesIcon } from "./AppIcons";
import { useAppLanguage } from "../hooks/useAppLanguage";
import { localizeCatalogText } from "../utils/i18nCatalog";
import { buildPropertyDetails } from "../utils/propertyDetails";

const PropertyDetails = ({ property }) => {
  const { t, currentLanguage } = useAppLanguage();
  const details = useMemo(() => buildPropertyDetails(property), [property]);
  const translate = text => localizeCatalogText(text, currentLanguage);

  return (
    <section className="property-details-section mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-10" aria-labelledby="property-details-heading">
      <div className="property-details-panel">
        <div className="property-details-heading">
          <h2 id="property-details-heading">{t("propertyDetail.aboutProperty")}</h2>
          <span className="property-details-badge">{t(property.listingType === "rent" ? "propertyCard.forRent" : "propertyCard.forSale")}</span>
        </div>

        {details.address && (
          <div className="property-details-address">
            <MapPinIcon aria-hidden="true" />
            <p>{details.address}</p>
          </div>
        )}

        <dl className="property-details-grid">
          {details.facts.map(fact => (
            <div key={fact.key} className="property-detail-fact" data-detail={fact.key}>
              <dt>{t(`propertyDetail.${fact.key}`, { defaultValue: translate(fact.label) })}</dt>
              <dd>{translate(fact.value)}</dd>
            </div>
          ))}
        </dl>

        {details.amenities.length > 0 && (
          <div className="property-details-group">
            <h3>{t("propertyDetail.facilities", { defaultValue: "Facilities" })}</h3>
            <ul className="property-details-amenities">
              {details.amenities.map(amenity => (
                <li key={amenity}><CheckIcon aria-hidden="true" />{translate(amenity)}</li>
              ))}
            </ul>
          </div>
        )}

        {details.highlights.length > 0 && (
          <div className="property-details-group">
            <h3>{t("propertyDetail.highlights", { defaultValue: "Property highlights" })}</h3>
            <ul className="property-details-highlights">
              {details.highlights.map(highlight => (
                <li key={highlight} className={highlight.length > 150 ? "property-highlight-wide" : ""}>
                  <SparklesIcon aria-hidden="true" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertyDetails;
