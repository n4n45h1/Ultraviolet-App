let currentEmail = '';
let emails = [];
let autoRefreshInterval;

function generateRandomEmail() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let username = '';
  for (let i = 0; i < 10; i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${username}@1secmail.com`;
}

async function createNewEmail() {
  currentEmail = generateRandomEmail();
  localStorage.setItem('sliply_temp_email', currentEmail);
  document.getElementById('email-address').textContent = currentEmail;
  emails = [];
  updateMailList();
  checkMail();
  startAutoRefresh();
}

async function checkMail() {
  if (!currentEmail) return;

  const [login, domain] = currentEmail.split('@');
  
  try {
    const response = await fetch(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
    const newEmails = await response.json();
    
    if (Array.isArray(newEmails) && newEmails.length > 0) {
      emails = newEmails.reverse();
      updateMailList();
    } else {
      if (emails.length === 0) {
        updateMailList();
      }
    }
  } catch (error) {
    console.error('メールの取得に失敗:', error);
  }
}

function updateMailList() {
  const mailList = document.getElementById('mail-list');
  const inboxCount = document.getElementById('inbox-count');
  
  inboxCount.textContent = `${emails.length} 通`;
  
  if (emails.length === 0) {
    mailList.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M3 7l9 6 9-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p>メールがありません</p>
        <span>新しいメールが届くと、ここに表示されます</span>
      </div>
    `;
    return;
  }
  
  mailList.innerHTML = emails.map((email, index) => {
    const initial = email.from.charAt(0).toUpperCase();
    const fromName = email.from.split('@')[0];
    const timeAgo = getTimeAgo(new Date(email.date));
    
    return `
      <div class="mail-item unread" data-id="${email.id}">
        <div class="mail-avatar">${initial}</div>
        <div class="mail-content">
          <div class="mail-header">
            <span class="mail-from">${fromName}</span>
            <span class="mail-time">${timeAgo}</span>
          </div>
          <div class="mail-subject">${email.subject || '(件名なし)'}</div>
          <div class="mail-preview">クリックして開く...</div>
        </div>
      </div>
    `;
  }).join('');
  
  document.querySelectorAll('.mail-item').forEach(item => {
    item.addEventListener('click', () => {
      const emailId = item.getAttribute('data-id');
      openMail(emailId);
    });
  });
}

async function openMail(emailId) {
  const email = emails.find(e => e.id === parseInt(emailId));
  if (!email) return;
  
  const [login, domain] = currentEmail.split('@');
  
  try {
    const response = await fetch(`https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${emailId}`);
    const fullEmail = await response.json();
    
    document.getElementById('modal-subject').textContent = fullEmail.subject || '(件名なし)';
    document.getElementById('modal-from').textContent = fullEmail.from;
    document.getElementById('modal-to').textContent = fullEmail.to;
    document.getElementById('modal-date').textContent = new Date(fullEmail.date).toLocaleString('ja-JP');
    
    const bodyContent = fullEmail.htmlBody || fullEmail.textBody || 'メール本文がありません';
    document.getElementById('modal-body').innerHTML = bodyContent;
    
    document.getElementById('mail-modal').classList.add('active');
  } catch (error) {
    console.error('メールの詳細取得に失敗:', error);
  }
}

function closeModal() {
  document.getElementById('mail-modal').classList.remove('active');
}

function copyEmail() {
  if (!currentEmail) return;
  
  navigator.clipboard.writeText(currentEmail).then(() => {
    const button = document.getElementById('copy-email');
    const originalHTML = button.innerHTML;
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    setTimeout(() => {
      button.innerHTML = originalHTML;
    }, 2000);
  });
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return `${seconds}秒前`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分前`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  
  const days = Math.floor(hours / 24);
  return `${days}日前`;
}

function startAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
  autoRefreshInterval = setInterval(() => {
    checkMail();
  }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
  const savedEmail = localStorage.getItem('sliply_temp_email');
  
  if (savedEmail) {
    currentEmail = savedEmail;
    document.getElementById('email-address').textContent = currentEmail;
    checkMail();
    startAutoRefresh();
  } else {
    createNewEmail();
  }
  
  document.getElementById('new-email').addEventListener('click', createNewEmail);
  document.getElementById('copy-email').addEventListener('click', copyEmail);
  document.getElementById('refresh-button').addEventListener('click', () => {
    checkMail();
    const button = document.getElementById('refresh-button');
    button.querySelector('svg').style.animation = 'rotate 0.6s ease-in-out';
    setTimeout(() => {
      button.querySelector('svg').style.animation = '';
    }, 600);
  });
  
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('mail-modal').addEventListener('click', (e) => {
    if (e.target.id === 'mail-modal') {
      closeModal();
    }
  });
});

window.addEventListener('beforeunload', () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
});
