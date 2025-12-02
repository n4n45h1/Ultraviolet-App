const STORAGE_KEYS = {
    SITE_TITLE: 'sliply_site_title',
    FAVICON: 'sliply_favicon',
    BOOKMARKS: 'sliply_bookmarks'
};

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadBookmarks();
    attachEventListeners();
});

function loadSettings() {
    const savedTitle = localStorage.getItem(STORAGE_KEYS.SITE_TITLE);
    if (savedTitle) {
        document.getElementById('site-title').value = savedTitle;
        document.title = `設定 | ${savedTitle}`;
    }

    const savedFavicon = localStorage.getItem(STORAGE_KEYS.FAVICON);
    if (savedFavicon) {
        document.getElementById('favicon-preview-img').src = savedFavicon;
    }
}

function saveSiteSettings() {
    const title = document.getElementById('site-title').value.trim();
    
    if (title) {
        localStorage.setItem(STORAGE_KEYS.SITE_TITLE, title);
        document.title = `設定 | ${title}`;
        updateMainPageTitle(title);
    } else {
        localStorage.removeItem(STORAGE_KEYS.SITE_TITLE);
    }
    
    showToast('設定を保存しました', 'success');
}

function handleFaviconUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
        showToast('ファイルサイズは1MB以下にしてください', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataURL = e.target.result;
        localStorage.setItem(STORAGE_KEYS.FAVICON, dataURL);
        document.getElementById('favicon-preview-img').src = dataURL;
        updateMainPageFavicon(dataURL);
        showToast('ファビコンを変更しました', 'success');
    };
    reader.readAsDataURL(file);
}

function resetFavicon() {
    localStorage.removeItem(STORAGE_KEYS.FAVICON);
    document.getElementById('favicon-preview-img').src = 'favicon.ico';
    document.getElementById('favicon-upload').value = '';
    updateMainPageFavicon('favicon.ico');
    showToast('ファビコンをリセットしました', 'success');
}

function updateMainPageTitle(title) {
    localStorage.setItem('sliply_title_update', Date.now().toString());
}

function updateMainPageFavicon(faviconURL) {
    localStorage.setItem('sliply_favicon_update', Date.now().toString());
}

function loadBookmarks() {
    const bookmarks = getBookmarks();
    const bookmarksList = document.getElementById('bookmarks-list');
    
    if (bookmarks.length === 0) {
        bookmarksList.innerHTML = `
            <div class="empty-bookmarks">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>ブックマークがありません</p>
            </div>
        `;
        return;
    }
    
    bookmarksList.innerHTML = bookmarks.map((bookmark, index) => `
        <div class="bookmark-item" data-index="${index}">
            <div class="bookmark-info">
                <div class="bookmark-name">${escapeHtml(bookmark.name)}</div>
                <div class="bookmark-url">${escapeHtml(bookmark.url)}</div>
            </div>
            <div class="bookmark-actions">
                <button class="btn-bookmark-action btn-bookmark-edit" onclick="editBookmark(${index})" title="編集">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="btn-bookmark-action btn-bookmark-delete" onclick="deleteBookmark(${index})" title="削除">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function getBookmarks() {
    const bookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return bookmarks ? JSON.parse(bookmarks) : [];
}


function saveBookmarks(bookmarks) {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    localStorage.setItem('sliply_bookmarks_update', Date.now().toString());
}

function addBookmark() {
    const name = document.getElementById('bookmark-name').value.trim();
    const url = document.getElementById('bookmark-url').value.trim();
    
    if (!name || !url) {
        showToast('名前とURLを入力してください', 'error');
        return;
    }
    
    if (!isValidURL(url)) {
        showToast('正しいURLを入力してください', 'error');
        return;
    }
    
    const bookmarks = getBookmarks();
    bookmarks.push({ name, url });
    saveBookmarks(bookmarks);
    
    document.getElementById('bookmark-name').value = '';
    document.getElementById('bookmark-url').value = '';
    
    loadBookmarks();
    showToast('ブックマークを追加しました', 'success');
}


function editBookmark(index) {
    const bookmarks = getBookmarks();
    const bookmark = bookmarks[index];
    
    const name = prompt('ブックマーク名を編集:', bookmark.name);
    if (name === null) return;
    
    const url = prompt('URLを編集:', bookmark.url);
    if (url === null) return;
    
    if (!name.trim() || !url.trim()) {
        showToast('名前とURLを入力してください', 'error');
        return;
    }
    
    if (!isValidURL(url)) {
        showToast('正しいURLを入力してください', 'error');
        return;
    }
    
    bookmarks[index] = { name: name.trim(), url: url.trim() };
    saveBookmarks(bookmarks);
    loadBookmarks();
    showToast('ブックマークを更新しました', 'success');
}

function deleteBookmark(index) {
    if (!confirm('このブックマークを削除しますか？')) return;
    
    const bookmarks = getBookmarks();
    bookmarks.splice(index, 1);
    saveBookmarks(bookmarks);
    loadBookmarks();
    showToast('ブックマークを削除しました', 'success');
}

function resetAllSettings() {
    if (!confirm('すべての設定をリセットしますか？この操作は取り消せません。')) return;
    
    localStorage.removeItem(STORAGE_KEYS.SITE_TITLE);
    localStorage.removeItem(STORAGE_KEYS.FAVICON);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    
    document.getElementById('site-title').value = '';
    document.getElementById('favicon-preview-img').src = 'favicon.ico';
    document.getElementById('favicon-upload').value = '';
    
    loadBookmarks();
    showToast('すべての設定をリセットしました', 'success');
    
    updateMainPageTitle('');
    updateMainPageFavicon('favicon.ico');
}

function attachEventListeners() {
    document.getElementById('save-site-settings').addEventListener('click', saveSiteSettings);
    document.getElementById('favicon-upload').addEventListener('change', handleFaviconUpload);
    document.getElementById('reset-favicon').addEventListener('click', resetFavicon);
    document.getElementById('add-bookmark').addEventListener('click', addBookmark);
    document.getElementById('bookmark-url').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addBookmark();
    });
    document.getElementById('reset-all').addEventListener('click', resetAllSettings);
}

function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}