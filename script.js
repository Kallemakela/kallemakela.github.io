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
        ...content.publications.map(p => ({ ...p, type: 'publication' })),
        ...content.projects.map(p => ({ ...p, type: 'project' })),
        ...content.contributions.map(c => ({ ...c, type: 'contribution' }))
    ];
    container.innerHTML = workItems.map(item => createWorkItemHTML(item)).join('');
}

function createWorkItemHTML(item) {
    const typeLabels = { publication: 'Publication', project: 'Project', contribution: 'Contribution' };
    const typeTag = `<span class="tag tag-type-${item.type}">${typeLabels[item.type]}</span>`;
    const tags = item.tags.map(tag => `<span class="tag tag-${tag.replace(/\s+/g, '-')}">${escapeHtml(tag)}</span>`).join('');
    
    let subtitle = '';
    let linkButton = '';
    if (item.type === 'publication') {
        subtitle = escapeHtml(item.meta);
        if (item.links?.github) {
            linkButton = `<button class="work-item-link" onclick="event.stopPropagation(); event.preventDefault(); window.open('${item.links.github}', '_blank');">GitHub</button>`;
        }
    } else if (item.type === 'contribution') {
        subtitle = escapeHtml(item.links?.[0]?.label || '');
    }
    
    const desc = item.type === 'publication' 
        ? (item.contributors ? `Contributors: ${item.contributors.map(c => c === 'Kalle Mäkelä' ? `<strong>${escapeHtml(c)}</strong>` : escapeHtml(c)).join('; ')}` : '')
        : escapeHtml(item.description);

    return `<a href="${item.url}" class="work-item" target="_blank">
        <div class="work-item-title">${escapeHtml(item.title)}</div>
        ${subtitle ? `<div class="work-item-subtitle">${subtitle}</div>` : ''}
        ${linkButton ? `<div class="work-item-links">${linkButton}</div>` : ''}
        ${desc ? `<div class="work-item-desc">${desc}</div>` : ''}
        <div class="work-item-tags">${typeTag}${tags}</div>
    </a>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
