const siteLogo = document.getElementById("site-logo");
const siteEyebrow = document.getElementById("site-eyebrow");
const siteName = document.getElementById("site-name");
const siteTagline = document.getElementById("site-tagline");
const siteFilters = document.getElementById("site-filters");
const appsSections = document.getElementById("apps-sections");
const footerCopy = document.getElementById("footer-copy");
const footerLinks = document.getElementById("footer-links");
let allApps = [];
let activeFilter = "All";
let showWip = false;
let dotClickCount = 0;
let dotClickTimer = null;
let railUpdaters = [];

window.addEventListener("resize", () => {
  railUpdaters.forEach((update) => update());
});

function toggleWip() {
  showWip = !showWip;
  renderApps(getFilteredApps());
}

function handleDotClick() {
  dotClickCount += 1;
  clearTimeout(dotClickTimer);
  dotClickTimer = setTimeout(() => {
    dotClickCount = 0;
  }, 600);

  if (dotClickCount === 3) {
    dotClickCount = 0;
    toggleWip();
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderStatus(message) {
  appsSections.innerHTML = `<div class="grid-status">${escapeHtml(message)}</div>`;
}

const FILTER_PRIORITY = ["Tools", "Games"];

function getFilterLabelsFromApps(apps) {
  const uniqueTags = new Set();

  apps.forEach((app) => {
    (app.tags || []).forEach((tag) => uniqueTags.add(tag));
  });

  const remainingTags = Array.from(uniqueTags)
    .filter((tag) => !FILTER_PRIORITY.includes(tag))
    .sort((a, b) => a.localeCompare(b));

  const orderedTags = [
    ...FILTER_PRIORITY.filter((tag) => uniqueTags.has(tag)),
    ...remainingTags
  ];

  return ["All", ...orderedTags];
}

function getFilteredApps() {
  const apps =
    activeFilter === "All"
      ? allApps
      : allApps.filter((app) => (app.tags || []).includes(activeFilter));

  return showWip ? apps : apps.filter((app) => !app.wip);
}

function setActiveFilter(nextFilter) {
  activeFilter = nextFilter;

  siteFilters.querySelectorAll(".filter").forEach((filterEl) => {
    filterEl.classList.toggle(
      "active",
      filterEl.dataset.filter === activeFilter
    );
  });

  renderApps(getFilteredApps());
}

function renderSite(site, apps) {
  document.title = `More Apps by ${site.name}`;
  siteLogo.textContent = site.logo;
  siteEyebrow.textContent = site.eyebrow;

  const dotIndex = site.name.lastIndexOf(".");
  if (dotIndex === -1) {
    siteName.textContent = site.name;
  } else {
    siteName.innerHTML = "";
    siteName.appendChild(
      document.createTextNode(site.name.slice(0, dotIndex))
    );
    const dotEl = document.createElement("span");
    dotEl.textContent = ".";
    dotEl.style.cursor = "pointer";
    dotEl.addEventListener("click", handleDotClick);
    siteName.appendChild(dotEl);
    siteName.appendChild(
      document.createTextNode(site.name.slice(dotIndex + 1))
    );
  }
  siteTagline.textContent = site.tagline;
  footerCopy.textContent = site.footerCopy;

  siteFilters.innerHTML = "";
  const filters = getFilterLabelsFromApps(apps);
  activeFilter = filters.includes("Tools") ? "Tools" : "All";

  filters.forEach((filter) => {
    const filterEl = document.createElement("button");
    filterEl.type = "button";
    filterEl.className = `filter${filter === activeFilter ? " active" : ""}`;
    filterEl.textContent = filter;
    filterEl.dataset.filter = filter;
    filterEl.addEventListener("click", () => {
      setActiveFilter(filter);
    });
    siteFilters.appendChild(filterEl);
  });

  footerLinks.innerHTML = "";
  (site.footerLinks || []).forEach((link) => {
    const linkEl = document.createElement("a");
    linkEl.href = link.href;
    linkEl.textContent = link.label;
    if (link.href.startsWith("http")) {
      linkEl.target = "_blank";
      linkEl.rel = "noreferrer";
    }
    footerLinks.appendChild(linkEl);
  });
}

function getDisplay(app) {
  return String(app.display || "desktop").toLowerCase() === "phone"
    ? "phone"
    : "desktop";
}

function getBadges(app) {
  return app.badges || [];
}

function getYearLabel(app) {
  return app.wip ? "WIP" : app.year || "";
}

function renderBadgePills(app) {
  return getBadges(app)
    .map((badge) => `<span class="badge">${escapeHtml(badge)}</span>`)
    .join("");
}

function createCardRoot(app, extraClass) {
  const root = document.createElement(app.url ? "a" : "article");
  root.className = extraClass ? `card ${extraClass}` : "card";
  if (app.url) {
    root.href = app.url;
  }
  return root;
}

function renderPhoneCard(app) {
  const article = createCardRoot(app, "phone-card");

  const tags = (app.tags || [])
    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join("");
  const screenContent = app.image
    ? `<img class="phone-image" src="${escapeHtml(app.image)}" alt="${escapeHtml(app.title)} screenshot" loading="lazy" decoding="async" onerror="this.closest('.has-image')?.classList.remove('has-image'); this.remove()">`
    : "";

  article.innerHTML = `
    <div class="phone-thumb">
      <span class="year">${escapeHtml(getYearLabel(app))}</span>
      <div class="phone-screen ${escapeHtml(app.theme)}${app.image ? " has-image" : ""}">
        <span class="thumb-icon">${escapeHtml(app.icon || "")}</span>
        ${screenContent}
      </div>
    </div>
    <div class="content">
      <h2 class="title">${escapeHtml(app.title)}</h2>
      <p class="desc">${escapeHtml(app.description)}</p>
      <div class="meta">
        <div class="tags">${tags}</div>
        <div class="badges">${renderBadgePills(app)}</div>
      </div>
    </div>
  `;

  return article;
}

function renderDesktopCard(app) {
  const article = createCardRoot(app);

  const tags = (app.tags || [])
    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join("");
  const thumbContent = app.image
    ? `<img class="thumb-image" src="${escapeHtml(app.image)}" alt="${escapeHtml(app.title)} screenshot" loading="lazy" decoding="async" onerror="this.closest('.has-image')?.classList.remove('has-image'); this.remove()">`
    : "";

  article.innerHTML = `
    <div class="thumb ${escapeHtml(app.theme)}${app.image ? " has-image" : ""}">
      <span class="year">${escapeHtml(getYearLabel(app))}</span>
      <span class="thumb-icon">${escapeHtml(app.icon || "")}</span>
      ${thumbContent}
    </div>
    <div class="content">
      <h2 class="title">${escapeHtml(app.title)}</h2>
      <p class="desc">${escapeHtml(app.description)}</p>
      <div class="meta">
        <div class="tags">${tags}</div>
        <div class="badges">${renderBadgePills(app)}</div>
      </div>
    </div>
  `;

  return article;
}

function renderSection(title, apps, layout) {
  const section = document.createElement("section");
  section.className = "app-section";
  section.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">${escapeHtml(title)}</h2>
    </div>
  `;

  const list = document.createElement("div");
  list.className = layout === "phone" ? "phone-rail" : "grid";
  apps.forEach((app) => {
    list.appendChild(layout === "phone" ? renderPhoneCard(app) : renderDesktopCard(app));
  });

  if (layout === "phone") {
    const slider = document.createElement("div");
    slider.className = "phone-slider";

    const dots = document.createElement("div");
    dots.className = "slider-dots";
    dots.setAttribute("aria-label", `${title} slides`);

    const dotButtons = apps.map((app, index) => {
      const dot = document.createElement("button");
      dot.className = `slider-dot${index === 0 ? " active" : ""}`;
      dot.type = "button";
      dot.setAttribute("aria-current", index === 0 ? "true" : "false");
      dot.setAttribute("aria-label", `Show ${app.title}`);
      dot.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        list.scrollTo({
          left: list.children[index].offsetLeft - list.offsetLeft,
          behavior: "smooth",
        });
      });
      dots.appendChild(dot);
      return dot;
    });

    const updateDots = () => {
      let closestIndex = 0;
      let closestDistance = Infinity;

      Array.from(list.children).forEach((card, index) => {
        const distance = Math.abs(card.offsetLeft - list.offsetLeft - list.scrollLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      dotButtons.forEach((dot, index) => {
        dot.classList.toggle("active", index === closestIndex);
        dot.setAttribute("aria-current", index === closestIndex ? "true" : "false");
      });
    };

    list.addEventListener("scroll", () => {
      window.requestAnimationFrame(updateDots);
    });
    railUpdaters.push(updateDots);

    slider.appendChild(list);
    slider.appendChild(dots);
    section.appendChild(slider);
  } else {
    section.appendChild(list);
  }

  return section;
}

function renderApps(apps) {
  appsSections.innerHTML = "";
  railUpdaters = [];

  if (!apps.length) {
    renderStatus(`No apps found for ${activeFilter}.`);
    return;
  }

  const phoneApps = apps.filter((app) => getDisplay(app) === "phone");
  const desktopApps = apps.filter((app) => getDisplay(app) === "desktop");

  if (phoneApps.length) {
    appsSections.appendChild(renderSection("Mobile Friendly", phoneApps, "phone"));
  }

  if (desktopApps.length) {
    appsSections.appendChild(renderSection("Desktop Sites", desktopApps, "desktop"));
  }
}

async function loadData() {
  try {
    const [siteResponse, appsResponse] = await Promise.all([
      fetch("./site.json"),
      fetch("./apps.json")
    ]);

    if (!siteResponse.ok) {
      throw new Error(`site.json HTTP ${siteResponse.status}`);
    }

    if (!appsResponse.ok) {
      throw new Error(`apps.json HTTP ${appsResponse.status}`);
    }

    const [site, apps] = await Promise.all([
      siteResponse.json(),
      appsResponse.json()
    ]);

    allApps = [...apps].reverse();
    renderSite(site, allApps);
    renderApps(getFilteredApps());
  } catch (error) {
    renderStatus(
      "Could not load site.json or apps.json. If this page is opened directly from file://, use a small local web server so the JSON files can be loaded."
    );
  }
}

loadData();
