const ITEM_LIMIT = 3;

document.addEventListener('DOMContentLoaded', async function() {
    const content = await loadContent();
    if (!content) return;

    renderBio(content.bio);
    renderPublications(content.publications);
    renderProjects(content.projects);
    renderContributions(content.contributions);

    initShowMore('publications', '.publication', ITEM_LIMIT);
    initShowMore('projects', '.project', ITEM_LIMIT);
    initShowMore('contributions', '.contribution', ITEM_LIMIT);
});

async function loadContent() {
    try {
        const response = await fetch('content.json');
        if (!response.ok) throw new Error('Failed to load content');
        return await response.json();
    } catch (error) {
        console.error('Error loading content:', error);
        return null;
    }
}

function renderBio(bio) {
    document.getElementById('bio-name').innerHTML = `<strong>${escapeHtml(bio.name)}</strong>`;
    document.getElementById('bio-description').textContent = bio.description;
}

function renderPublications(publications) {
    const container = document.getElementById('publications-container');
    container.innerHTML = publications.map(pub => createPublicationHTML(pub)).join('');
}

function renderProjects(projects) {
    const container = document.getElementById('projects-container');
    container.innerHTML = projects.map(proj => createProjectHTML(proj)).join('');
}

function renderContributions(contributions) {
    const container = document.getElementById('contributions-container');
    container.innerHTML = contributions.map(contrib => createContributionHTML(contrib)).join('');
}

function createPublicationHTML(pub) {
    const links = [];
    links.push(`<button class="publication-doi" onclick="event.stopPropagation(); event.preventDefault(); window.open('${pub.url}', '_blank');">DOI: ${escapeHtml(pub.doi)}</button>`);
    if (pub.links?.github) {
        links.push(`<button class="publication-github" onclick="event.stopPropagation(); event.preventDefault(); window.open('${pub.links.github}', '_blank');">GitHub</button>`);
    }

    const contributors = pub.contributors.map(c => c === 'Kalle Mäkelä' ? `<strong>${escapeHtml(c)}</strong>` : escapeHtml(c)).join('; ');
    const tags = pub.tags.map(tag => `<span class="tag tag-${tag.replace(/\s+/g, '-')}">${escapeHtml(tag)}</span>`).join('');

    return `<a href="${pub.url}" class="publication">
        <div class="publication-title">${escapeHtml(pub.title)}</div>
        <div class="publication-meta">${escapeHtml(pub.meta)}</div>
        <div class="publication-links">${links.join('')}</div>
        <div class="publication-contributors">Contributors: ${contributors}</div>
        <div class="publication-tags">${tags}</div>
    </a>`;
}

function createProjectHTML(proj) {
    const tags = proj.tags.map(tag => `<span class="tag tag-${tag.replace(/\s+/g, '-')}">${escapeHtml(tag)}</span>`).join('');

    return `<a href="${proj.url}" class="project code">
        <div class="project-title">${escapeHtml(proj.title)}</div>
        <div class="project-desc">${escapeHtml(proj.description)}</div>
        <div class="project-tags">${tags}</div>
    </a>`;
}

function createContributionHTML(contrib) {
    const links = contrib.links.map(link =>
        `<button class="contribution-link" onclick="event.stopPropagation(); event.preventDefault(); window.open('${link.url}', '_blank');">${escapeHtml(link.label)}</button>`
    ).join('');

    const tags = contrib.tags.map(tag => `<span class="tag tag-${tag.replace(/\s+/g, '-')}">${escapeHtml(tag)}</span>`).join('');

    return `<a href="${contrib.url}" class="contribution">
        <div class="contribution-title">${escapeHtml(contrib.title)}</div>
        <div class="contribution-desc">${escapeHtml(contrib.description)}</div>
        <div class="contribution-links">${links}</div>
        <div class="contribution-tags">${tags}</div>
    </a>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initShowMore(sectionId, selector, limit) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const items = Array.from(section.querySelectorAll(selector));
    if (items.length <= limit) {
        const text = section.querySelector('.show-more-text');
        if (text) text.style.display = 'none';
        return;
    }

    items.forEach((item, index) => {
        if (index >= limit) {
            item.classList.add('hidden-item');
            item.style.display = 'none';
        }
    });

    const showMoreText = section.querySelector('.show-more-text');
    if (showMoreText) {
        showMoreText.dataset.section = sectionId;
        showMoreText.dataset.selector = selector;
        showMoreText.dataset.limit = limit;
    }
}

function toggleShowMore(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const text = section.querySelector('.show-more-text');
    if (!text) return;

    const selector = text.dataset.selector;
    const limit = parseInt(text.dataset.limit);
    const items = Array.from(section.querySelectorAll(selector));
    const hiddenItems = items.filter(item => item.classList.contains('hidden-item'));

    if (hiddenItems.length > 0) {
        hiddenItems.forEach(item => {
            item.classList.remove('hidden-item');
            item.style.display = '';
        });
        text.textContent = 'Show less';
        text.setAttribute('aria-label', 'Show less');
    } else {
        items.forEach((item, index) => {
            if (index >= limit) {
                item.classList.add('hidden-item');
                item.style.display = 'none';
            }
        });
        text.textContent = 'Show more';
        text.setAttribute('aria-label', 'Show more');
    }
}
