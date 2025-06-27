const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchBtn');
const image = document.getElementById('image');

// Helper to render articles
function renderArticles(articles) {
    image.innerHTML = ''; // Clear previous results
    articles.forEach(item => {
        // Create container for image and overlay
        const container = document.createElement('div');
        container.className = 'news_image_container';
        container.style.position = 'relative';
        container.style.display = 'inline-block';
        container.style.width = '100%';
        container.style.marginBottom = '24px';

        // Create image element
        const img = document.createElement('img');
        img.setAttribute('class', 'news_image');
        img.src = item.image_url;
        img.style.width = '100%';
        img.style.display = 'block';

        // Create gradient overlay
        const overlay = document.createElement('div');
        overlay.className = 'news_image_overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4))';

        // Create text overlay
        const text = document.createElement('div');
        text.className = 'news_image_text';
        text.style.position = 'absolute';
        text.style.bottom = '16px';
        text.style.left = '16px';
        text.style.color = '#fff';
        text.style.zIndex = 2;
        text.style.textShadow = '0 2px 8px rgba(0,0,0,0.7)';
        text.innerHTML = `
            <div style="font-size:1.2em;font-weight:bold;margin-bottom:4px;">${item.title || ''}</div>
            <div style="font-size:1em;">${item.description || ''}</div>
            <button class="read-more-btn" data-link="${item.link || '#'}">Read More</button>
        `;

        // Assemble
        container.appendChild(img);
        container.appendChild(overlay);
        container.appendChild(text);
        image.appendChild(container);
    });
    initializeSliderNavigation();
}

// Fetch and show default articles on load
function loadDefaultArticles() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `news.json`, true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            renderArticles(response.results);
        } else {
            alert('Failed to fetch news.');
        }
    };
    xhr.onerror = function() {
        alert('Network error.');
    };
    xhr.send();
}

// Search functionality
searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://newsdata.io/api/1/latest?apikey=pub_60532db82a99eb1d6b1e6dd5202381a2bd965&q=${encodeURIComponent(searchInput.value)}&size=10`, true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            renderArticles(response.results);
        } else {
            alert('Failed to fetch news.');
        }
    };
    xhr.onerror = function() {
        alert('Network error.');
    };
    xhr.send();
});

// Call this on load
window.addEventListener('DOMContentLoaded', () => {
    loadDefaultArticles();
    showSwipeHint();
});


const next = document.getElementById('next');
const prev = document.getElementById('previous');

next.addEventListener('click', (e)=>{
    e.preventDefault();
    window.scrollBy({ top: window.innerHeight, left: 0, behavior: 'smooth' });
})

prev.addEventListener('click', (e)=>{
    e.preventDefault();
    window.scrollBy({ top: -window.innerHeight, left: 0, behavior: 'smooth' });
})


// document.addEventListener('scroll', (e)=>{
//     e.preventDefault();
//     window.scrollBy({ top: window.innerHeight, left: 0, behavior: 'smooth' });
// })

document.getElementById('scrollToTop').addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Set overflow hidden on body to prevent scrolling
document.body.style.overflow = 'hidden';

// Enable scrolling only via next/previous buttons
let currentScroll = 0;
const maxScroll = document.body.scrollHeight - window.innerHeight;

function scrollToPosition(pos) {
    currentScroll = Math.max(0, Math.min(pos, maxScroll));
    window.scrollTo({ top: currentScroll, behavior: 'smooth' });
}

next.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToPosition(currentScroll + window.innerHeight);
});

prev.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToPosition(currentScroll - window.innerHeight);
});
window.addEventListener('scroll', () => {
    const images = document.querySelectorAll('.news_image');
    const scrollY = window.scrollY;
    images.forEach((img, idx) => {
        // Parallax: move images at different speed based on their index
        img.style.transform = `translateY(${scrollY * (0.1 + idx * 0.05)}px)`;
    });
});
document.getElementById('scrollToTop').addEventListener('click', (e) => {
    e.preventDefault();
    scrollToPosition(0);
});

function initializeSliderNavigation() {
    const containers = document.querySelectorAll('.news_image_container');
    let currentIndex = 0;

    function showImage(index) {
        containers.forEach((container, i) => {
            container.style.display = i === index ? 'block' : 'none';
            container.style.transition = 'opacity 0.3s';
            container.style.opacity = i === index ? '1' : '0';
        });
    }

    showImage(currentIndex);

    const next = document.getElementById('next');
    const prev = document.getElementById('previous');

    next.onclick = function(e) {
        e.preventDefault();
        if (currentIndex < containers.length - 1) {
            currentIndex++;
            showImage(currentIndex);
        }
    };
    prev.onclick = function(e) {
        e.preventDefault();
        if (currentIndex > 0) {
            currentIndex--;
            showImage(currentIndex);
        }
    };
    document.getElementById('scrollToTop').onclick = function(e) {
        e.preventDefault();
        currentIndex = 0;
        showImage(currentIndex);
    };

    // Remove any previous Hammer instance
    if (window._hammerInstance) {
        window._hammerInstance.destroy();
    }

    // Hammer.js swipe support (vertical)
    const imageContainer = document.getElementById('image');
    const hammer = new Hammer(imageContainer);
    window._hammerInstance = hammer;
    hammer.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });

    hammer.on('swipeup', function() {
        if (currentIndex < containers.length - 1) {
            currentIndex++;
            showImage(currentIndex);
        }
    });

    hammer.on('swipedown', function() {
        if (currentIndex > 0) {
            currentIndex--;
            showImage(currentIndex);
        }
    });
}

// After rendering news, call this:
initializeSliderNavigation();

document.getElementById('scrollToTop').addEventListener('click', (e) => {
    e.preventDefault();
    currentIndex = 0;
    showImage(currentIndex);
});

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('read-more-btn')) {
        e.preventDefault();
        const url = e.target.getAttribute('data-link');
        if (confirm('This link will take you out of CurNews. Are you sure you wanna leave us?')) {
            window.open(url, '_blank');
        }
    }
});

async function translateText(text, targetLang) {
    if (!text) return '';
    if (targetLang === 'en') return text; // No translation needed
    try {
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
        );
        if (!response.ok) throw new Error('Translation API error');
        const data = await response.json();
        // Sometimes the API returns the original text if it can't translate
        return data.responseData.translatedText || text;
    } catch (err) {
        // Fallback: return original text if translation fails
        console.warn('Translation failed:', err);
        return text;
    }
}

async function updateLanguage(lang) {
    const containers = document.querySelectorAll('.news_image_container');
    for (const container of containers) {
        const titleDiv = container.querySelector('.news_image_text div:nth-child(1)');
        const descDiv = container.querySelector('.news_image_text div:nth-child(2)');
        // Store original text in data attributes if not already stored
        if (!titleDiv.dataset.original) titleDiv.dataset.original = titleDiv.textContent;
        if (!descDiv.dataset.original) descDiv.dataset.original = descDiv.textContent;
        // Translate and update
        titleDiv.textContent = await translateText(titleDiv.dataset.original, lang);
        descDiv.textContent = await translateText(descDiv.dataset.original, lang);
    }
}

// Listen for language change
document.getElementById('languageSelect').addEventListener('change', async function() {
    const lang = this.value;
    await updateLanguage(lang);
});

// Optionally, auto-detect user language on load
window.addEventListener('DOMContentLoaded', async () => {
    const userLang = navigator.language.slice(0,2);
    const select = document.getElementById('languageSelect');
    if ([...select.options].some(opt => opt.value === userLang)) {
        select.value = userLang;
        await updateLanguage(userLang);
    }
});

// Initialize Hammer.js on the image container
const hammer = new Hammer(imageContainer);

// Only listen for horizontal swipes
hammer.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });

hammer.on('swipeup', function() {
    if (currentIndex < containers.length - 1) {
        currentIndex++;
        showImage(currentIndex);
    }
});

hammer.on('swipedown', function() {
    if (currentIndex > 0) {
        currentIndex--;
        showImage(currentIndex);
    }
});

// Show swipe hint popup on mobile screens
function showSwipeHint() {
    if (window.innerWidth <= 768) { // mobile/tablet
        const hint = document.createElement('div');
        hint.id = 'swipeHintPopup';
        hint.textContent = 'Swipe up/down to see posts';
        hint.style.position = 'fixed';
        hint.style.top = 0;
        hint.style.left = 0;
        hint.style.width = '100vw';
        hint.style.height = '100vh';
        hint.style.background = 'rgba(0,0,0,0.85)';
        hint.style.color = '#fff';
        hint.style.display = 'flex';
        hint.style.alignItems = 'center';
        hint.style.justifyContent = 'center';
        hint.style.fontSize = '2em';
        hint.style.zIndex = 9999;
        hint.style.transition = 'opacity 0.5s';
        hint.style.opacity = '1';
        document.body.appendChild(hint);

        setTimeout(() => {
            hint.style.opacity = '0';
            setTimeout(() => {
                if (hint.parentNode) hint.parentNode.removeChild(hint);
            }, 500);
        }, 3000);
    }
}

// Call the function after DOMContentLoaded
window.addEventListener('DOMContentLoaded', showSwipeHint);