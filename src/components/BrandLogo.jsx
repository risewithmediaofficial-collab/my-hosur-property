import logoSrc from "../assets/myhosurpropertylogo.webp";

const BrandLogo = ({ className = "", alt = "MyHosurProperty" }) => (
  <img
    src={logoSrc}
    alt={alt}
    width={480}
    height={354}
    decoding="async"
    className={`block object-contain ${className}`}
  />
);

export default BrandLogo;
