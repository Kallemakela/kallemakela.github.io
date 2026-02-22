let currentFilters = new Set();
let allItems = [];

document.addEventListener("DOMContentLoaded", async function () {
  const content = await loadContent();
  if (!content) return;

  allItems = content.items;
  renderBio(content.bio);
  currentFilters = filtersFromURL();
  setupFilters();
  renderWork(allItems);
});

async function loadContent() {
  try {
    const response = await fetch("content.json");
    if (!response.ok) throw new Error("Failed to load content");
    return await response.json();
  } catch (error) {
    console.error("Error loading content:", error);
    return null;
  }
}

function filtersFromURL() {
  const params = new URLSearchParams(window.location.search);
  const tags = params.get("tags");
  return tags ? new Set(tags.split(",").filter(Boolean)) : new Set();
}

function filtersToURL(filters) {
  const params = new URLSearchParams();
  if (filters.size > 0) params.set("tags", [...filters].join(","));
  const query = params.toString();
  history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
}

function renderBio(bio) {
  document.getElementById("bio-name").innerHTML =
    `<strong>${escapeHtml(bio.name)}</strong>`;
  document.getElementById("bio-description").textContent = bio.description;
}

function renderWork(items) {
  const container = document.getElementById("work-container");
  const filteredItems =
    currentFilters.size === 0
      ? items
      : items.filter((item) =>
          [...currentFilters].every((f) => item.tags?.includes(f))
        );

  container.innerHTML = filteredItems
    .map((item) => createWorkItemHTML(item))
    .join("");

  container.querySelectorAll(".work-item").forEach((el, index) => {
    el.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      const url = filteredItems[index].url;
      if (url) window.open(url, "_blank");
    });
  });
}

const TAG_COLORS = {
  ML: "#E46876",
  RL: "#957FB8",
  "browser-extension": "#957FB8",
  javascript: "#E6C384",
  lua: "#7FB4CA",
  neuroimaging: "#7FB4CA",
  python: "#7E9CD8",
  react: "#7FB4CA",
  "react-native": "#7FB4CA",
  shell: "#98BB6C",
};

function setupFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const customInput = document.getElementById("custom-filter");
  const btnTags = new Set([...filterBtns].map((b) => b.dataset.filter));

  if (currentFilters.size === 1) {
    const [tag] = currentFilters;
    if (!btnTags.has(tag)) customInput.value = tag;
  }

  updateFilterButtonStates(filterBtns);
  updateSelectColor(customInput);

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.filter;
      currentFilters.clear();
      if (tag !== "all") currentFilters.add(tag);
      customInput.value = "";
      updateSelectColor(customInput);
      filtersToURL(currentFilters);
      updateFilterButtonStates(filterBtns);
      renderWork(allItems);
    });
  });

  customInput.addEventListener("change", () => {
    const tag = customInput.value;
    currentFilters.clear();
    if (tag) currentFilters.add(tag);
    updateSelectColor(customInput);
    filtersToURL(currentFilters);
    updateFilterButtonStates(filterBtns);
    renderWork(allItems);
  });
}

function updateSelectColor(select) {
  const color = TAG_COLORS[select.value] ?? "#727169";
  select.style.color = select.value ? color : "#727169";
  select.style.borderColor = select.value ? color : "#363646";
  updateSelectWidth(select);
}

function updateSelectWidth(select) {
  const text = select.options[select.selectedIndex]?.text ?? "";
  select.style.width = `calc(${text.length}ch + 1.6rem + 2px)`;
}

function updateFilterButtonStates(filterBtns) {
  filterBtns.forEach((btn) => {
    const tag = btn.dataset.filter;
    const isActive =
      tag === "all" ? currentFilters.size === 0 : currentFilters.has(tag);
    btn.classList.toggle("active", isActive);
  });
}

function createWorkItemHTML(item) {
  const tags =
    item.tags
      ?.map(
        (tag) =>
          `<span class="tag tag-${tag.replace(/\s+/g, "-")}">${escapeHtml(tag)}</span>`,
      )
      .join("") || "";

  const links = item.links
    ? Object.entries(item.links)
        .map(
          ([key, url]) =>
            `<button class="work-item-link" onclick="window.open('${url}', '_blank')">${escapeHtml(key)}</button>`,
        )
        .join(", ")
    : "";

  const closedSourceNote = item.tags?.includes("closed-source")
    ? '<div class="work-item-closed-source">Closed-source project, details available on request</div>'
    : "";

  const thumbnailHTML = createThumbnailHTML(item.thumbnail);

  const titleLink = item.url
    ? `<a href="${item.url}" class="work-item-title-link" target="_blank">${escapeHtml(item.title)}</a>`
    : `<span class="work-item-title-text">${escapeHtml(item.title)}</span>`;
  const thumbnailLink =
    item.url && thumbnailHTML
      ? `<a href="${item.url}" class="work-item-thumbnail-link" target="_blank">${thumbnailHTML}</a>`
      : thumbnailHTML;

  return `<div class="work-item ${item.url ? "has-url" : ""}">
        ${thumbnailLink}
        <div class="work-item-title">${titleLink}</div>
        ${item.subtitle ? `<div class="work-item-subtitle">${escapeHtml(item.subtitle)}</div>` : ""}
        ${links ? `<div class="work-item-links">${links}</div>` : ""}
        ${item.description ? `<div class="work-item-desc">${escapeHtml(item.description)}</div>` : ""}
        ${closedSourceNote}
        <div class="work-item-tags">${tags}</div>
    </div>`;
}

function createThumbnailHTML(thumbnailPath) {
  if (!thumbnailPath) return "";

  if (thumbnailPath.endsWith(".mp4")) {
    return `<div class="work-item-thumbnail"><video autoplay loop muted playsinline src="${thumbnailPath}"></video></div>`;
  } else {
    return `<div class="work-item-thumbnail"><img src="${thumbnailPath}" alt="" loading="lazy"></div>`;
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
