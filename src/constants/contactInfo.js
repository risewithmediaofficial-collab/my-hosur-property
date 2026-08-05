export const CONTACT_EMAIL = "myhosurproperty.mhp@gmail.com";

export const CONTACT_PHONE_NUMBERS = [
  {
    role: "Director",
    raw: "9994005086",
    display: "+91 99940 05086",
    tel: "+919994005086",
  },
  {
    role: "Managing Director (MD)",
    raw: "9150100499",
    display: "+91 91501 00499",
    tel: "+919150100499",
  },
  {
    role: "Admin 1",
    raw: "8248918906",
    display: "+91 82489 18906",
    tel: "+918248918906",
  },
  {
    role: "Admin 2",
    raw: "9150100477",
    display: "+91 91501 00477",
    tel: "+919150100477",
  },
];

export const CONTACT_PHONE = CONTACT_PHONE_NUMBERS.map((item) => item.raw).join(", ");
export const CONTACT_PHONE_DISPLAY = CONTACT_PHONE_NUMBERS.map((item) => `${item.role}: ${item.display}`).join(" | ");
export const CONTACT_PHONE_TEL = CONTACT_PHONE_NUMBERS[0]?.tel ?? "";

export const CONTACT_ADDRESS =
  "No 4 /409-4, First floor, Movendar Nagar, Vinayagapuram, Bagalur Road, Hosur, Krishnagiri - 635109.";

export const WHATSAPP_LINK =
  "https://wa.me/919150100499?text=Hello%20MyHosurProperty%2C%20I%20would%20like%20to%20enquire%20about%20your%20services";

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/myhosurproperty?igsh=MWcxNzk5eHI1ZTd0YQ==",
  facebook: "https://www.facebook.com/share/1EBur7bmBy/",
  threads: "https://www.threads.com/@myhosurproperty",
  x: "https://x.com/hosurproperties",
  whatsapp: WHATSAPP_LINK,
};
