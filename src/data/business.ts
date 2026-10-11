/**
 * Business facts, links and hours. This is the file to edit when something changes.
 *
 * Every fact here was checked on October 11, 2026 against the restaurant's online-ordering page
 * (MealKeyway / MenuSifu), its printed menu and its Google Maps listing. See OWNER-HANDOFF.md for
 * what still needs the owner's confirmation.
 */

/**
 * The one place the ordering destination is set. Every "Order online" control uses it.
 *
 * This is the link the owner posted on Google Maps. It was chosen over the old website's ChowNow
 * link (https://ordering.chownow.com/order/10013/locations) because it loads, is titled
 * "Okeno Sushi" and shows 451 Glen Drive, Shirley, NY 11967 with the current menu. ChowNow could
 * not be checked from the build environment (blocked by Cloudflare).
 */
export const ORDER_URL =
  "https://order.mealkeyway.com/customer/release/index?mid=46446152716f555a75486368787758744767753937673d3d";

export const BUSINESS = {
  name: "Okeno Sushi",
  street: "451 Glen Drive",
  city: "Shirley",
  region: "NY",
  postalCode: "11967",
  phone: "(631) 668-8188",
  phoneHref: "tel:+16316688188",
  /** Coordinates published by the ordering page. */
  geo: { lat: 40.8366316, lng: -72.8856102 },
  timeZone: "America/New_York",
} as const;

export const ADDRESS_LINE = `${BUSINESS.street}, ${BUSINESS.city}, ${BUSINESS.region} ${BUSINESS.postalCode}`;

export const LINKS = {
  order: ORDER_URL,
  call: BUSINESS.phoneHref,
  /** Opens the Google Maps listing; falls back to the search query if the place id ever changes. */
  maps: "https://www.google.com/maps/search/?api=1&query=Okeno+Sushi+451+Glen+Dr+Shirley+NY&query_place_id=ChIJi_5RpCVb6IkRGTkRnC8s4h4",
  directions: "https://www.google.com/maps/dir/?api=1&destination=Okeno+Sushi+451+Glen+Dr+Shirley+NY",
} as const;

/**
 * Google rating as seen on Google Maps on the date below. It is a dated snapshot, not live data:
 * update or remove it rather than let it go stale.
 */
export const GOOGLE_RATING = {
  stars: 4.6,
  reviews: 678,
  checked: "October 2026",
  url: LINKS.maps,
} as const;

export type DayHours = { day: string; short: string; open?: string; close?: string };

/**
 * Weekly hours, 24-hour clock, America/New_York. Index 0 is Sunday (as Date.getDay()).
 * Source: the printed menu. The online-ordering page's pickup windows agree (they close 15 minutes
 * before each closing time).
 */
export const HOURS: DayHours[] = [
  { day: "Sunday", short: "Sun", open: "12:00", close: "21:00" },
  { day: "Monday", short: "Mon" },
  { day: "Tuesday", short: "Tue", open: "11:00", close: "21:00" },
  { day: "Wednesday", short: "Wed", open: "11:00", close: "21:00" },
  { day: "Thursday", short: "Thu", open: "11:00", close: "21:00" },
  { day: "Friday", short: "Fri", open: "11:00", close: "22:00" },
  { day: "Saturday", short: "Sat", open: "12:00", close: "22:00" },
];

export const LUNCH_HOURS = "Lunch specials Tuesday to Friday, 11 AM to 3 PM, excluding holidays.";

/** Services shown in the strip under the hero. Delivery is not listed: it was not verified. */
export const SERVICES = ["Dine in", "Takeout", "Catering inquiries"] as const;
