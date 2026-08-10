export const CONTACT_EMAIL = "myhosurproperty.mhp@gmail.com";

export const CONTACT_PHONE_NUMBERS = [
  {
    role: "To Buy or Business Enquiry",
    raw: "9994005086",
    display: "+91 99940 05086",
    tel: "+919994005086",
  },
  {
    role: "To Sell",
    raw: "9150100499",
    display: "+91 91501 00499",
    tel: "+919150100499",
  },
  {
    role: "For Rental / Office & Home Service Enquiry",
    raw: "9150100477",
    display: "+91 91501 00477",
    tel: "+919150100477",
  },
  {
    role: "To Reach Our Team",
    raw: "8248918906",
    display: "+91 82489 18906",
    tel: "+918248918906",
  },
];

export const CONTACT_PHONE = CONTACT_PHONE_NUMBERS.map((item) => item.raw).join(", ");
export const CONTACT_PHONE_DISPLAY = CONTACT_PHONE_NUMBERS.map((item) => `${item.role}: ${item.display}`).join(" | ");
export const CONTACT_PHONE_TEL = CONTACT_PHONE_NUMBERS[0]?.tel ?? "";

export const CONTACT_ADDRESS =
  "No 4 /409-4, First floor, Movendar Nagar, Vinayagapuram, Bagalur Road, Hosur, Krishnagiri - 635109.";

export const WHATSAPP_LINK =
  "https://wa.me/message/XJQW55BVGWT3C1";

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/myhosurproperty?igsh=MWcxNzk5eHI1ZTd0YQ==",
  facebook: "https://www.facebook.com/share/1EBur7bmBy/",
  youtube: "https://youtube.com/@myhosurproperty?si=T4wyMr-f0a0c_M53",
  threads: "https://www.threads.com/@myhosurproperty",
  x: "https://x.com/hosurproperties",
  whatsapp: WHATSAPP_LINK,
};
