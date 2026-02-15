document.addEventListener('DOMContentLoaded', function() {
    initShowMore('publications', '.publication', 3);
    initShowMore('projects', '.project', 3);
    initShowMore('contributions', '.contribution', 3);
});

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

