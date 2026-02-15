document.addEventListener('DOMContentLoaded', async function() {
    const content = await loadContent();
    if (!content) return;

    renderBio(content.bio);
    renderWork(content);
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

function renderWork(content) {
    const container = document.getElementById('work-container');
    const workItems = [
        ...content.papers.map(p => ({ ...p, type: 'paper' })),
        ...content.projects.map(p => ({ ...p, type: 'project' })),
        ...content.contributions.map(c => ({ ...c, type: 'contribution' }))
    ];
    container.innerHTML = workItems.map(item => createWorkItemHTML(item)).join('');
}

function createWorkItemHTML(item) {
    const typeLabels = { paper: 'Paper', project: 'Project', contribution: 'Contribution' };
    const typeTag = `<span class="tag tag-type-${item.type}">${typeLabels[item.type]}</span>`;
    const tags = item.tags.map(tag => `<span class="tag tag-${tag.replace(/\s+/g, '-')}">${escapeHtml(tag)}</span>`).join('');
    
    let subtitle = '';
    let linkButton = '';
    if (item.type === 'paper') {
        subtitle = escapeHtml(item.meta);
        if (item.links?.github) {
            linkButton = `<button class="work-item-link" onclick="window.open('${item.links.github}', '_blank')">GitHub</button>`;
        }
    } else if (item.type === 'contribution') {
        subtitle = escapeHtml(item.links?.[0]?.label || '');
    }
    
    const desc = item.type === 'paper' 
        ? (item.contributors ? `Contributors: ${item.contributors.map(c => c === 'Kalle Mäkelä' ? `<strong>${escapeHtml(c)}</strong>` : escapeHtml(c)).join('; ')}` : '')
        : escapeHtml(item.description);

    const thumbnailHTML = createThumbnailHTML(item.thumbnail);

    const titleLink = `<a href="${item.url}" class="work-item-title-link" target="_blank">${escapeHtml(item.title)}</a>`;
    
    return `<div class="work-item">
        <a href="${item.url}" class="work-item-thumbnail-link" target="_blank">${thumbnailHTML}</a>
        <div class="work-item-title">${titleLink}</div>
        ${subtitle ? `<div class="work-item-subtitle">${subtitle}</div>` : ''}
        ${linkButton ? `<div class="work-item-links">${linkButton}</div>` : ''}
        ${desc ? `<div class="work-item-desc">${desc}</div>` : ''}
        <div class="work-item-tags">${typeTag}${tags}</div>
    </div>`;
}

function createThumbnailHTML(thumbnailPath) {
    if (!thumbnailPath) return '';
    
    if (thumbnailPath.endsWith('.mp4')) {
        return `<div class="work-item-thumbnail"><video autoplay loop muted playsinline src="${thumbnailPath}"></video></div>`;
    } else {
        return `<div class="work-item-thumbnail"><img src="${thumbnailPath}" alt="" loading="lazy"></div>`;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
