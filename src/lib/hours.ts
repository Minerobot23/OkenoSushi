import { BUSINESS, HOURS, type DayHours } from "../data/business";

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** "11:00" -> "11 AM", "21:30" -> "9:30 PM", "12:00" -> "Noon". */
export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  if (h === 12 && m === 0) return "Noon";
  const hour = ((h + 11) % 12) + 1;
  const suffix = h < 12 || h === 24 ? "AM" : "PM";
  return m ? `${hour}:${String(m).padStart(2, "0")} ${suffix}` : `${hour} ${suffix}`;
}

export function formatRange(d: DayHours) {
  return d.open && d.close ? `${formatTime(d.open)} – ${formatTime(d.close)}` : "Closed";
}

/** Day of week (0 = Sunday) and minutes since midnight at the restaurant, whatever the visitor's zone. */
export function restaurantClock(now: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS.timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export type OpenState = { open: boolean; text: string };

/**
 * Open or closed right now in America/New_York. A day whose closing time is not after its opening
 * time is treated as running past midnight into the next day, so a late night would be handled;
 * none of the current hours do that.
 */
export function openState(now: Date = new Date(), hours: DayHours[] = HOURS): OpenState {
  const { day, minutes } = restaurantClock(now);
  const spans = (d: number) => {
    const h = hours[(d + 7) % 7];
    if (!h.open || !h.close) return [];
    const start = toMinutes(h.open);
    let end = toMinutes(h.close);
    if (end <= start) end += 24 * 60;
    return [{ start, end, close: h.close }];
  };
  // Today's span, and yesterday's span if it ran past midnight.
  for (const s of spans(day)) {
    if (minutes >= s.start && minutes < s.end) return { open: true, text: `Open now · until ${formatTime(s.close)}` };
  }
  for (const s of spans(day - 1)) {
    if (minutes + 24 * 60 >= s.start && minutes + 24 * 60 < s.end) {
      return { open: true, text: `Open now · until ${formatTime(s.close)}` };
    }
  }
  // Next opening.
  for (let ahead = 0; ahead < 7; ahead++) {
    const d = (day + ahead) % 7;
    for (const s of spans(d)) {
      if (ahead === 0 && minutes >= s.start) continue;
      const when = ahead === 0 ? "today" : ahead === 1 ? "tomorrow" : hours[d].day;
      return { open: false, text: `Closed now · opens ${when} at ${formatTime(hours[d].open!)}` };
    }
  }
  return { open: false, text: "Closed now" };
}
