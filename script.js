document.addEventListener('DOMContentLoaded', async function() {
    const content = await loadContent();
    if (!content) return;

    renderBio(content.bio);
    renderWork(content.items);
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

function renderWork(items) {
    const container = document.getElementById('work-container');
    container.innerHTML = items.map(item => createWorkItemHTML(item)).join('');
    
    container.querySelectorAll('.work-item').forEach((el, index) => {
        el.addEventListener('click', (e) => {
            if (e.target.closest('a, button')) return;
            window.open(items[index].url, '_blank');
        });
    });
}

function getItemType(tags) {
    if (tags?.includes('paper')) return 'paper';
    if (tags?.includes('project')) return 'project';
    if (tags?.includes('contribution')) return 'contribution';
    return 'other';
}

function createWorkItemHTML(item) {
    const type = getItemType(item.tags);
    const typeLabels = { paper: 'Paper', project: 'Project', contribution: 'Contribution', other: 'Other' };
    const typeTag = `<span class="tag tag-type-${type}">${typeLabels[type]}</span>`;
    const tags = item.tags
        ?.filter(tag => !['paper', 'project', 'contribution'].includes(tag))
        ?.map(tag => `<span class="tag tag-${tag.replace(/\s+/g, '-')}">${escapeHtml(tag)}</span>`)
        .join('') || '';
    
    let subtitle = '';
    let linkButton = '';
    if (type === 'paper') {
        subtitle = escapeHtml(item.meta);
        if (item.links?.github) {
            linkButton = `<button class="work-item-link" onclick="window.open('${item.links.github}', '_blank')">GitHub</button>`;
        }
    } else if (type === 'contribution') {
        subtitle = escapeHtml(item.links?.[0]?.label || '');
    }
    
    const desc = type === 'paper' 
        ? (item.contributors ? `Contributors: ${item.contributors.map(c => c === 'Kalle Mäkelä' ? `<strong>${escapeHtml(c)}</strong>` : escapeHtml(c)).join('; ')}` : '')
        : escapeHtml(item.description);

    const closedSourceNote = item.tags?.includes('closed-source') 
        ? '<div class="work-item-closed-source">Closed-source project, details available on request</div>' 
        : '';

    const thumbnailHTML = createThumbnailHTML(item.thumbnail);

    const titleLink = `<a href="${item.url}" class="work-item-title-link" target="_blank">${escapeHtml(item.title)}</a>`;
    
    return `<div class="work-item">
        <a href="${item.url}" class="work-item-thumbnail-link" target="_blank">${thumbnailHTML}</a>
        <div class="work-item-title">${titleLink}</div>
        ${subtitle ? `<div class="work-item-subtitle">${subtitle}</div>` : ''}
        ${linkButton ? `<div class="work-item-links">${linkButton}</div>` : ''}
        ${desc ? `<div class="work-item-desc">${desc}</div>` : ''}
        ${closedSourceNote}
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
