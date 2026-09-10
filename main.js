// ==========================================
// 📦 NEXHUB — MAIN & MODAL GALERI (GABUNGAN PERBAIKAN)
// ==========================================

function showLockedNotice(appName) {
  const nameEl = document.getElementById('lockedAppName');
  const modal = document.getElementById('lockedModal');
  if (nameEl && modal) {
    nameEl.innerHTML = `Aplikasi <strong style="color: #f59e0b;">${appName}</strong> tersedia untuk pembelian.`;
    modal.style.display = 'flex';
  }
}

function closeLockedModal() {
  const modal = document.getElementById('lockedModal');
  if (modal) modal.style.display = 'none';
}

function openDetail(appName) {
  const modal = document.getElementById('detailModal');
  const titleEl = document.getElementById('detailTitle');
  const galleryEl = document.getElementById('detailGallery');

  if (!modal || !titleEl || !galleryEl) return;

  let title = '';
  let images = [];

  switch (appName) {
    case 'chess':
      title = '📷 Tampilan NEXHUB CHESS';
      images = ['images/chess-screen-1.png', 'images/chess-screen-2.png', 'images/chess-screen-3.png', 'images/chess-screen-4.png'];
      break;

    case 'fruit':
      title = '📷 Tampilan CRAZY FRUIT WIN';
      images = ['images/fruit-screen-1.png', 'images/fruit-screen-2.png', 'images/fruit-screen-3.png', 'images/fruit-screen-4.png', 'images/fruit-screen-5.png', 'images/fruit-screen-6.png'];
      break;

    case 'steam':
      title = '📷 Tampilan NEXHUB STEAM KASIR';
      images = ['images/steam-screen-1.png', 'images/steam-screen-2.png', 'images/steam-screen-3.png', 'images/steam-screen-4.png', 'images/steam-screen-5.png', 'images/steam-screen-6.png', 'images/steam-screen-7.png'];
      break;

    case 'pos':
      title = '📷 Tampilan NEXHUB POS V1';
      images = ['images/pos-screen-1.png', 'images/pos-screen-2.png'];
      break;

    case 'player':
      title = '📷 Tampilan NEXHUB MEDIA PLAYER';
      images = ['images/player-screen-1.png', 'images/player-screen-2.png', 'images/player-screen-3.png', 'images/player-screen-4.png', 'images/player-screen-5.png', 'images/player-screen-6.png', 'images/player-screen-7.png', 'images/player-screen-8.png', 'images/player-screen-9.png'];
      break;

    default:
      title = '📷 Tampilan Aplikasi';
      images = [];
  }

  titleEl.textContent = title;
  galleryEl.innerHTML = images.map(src => `<img src="${src}" alt="Screenshot" class="screenshot-img" loading="lazy">`).join('');
  modal.style.display = 'flex';
}

function closeDetailModal() {
  const modal = document.getElementById('detailModal');
  if (modal) modal.style.display = 'none';
}

function scrollApps(direction) {
  const container = document.querySelector('.apps-scroll-container');
  if (!container) return;
  const scrollAmount = 290;
  container.scrollBy({
    left: direction * scrollAmount,
    behavior: 'smooth'
  });
}

function uploadAPK() {
  if (typeof window.tampilPesan === 'function') {
    window.tampilPesan('🚧', 'Pengembangan', 'Fitur upload APK sedang dalam pengembangan!\nNantikan update selanjutnya!');
  } else {
    alert('🚧 Fitur upload APK sedang dalam pengembangan!');
  }
}

// OTOMATIS TAMPILKAN NAMA FILE SAAT PILIH FILE APK
document.addEventListener('DOMContentLoaded', function () {
  const apkUpload = document.getElementById('apkUpload');
  if (apkUpload) {
    apkUpload.addEventListener('change', function (e) {
      const fileName = e.target.files?.[0]?.name || 'Belum ada file dipilih';
      const nameEl = document.getElementById('fileName');
      if (nameEl) nameEl.textContent = fileName;
    });
  }
});

// CLOSING OVERLAYS ON CLICK OUTSIDE
window.addEventListener('click', function(e) {
  const detailModal = document.getElementById('detailModal');
  const lockedModal = document.getElementById('lockedModal');
  const loginModal = document.getElementById('loginModal');
  const resetModal = document.getElementById('resetModal');

  if (e.target === detailModal) closeDetailModal();
  if (e.target === lockedModal) closeLockedModal();
  if (e.target === loginModal) window.closeLoginModal();
  if (e.target === resetModal) window.tutupResetModal();
});
