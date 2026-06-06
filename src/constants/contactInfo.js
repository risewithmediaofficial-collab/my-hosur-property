export const CONTACT_EMAIL = "myhosurproperty786@gmail.com";

export const CONTACT_PHONE_NUMBERS = [
  {
    raw: "9994005086",
    display: "+91 99940 05086",
    tel: "+919994005086",
  },
  {
    raw: "9150100499",
    display: "+91 91501 00499",
    tel: "+919150100499",
  },
];

export const CONTACT_PHONE = CONTACT_PHONE_NUMBERS.map((item) => item.raw).join(", ");
export const CONTACT_PHONE_DISPLAY = CONTACT_PHONE_NUMBERS.map((item) => item.display).join(" / ");
export const CONTACT_PHONE_TEL = CONTACT_PHONE_NUMBERS[0]?.tel ?? "";

export const CONTACT_ADDRESS =
  "No 4 /409-4, First floor, Movendar Nagar, Vinayagapuram, Bagalur Road, Hosur, Krishnagiri - 635109.";
