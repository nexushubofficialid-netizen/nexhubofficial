// ==========================================
// 🔐 NEXHUB — AUTHENTIKASI & SISTEM ANGGOTA
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyA9985mhD5nBJx9u1i4xWFD5IgQC2NmbWM",
  authDomain: "nexhub-official.firebaseapp.com",
  databaseURL: "https://nexhub-official-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nexhub-official",
  storageBucket: "nexhub-official.firebasestorage.app",
  messagingSenderId: "311108797454",
  appId: "1:311108797454:web:d292cca3e934b0c29b685f",
  measurementId: "G-8L61PMMG9K"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.database();

const EMAILJS_PUBLIC_KEY = "bFQIno_6vavgplc4N";
const EMAILJS_SERVICE_ID = "service_7fpp2tg";
const EMAILJS_TEMPLATE_ID = "template_xngmwn9";

if (typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

let alamatWalletSaatIni = '';
let memberRefListener = null;

// 💡 FUNGSI PEMFORMAT ANGKA BESAR (K, M, B)
function formatAngka(num) {
  if (num === undefined || num === null || isNaN(num) || num === 0) return '0';
  
  if (num >= 1000000000) {
    return (num / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + 'M';
  }
  if (num >= 10000) {
    return (num / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + 'K';
  }
  return num.toLocaleString('id-ID');
}

// 💡 FUNGSI TAMPILKAN NOMINAL ASLI SAAT DITEKAN
window.tampilkanDiamondAsli = function(el, nominalAsli) {
  const spanText = el.querySelector('.diamond-text');
  if (spanText) {
    spanText.textContent = Number(nominalAsli).toLocaleString('id-ID');
  }
};

// 💡 FUNGSI KEMBALIKAN NOMINAL SINGKAT SAAT DILEPAS
window.sembunyikanDiamondAsli = function(el, nominalAsli) {
  const spanText = el.querySelector('.diamond-text');
  if (spanText) {
    spanText.textContent = formatAngka(Number(nominalAsli));
  }
};

// CUSTOM MODAL PESAN
window.tampilPesan = function(ikon, judul, teks, tombolAksi = null) {
  const elIkon = document.getElementById('pesanIkon');
  const elJudul = document.getElementById('pesanJudul');
  const elTeks = document.getElementById('pesanTeks');
  const elAksi = document.getElementById('pesanAksi');
  const modal = document.getElementById('pesanModal');
  
  if (elIkon) elIkon.textContent = ikon;
  if (elJudul) elJudul.textContent = judul;
  if (elTeks) elTeks.textContent = teks;
  
  if (elAksi) {
    if (tombolAksi) {
      elAksi.innerHTML = '';
      elAksi.appendChild(tombolAksi);
    } else {
      elAksi.innerHTML = `<button onclick="tutupPesanModal()" class="btn-primary-modal" style="background:#3b82f6;">Mengerti</button>`;
    }
  }
  
  if (modal) modal.style.display = 'flex';
};

window.tutupPesanModal = function() {
  const modal = document.getElementById('pesanModal');
  if (modal) modal.style.display = 'none';
};

// UTILS
window.togglePass = function(inputId, eyeId) {
  const input = document.getElementById(inputId);
  const eye = document.getElementById(eyeId);
  if (!input || !eye) return;
  
  if (input.type === 'password') {
    input.type = 'text';
    eye.textContent = '🙈';
  } else {
    input.type = 'password';
    eye.textContent = '👁️';
  }
};

function buatAlamatWallet() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let bagian1 = '',
    bagian2 = '';
  for (let i = 0; i < 4; i++) {
    bagian1 += chars.charAt(Math.floor(Math.random() * chars.length));
    bagian2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NEX-${bagian1}-${bagian2}`;
}

window.salinWalletDariModal = function() {
  if (!alamatWalletSaatIni) return;
  navigator.clipboard.writeText(alamatWalletSaatIni)
    .then(() => window.tampilPesan('✅', 'Disalin!', 'Alamat wallet berhasil disalin ke papan klip.'))
    .catch(() => window.tampilPesan('✅', 'Disalin!', 'Alamat wallet disalin!'));
};

window.tutupModalSukses = function() {
  const modal = document.getElementById('modalSukses');
  if (modal) modal.style.display = 'none';
  window.openLoginModal();
};

// MODAL CONTROL
window.openLoginModal = function() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.style.display = 'flex';
  window.switchToLogin();
};

window.closeLoginModal = function() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.style.display = 'none';
};

window.switchToDaftar = function() {
  document.getElementById('formLogin').style.display = 'none';
  document.getElementById('formDaftar').style.display = 'block';
  document.getElementById('loginTitle').textContent = '📝 Daftar Akun Baru';
};

window.switchToLogin = function() {
  document.getElementById('formDaftar').style.display = 'none';
  document.getElementById('formLogin').style.display = 'block';
  document.getElementById('loginTitle').textContent = '🔑 Masuk ke NEXHUB';
};

window.bukaResetModal = function() {
  window.closeLoginModal();
  document.getElementById('resetModal').style.display = 'flex';
  document.getElementById('resetEmail').value = '';
};

window.tutupResetModal = function() {
  document.getElementById('resetModal').style.display = 'none';
  window.openLoginModal();
};

// EMAILJS NOTIFIKASI
async function kirimEmailSelamatDatang(nama, email, wallet, diamond) {
  if (typeof emailjs === 'undefined') return;
  const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      nama: nama,
      email: email,
      wallet: wallet,
      diamond: diamond,
      tanggal: tanggal
    });
  } catch (err) {
    console.log('⚠️ Gagal kirim email:', err);
  }
}

// AUTH ACTIONS
window.daftarUser = async function() {
  const nama = document.getElementById('daftarNama')?.value.trim();
  const email = document.getElementById('daftarEmail')?.value.trim();
  const pass = document.getElementById('daftarPass')?.value;
  
  if (!nama || !email || !pass) return window.tampilPesan('⚠️', 'Lengkapi Data', 'Silakan isi semua kolom yang wajib.');
  if (pass.length < 6) return window.tampilPesan('⚠️', 'Kata Sandi Pendek', 'Kata sandi minimal 6 karakter.');
  
  alamatWalletSaatIni = buatAlamatWallet();
  
  try {
    const userCred = await auth.createUserWithEmailAndPassword(email, pass);
    const user = userCred.user;
    
    await db.ref('members/' + user.uid).set({
      nama: nama,
      email: email,
      alamatWallet: alamatWalletSaatIni,
      diamond: 0,
      saldo: 0,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    });
    
    await user.sendEmailVerification();
    await kirimEmailSelamatDatang(nama, email, alamatWalletSaatIni, 0);
    
    document.getElementById('suksesNama').textContent = nama;
    document.getElementById('suksesWallet').textContent = alamatWalletSaatIni;
    document.getElementById('modalSukses').style.display = 'flex';
    window.closeLoginModal();
    
  } catch (err) {
    window.tampilPesan('❌', 'Gagal Daftar', err.message);
  }
};

window.loginUser = async function() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const pass = document.getElementById('loginPass')?.value;
  
  if (!email || !pass) return window.tampilPesan('⚠️', 'Lengkapi Data', 'Silakan isi email dan kata sandi.');
  
  try {
    await auth.signInWithEmailAndPassword(email, pass);
    window.tampilPesan('✅', 'Berhasil Masuk', 'Selamat datang kembali!');
    window.closeLoginModal();
  } catch (err) {
    window.tampilPesan('❌', 'Gagal Masuk', err.message);
  }
};

window.kirimResetEmail = async function() {
  const email = document.getElementById('resetEmail')?.value.trim();
  if (!email) return window.tampilPesan('⚠️', 'Email Kosong', 'Silakan masukkan email Anda.');
  
  try {
    await auth.sendPasswordResetEmail(email);
    window.tampilPesan('✅', 'Link Terkirim!', `Link reset kata sandi telah dikirim ke:\n${email}`);
    window.tutupResetModal();
  } catch (err) {
    let pesan = err.code === 'auth/user-not-found' ? 'Email tidak terdaftar.' : err.message;
    window.tampilPesan('❌', 'Gagal Kirim', pesan);
  }
};

window.logoutUser = function() {
  const btnKonfirmasi = document.createElement('button');
  btnKonfirmasi.className = 'btn-primary-modal';
  btnKonfirmasi.style.background = '#ef4444';
  btnKonfirmasi.textContent = 'Ya, Keluar';
  btnKonfirmasi.onclick = () => {
    auth.signOut();
    window.tutupPesanModal();
  };
  
  window.tampilPesan('⚠️', 'Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari akun ini?', btnKonfirmasi);
};

// AUTH OBSERVER REALTIME — SALDO + DIAMOND DIGABUNG!
auth.onAuthStateChanged((user) => {
  const navSaldo = document.getElementById('navSaldo');
  if (!navSaldo) return;
  
  if (user) {
    if (memberRefListener) {
      memberRefListener.off();
    }
    
    memberRefListener = db.ref('members/' + user.uid);
    memberRefListener.on('value', (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const nama = data.nama || 'Pengguna';
      const wallet = data.alamatWallet || 'Belum ada';
      const saldo = Number(data.saldo) || 0;
      const diamond = Number(data.diamond) || 0;
      const fotoUrl = data.fotoUrl || null;
      
      // 🟢 SIMPAN DIAMOND KE VARIABLE GLOBAL (AGAR DIBACA SYSTEM LAIN)
      window.userDiamondAvailable = diamond;

      // 🖼️ ELEMEN FOTO ATAU ICON DEFAULT
      const htmlAvatar = fotoUrl 
        ? `<img src="${fotoUrl}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1.5px solid #38bdf8; display: inline-block;">` 
        : `👤`;

      navSaldo.innerHTML = `
        <div class="user-info-bar" style="display: flex; align-items: center; gap: 8px; flex-wrap: nowrap;">
          
          <!-- 👤/🖼️ FOTO & NAMA PROFIL (KLIK KEDUA-DUANYA UNTUK PINDAH KE PROFILE.HTML) -->
          <span class="user-name nav-desktop-only" 
                onclick="window.location.href='profile.html'" 
                title="Lihat Profil Saya" 
                style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: opacity 0.2s;"
                onmouseover="this.style.opacity='0.8'" 
                onmouseout="this.style.opacity='1'">
            ${htmlAvatar} <span>${nama}</span>
          </span>
          
          <span class="user-wallet nav-desktop-only" title="Klik untuk salin" onclick="navigator.clipboard.writeText('${wallet}').then(()=>window.tampilPesan('✅','Disalin!','Alamat wallet disalin.'))">💳 ${wallet}</span>
          
          <!-- 💰 SALDO + DIAMOND — DIGABUNG DALAM SATU KOTAK -->
          <span style="display: inline-flex; align-items: center; gap: 10px; background: rgba(15,23,42,0.6); padding: 6px 14px; border-radius: 24px; border: 1px solid #334155;">
            
            <!-- 💰 SALDO -->
            <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: bold; color: #fbbf24; white-space: nowrap;">
              💰 Rp ${formatAngka(saldo)}
            </span>
            
            <!-- PEMBATAS -->
            <span style="color: #475569; font-size: 12px;">|</span>
            
            <!-- 💎 DIAMOND + TOMBOL TOP UP -->
            <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: bold; color: #fff; white-space: nowrap; cursor: pointer;"
              onmousedown="tampilkanDiamondAsli(this, ${diamond})"
              onmouseup="sembunyikanDiamondAsli(this, ${diamond})"
              onmouseleave="sembunyikanDiamondAsli(this, ${diamond})"
              ontouchstart="tampilkanDiamondAsli(this, ${diamond})"
              ontouchend="sembunyikanDiamondAsli(this, ${diamond})">
              💎 <span class="diamond-text">${formatAngka(diamond)}</span>
              <a href="topup.html" onclick="event.stopPropagation();" title="Top Up" style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; background: #2563eb; color: #fff; border-radius: 50%; text-decoration: none; font-weight: bold; font-size: 14px; margin-left: 4px;">+</a>
            </span>
          </span>
          
          <button class="btn-logout" onclick="logoutUser()" style="padding: 6px 12px; font-size: 12px; white-space: nowrap;">Keluar</button>
        </div>
      `;
    }, (err) => {
      navSaldo.innerHTML = `
        <div class="user-info-bar" style="display: flex; align-items: center; gap: 8px;">
          <span class="user-name" onclick="window.location.href='profile.html'" style="cursor: pointer;">👤 ${user.email}</span>
          <button class="btn-logout" onclick="logoutUser()">Keluar</button>
        </div>
      `;
    });
  } else {
    if (memberRefListener) {
      memberRefListener.off();
      memberRefListener = null;
    }
    navSaldo.innerHTML = `<button class="btn-login-nav" onclick="openLoginModal()">🔑 Masuk</button>`;
  }
});
