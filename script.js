
const bibleVerses = [
  {
    text: "The LORD is my shepherd; I shall not want.",
    reference: "Psalm 23:1"
  },
  {
    text: "I can do all things through Christ which strengtheneth me.",
    reference: "Philippians 4:13"
  },
  {
    text: "The LORD is my light and my salvation; whom shall I fear?",
    reference: "Psalm 27:1"
  },
  {
    text: "Be strong and of a good courage; be not afraid.",
    reference: "Joshua 1:9"
  },
  {
    text: "In the beginning God created the heaven and the earth.",
    reference: "Genesis 1:1"
  },
  {
    text: "Trust in the LORD with all thine heart.",
    reference: "Proverbs 3:5"
  },
  {
    text: "Pray without ceasing.",
    reference: "1 Thessalonians 5:17"
  },
  {
    text: "The LORD is good to all: and his tender mercies are over all his works.",
    reference: "Psalm 145:9"
  },
  {
    text: "We love him, because he first loved us.",
    reference: "1 John 4:19"
  },
  {
    text: "Let all your things be done with charity.",
    reference: "1 Corinthians 16:14"
  }
];

const verseText = document.getElementById("verse-text");
const verseReference = document.getElementById("verse-reference");
const newVerseButton = document.getElementById("new-verse-btn");
const shareVerseButton = document.getElementById("share-verse-btn");
const shareStatus = document.getElementById("share-status");
const currentYear = document.getElementById("current-year");

let previousIndex = -1;

function showRandomVerse() {
  let randomIndex;

  do {
    randomIndex = Math.floor(Math.random() * bibleVerses.length);
  } while (
    bibleVerses.length > 1 &&
    randomIndex === previousIndex
  );

  previousIndex = randomIndex;

  const verse = bibleVerses[randomIndex];

  verseText.textContent = verse.text;
  verseReference.textContent = verse.reference;

  // Clear an old sharing message when the verse changes.
  shareStatus.textContent = "";
}

function getVerseToShare() {
  const verse = verseText.textContent;
  const reference = verseReference.textContent;

  return `"${verse}"\n— ${reference}\n\nRehoboth Baptist Church | House of Testimonies`;
}

async function copyVerse(text) {
  // Modern clipboard API usually requires HTTPS.
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for browsers where the clipboard API is unavailable.
  const temporaryInput = document.createElement("textarea");
  temporaryInput.value = text;
  temporaryInput.style.position = "fixed";
  temporaryInput.style.opacity = "0";

  document.body.appendChild(temporaryInput);
  temporaryInput.focus();
  temporaryInput.select();

  const copied = document.execCommand("copy");
  temporaryInput.remove();

  if (!copied) {
    throw new Error("Copy was not available.");
  }
}

async function shareVerse() {
  const text = getVerseToShare();

  shareStatus.textContent = "";

  // Use the phone's native share menu where supported.
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Bible Verse",
        text: text
      });

      shareStatus.textContent = "Share menu opened.";
      return;
    } catch (error) {
      // A user cancelling the share menu is not an error to display.
      if (error.name === "AbortError") {
        return;
      }
    }
  }

  // If native sharing is unavailable, copy the verse.
  try {
    await copyVerse(text);
    shareStatus.textContent =
      "Verse copied. You can now paste it into WhatsApp or another app.";
  } catch (error) {
    shareStatus.textContent =
      "Sharing is unavailable in this browser. Please select and copy the verse.";
  }
}

newVerseButton.addEventListener("click", showRandomVerse);
shareVerseButton.addEventListener("click", shareVerse);

currentYear.textContent = new Date().getFullYear();

// Display a random verse as soon as the script loads.
showRandomVerse();

// ---------- Speak button (plays the About audio) ----------
const speakButton = document.getElementById("speak-btn");
const speakLabel = document.getElementById("speak-label");
const aboutAudio = document.getElementById("about-audio");

function setSpeakState(isPlaying) {
  speakLabel.textContent = isPlaying ? "Stop" : "Speak";
  speakButton.setAttribute("aria-pressed", String(isPlaying));
}

speakButton.addEventListener("click", async () => {
  if (!aboutAudio.paused) {
    aboutAudio.pause();
    aboutAudio.currentTime = 0;
    setSpeakState(false);
    return;
  }

  try {
    await aboutAudio.play();
    setSpeakState(true);
  } catch (error) {
    setSpeakState(false);
  }
});

aboutAudio.addEventListener("ended", () => setSpeakState(false));

// ---------- Back to top button (appears near the bottom of the page) ----------
const backToTopButton = document.getElementById("back-to-top");
let scrollTicking = false;

function updateBackToTop() {
  const scrolled = window.scrollY + window.innerHeight;
  const pageHeight = document.documentElement.scrollHeight;
  const nearBottom = scrolled >= pageHeight - 150;
  const pageIsScrollable = pageHeight > window.innerHeight * 1.5;

  backToTopButton.classList.toggle("visible", nearBottom && pageIsScrollable);
  scrollTicking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateBackToTop);
      scrollTicking = true;
    }
  },
  { passive: true }
);

window.addEventListener("resize", updateBackToTop);

backToTopButton.addEventListener("click", () => {
  // Uses the page's smooth scrolling (and respects reduced-motion settings).
  window.scrollTo({ top: 0 });
});

updateBackToTop();

// ---------- Navigation: mobile menu, scroll progress, active link ----------
const siteHeader = document.getElementById("site-header");
const navToggle = document.getElementById("nav-toggle");
const siteNav = document.getElementById("site-nav");
const scrollProgress = document.getElementById("scroll-progress");
const MOBILE_NAV_WIDTH = 900;

function setMenuOpen(isOpen) {
  siteNav.classList.toggle("open", isOpen);
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
}

navToggle.addEventListener("click", () => {
  setMenuOpen(!siteNav.classList.contains("open"));
});

// Close the menu after choosing a link
siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMenuOpen(false);
  }
});

// Close when tapping outside the header
document.addEventListener("click", (event) => {
  if (siteNav.classList.contains("open") && !siteHeader.contains(event.target)) {
    setMenuOpen(false);
  }
});

// Close with the Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && siteNav.classList.contains("open")) {
    setMenuOpen(false);
    navToggle.focus();
  }
});

// Keep scroll offset in sync with the real header height
function updateHeaderHeight() {
  document.documentElement.style.setProperty(
    "--header-h",
    siteHeader.offsetHeight + "px"
  );
}

window.addEventListener("resize", () => {
  if (window.innerWidth > MOBILE_NAV_WIDTH) {
    setMenuOpen(false);
  }
  updateHeaderHeight();
});

window.addEventListener("load", updateHeaderHeight);

// Highlight the link for the section currently on screen.
// (Links to other pages are ignored; mark those with aria-current="page".)
const spyItems = Array.from(siteNav.querySelectorAll('a[href^="#"]'))
  .map((link) => ({
    link,
    section: document.querySelector(link.getAttribute("href"))
  }))
  .filter((item) => item.section && item.link.getAttribute("href") !== "#");

function updateNavOnScroll() {
  const scrollTop = window.scrollY;
  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight;

  siteHeader.classList.toggle("scrolled", scrollTop > 8);
  scrollProgress.style.transform =
    "scaleX(" + (maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0) + ")";

  const marker = scrollTop + siteHeader.offsetHeight + 60;
  let current = null;

  spyItems.forEach((item) => {
    const top = item.section.getBoundingClientRect().top + scrollTop;
    if (top <= marker) {
      current = item;
    }
  });

  if (maxScroll > 0 && scrollTop >= maxScroll - 4 && spyItems.length) {
    current = spyItems[spyItems.length - 1];
  }

  spyItems.forEach((item) => {
    const isCurrent = item === current;
    item.link.classList.toggle("active", isCurrent);
    if (isCurrent) {
      item.link.setAttribute("aria-current", "location");
    } else {
      item.link.removeAttribute("aria-current");
    }
  });
}

let navScrollTicking = false;

window.addEventListener(
  "scroll",
  () => {
    if (!navScrollTicking) {
      window.requestAnimationFrame(() => {
        updateNavOnScroll();
        navScrollTicking = false;
      });
      navScrollTicking = true;
    }
  },
  { passive: true }
);

updateHeaderHeight();
updateNavOnScroll();


// ---------- Next service countdown (Ghana time = GMT/UTC, no daylight saving) ----------
// day: 0 = Sunday ... 6 = Saturday. Times are 24-hour, in Ghana time.
const SERVICES = [
  { day: 0, name: "Bible Study",                        start: "08:00", end: "09:00" },
  { day: 0, name: "Worship Service",                    start: "09:00", end: "12:00" },
  { day: 3, name: "Teaching Service",                   start: "18:30", end: "20:00" },
  { day: 5, name: "Prayer Service",                     start: "18:30", end: "20:00" },
  { day: 6, name: "Evangelism, Visitation & Follow up", start: "15:00", end: "18:00" }
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

const nextService = document.getElementById("next-service");
const nextStatus = document.getElementById("next-status");
const nextName = document.getElementById("next-name");
const nextWhen = document.getElementById("next-when");
const cdDays = document.getElementById("cd-days");
const cdHours = document.getElementById("cd-hours");
const cdMins = document.getElementById("cd-mins");
const cdSecs = document.getElementById("cd-secs");
const addCalendarButton = document.getElementById("add-calendar-btn");

function toMinutes(time) {
  const parts = time.split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
}

function formatTime(time) {
  const mins = toMinutes(time);
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return h12 + ":" + String(m).padStart(2, "0") + " " + suffix;
}

// Finds the service happening now, or the soonest upcoming one.
function findService(nowMs) {
  const todayUtc = new Date(nowMs);
  const midnight = Date.UTC(
    todayUtc.getUTCFullYear(),
    todayUtc.getUTCMonth(),
    todayUtc.getUTCDate()
  );

  let upcoming = null;

  for (let offset = 0; offset <= 7; offset++) {
    const dayStart = midnight + offset * DAY;
    const weekday = new Date(dayStart).getUTCDay();

    for (const service of SERVICES) {
      if (service.day !== weekday) continue;

      const start = dayStart + toMinutes(service.start) * MINUTE;
      const end = dayStart + toMinutes(service.end) * MINUTE;

      if (nowMs >= start && nowMs < end) {
        return { service, start, end, live: true };
      }

      if (start > nowMs && (!upcoming || start < upcoming.start)) {
        upcoming = { service, start, end, live: false };
      }
    }
  }

  return upcoming;
}

function pad(number) {
  return String(number).padStart(2, "0");
}

let currentService = null;

function updateCountdown() {
  const now = Date.now();
  const found = findService(now);

  if (!found) return;

  currentService = found;
  const { service, start, end, live } = found;

  nextService.classList.toggle("is-live", live);
  nextName.textContent = service.name;

  if (live) {
    nextStatus.textContent = "HAPPENING NOW";
    nextWhen.textContent = "Ends at " + formatTime(service.end) + " (Ghana time)";
    return;
  }

  nextStatus.textContent = "NEXT SERVICE";
  nextWhen.textContent =
    DAY_NAMES[service.day] + ", " + formatTime(service.start) +
    " – " + formatTime(service.end) + " (Ghana time)";

  const remaining = Math.max(0, start - now);
  cdDays.textContent = pad(Math.floor(remaining / DAY));
  cdHours.textContent = pad(Math.floor((remaining % DAY) / (60 * MINUTE)));
  cdMins.textContent = pad(Math.floor((remaining % (60 * MINUTE)) / MINUTE));
  cdSecs.textContent = pad(Math.floor((remaining % MINUTE) / 1000));
}

// Downloads a calendar file that repeats weekly (works with Apple, Google, Outlook).
function icsDate(ms) {
  return new Date(ms).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

addCalendarButton.addEventListener("click", () => {
  if (!currentService) return;

  const { service, start, end } = currentService;
  const weekdayCodes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Rehoboth Baptist Church//Website//EN",
    "BEGIN:VEVENT",
    "UID:rehoboth-" + service.day + "-" + service.start.replace(":", "") + "@rehoboth-church",
    "DTSTAMP:" + icsDate(Date.now()),
    "DTSTART:" + icsDate(start),
    "DTEND:" + icsDate(end),
    "RRULE:FREQ=WEEKLY;BYDAY=" + weekdayCodes[service.day],
    "SUMMARY:" + service.name.replace(/,/g, "\\,") + " - Rehoboth Baptist Church",
    "LOCATION:Rehoboth Baptist Church\\, Kweiman\\, Accra\\, Ghana",
    "BEGIN:VALARM",
    "TRIGGER:-PT60M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Service starts in one hour",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "rehoboth-service.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

updateCountdown();
setInterval(updateCountdown, 1000);
