let currentFilter = "all";
let allItems = [];

document.addEventListener("DOMContentLoaded", async function () {
  const content = await loadContent();
  if (!content) return;

  allItems = content.items;
  renderBio(content.bio);
  renderWork(allItems);
  setupFilters();
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

function renderBio(bio) {
  document.getElementById("bio-name").innerHTML =
    `<strong>${escapeHtml(bio.name)}</strong>`;
  document.getElementById("bio-description").textContent = bio.description;
}

function renderWork(items) {
  const container = document.getElementById("work-container");
  const filteredItems =
    currentFilter === "all"
      ? items
      : items.filter((item) => item.tags?.includes(currentFilter));

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

function setupFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderWork(allItems);
    });
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
