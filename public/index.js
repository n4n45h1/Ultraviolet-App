"use strict";

let connection;

async function initConnection() {
	if (!connection && typeof BareMux !== 'undefined') {
		try {
			connection = new BareMux.BareMuxConnection("/baremux/worker.js");
		} catch (err) {
			console.error('Failed to initialize BareMux connection:', err);
			throw err;
		}
	}
	return connection;
}

async function openProxyUrl(url) {
	await initConnection();
	
	const error = document.getElementById("uv-error");
	const errorCode = document.getElementById("uv-error-code");
	
	try {
		await registerSW();
	} catch (err) {
		error.textContent = "Failed to register service worker.";
		errorCode.textContent = err.toString();
		throw err;
	}

	const frame = document.getElementById("uv-frame");
	frame.style.display = "block";
	const wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
	
	if (connection) {
		try {
			if (await connection.getTransport() !== "/epoxy/index.mjs") {
				await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
			}
		} catch (err) {
			console.error('Transport setup failed:', err);
		}
	}
	
	frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
}

function getBookmarks() {
	const bookmarks = localStorage.getItem('sliply_bookmarks');
	if (bookmarks) {
		return JSON.parse(bookmarks);
	}
	const defaultBookmarks = [
		{ name: 'Google', url: 'https://www.google.com' },
		{ name: 'Bing', url: 'https://www.bing.com' },
		{ name: 'YouTube', url: 'https://www.youtube.com' },
		{ name: 'TikTok', url: 'https://www.tiktok.com' }
	];
	localStorage.setItem('sliply_bookmarks', JSON.stringify(defaultBookmarks));
	return defaultBookmarks;
}

function getIconForUrl(url) {
	const domain = url.toLowerCase();
	if (domain.includes('google')) {
		return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
			<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
			<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
			<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
		</svg>`;
	} else if (domain.includes('youtube')) {
		return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000"/>
		</svg>`;
	} else if (domain.includes('tiktok')) {
		return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" fill="#000000"/>
		</svg>`;
	} else if (domain.includes('instagram')) {
		return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<linearGradient id="ig${Math.random()}" x1="0%" y1="100%" x2="100%" y2="0%">
					<stop offset="0%" style="stop-color:#FED373"/>
					<stop offset="15%" style="stop-color:#F15245"/>
					<stop offset="30%" style="stop-color:#D92E7F"/>
					<stop offset="50%" style="stop-color:#9B36B7"/>
					<stop offset="85%" style="stop-color:#515ECF"/>
				</linearGradient>
			</defs>
			<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" fill="url(#ig${Math.random()})"/>
		</svg>`;
	} else {
		return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
		</svg>`;
	}
}

function loadQuickLinks() {
	try {
		const bookmarks = getBookmarks();
		const quickLinksContainer = document.getElementById('quick-links');
		
		if (!quickLinksContainer) {
			console.error('Quick links container not found');
			return;
		}
		
		if (!bookmarks || bookmarks.length === 0) {
			quickLinksContainer.innerHTML = '';
			return;
		}
		
		quickLinksContainer.innerHTML = bookmarks.map(bookmark => `
			<a href="#" class="quick-link" data-url="${bookmark.url}" title="${bookmark.name}">
				${getIconForUrl(bookmark.url)}
				<span>${bookmark.name}</span>
			</a>
		`).join('');
		
		document.querySelectorAll('.quick-link').forEach(link => {
			link.addEventListener('click', async (event) => {
				event.preventDefault();
				const url = event.currentTarget.getAttribute('data-url');
				if (url) {
					try {
						await openProxyUrl(url);
					} catch (err) {
						console.error('Error opening bookmark:', err);
					}
				}
			});
		});
	} catch (err) {
		console.error('Error loading quick links:', err);
	}
}

function applySettings() {
	const savedTitle = localStorage.getItem('sliply_site_title');
	if (savedTitle) {
		document.title = savedTitle;
	}
	
	const savedFavicon = localStorage.getItem('sliply_favicon');
	if (savedFavicon) {
		let link = document.querySelector("link[rel*='icon']");
		if (!link) {
			link = document.createElement('link');
			link.rel = 'shortcut icon';
			document.head.appendChild(link);
		}
		link.href = savedFavicon;
	}
}

function setupEventListeners() {
	const form = document.getElementById("uv-form");
	const address = document.getElementById("uv-address");
	const searchEngine = document.getElementById("uv-search-engine");

	if (form) {
		form.addEventListener("submit", async (event) => {
			event.preventDefault();
			
			const error = document.getElementById("uv-error");
			const errorCode = document.getElementById("uv-error-code");
			
			try {
				const url = search(address.value, searchEngine.value);
				await openProxyUrl(url);
			} catch (err) {
				console.error('Error:', err);
				error.textContent = "エラーが発生しました。";
				errorCode.textContent = err.toString();
			}
			
			return false;
		});
	}

	window.addEventListener('storage', (e) => {
		if (e.key === 'sliply_title_update' || e.key === 'sliply_favicon_update') {
			applySettings();
		}
		if (e.key === 'sliply_bookmarks_update' || e.key === 'sliply_bookmarks') {
			loadQuickLinks();
		}
	});
}

if (typeof BareMux === 'undefined') {
	console.warn('BareMux not loaded yet, waiting...');
	let attempts = 0;
	const checkBareMux = setInterval(() => {
		attempts++;
		if (typeof BareMux !== 'undefined') {
			clearInterval(checkBareMux);
			console.log('BareMux loaded successfully');
			setupEventListeners();
			applySettings();
			loadQuickLinks();
		} else if (attempts > 50) {
			clearInterval(checkBareMux);
			console.error('BareMux failed to load after 5 seconds');
			setupEventListeners();
			applySettings();
			loadQuickLinks();
		}
	}, 100);
} else {
	setupEventListeners();
	applySettings();
	loadQuickLinks();
}
