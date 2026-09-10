// ==========================================
// 💳 NEXHUB — TOPUP & CONVERT SCRIPT
// ==========================================

// Smartlink Adsterra Kamu
const ADSTERRA_SMARTLINK = "https://www.profitableratecpmnetwork.com/i3nzyxa8e0?key=7c65084cf20b5de0eee1c8fc16952329";

let selectedSaldo = 0;
let selectedDiamond = 0;
let currentMode = 'saldo';
let convertMode = 'diamondToSaldo'; // Default: Diamond -> Saldo

let userDiamondAvailable = 0;
let userSaldoAvailable = 0;

// HELPER FORMAT TITIK RIBUAN
function formatRibuan(angka) {
  if (!angka && angka !== 0) return '0';
  return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseAngka(str) {
  if (!str) return 0;
  return parseInt(str.toString().replace(/\./g, '')) || 0;
}

// Helper Modal Pesan
window.tampilPesan = function(icon, title, message, customBtn) {
  document.getElementById('pesanIkon').textContent = icon;
  document.getElementById('pesanJudul').textContent = title;
  document.getElementById('pesanTeks').innerText = message;
  const aksi = document.getElementById('pesanAksi');
  aksi.innerHTML = '';
  if (customBtn) {
    aksi.appendChild(customBtn);
  } else {
    aksi.innerHTML = `<button onclick="tutupPesanModal()" class="btn-primary-modal" style="background:#3b82f6; color:#fff;">Mengerti</button>`;
  }
  document.getElementById('pesanModal').style.display = 'flex';
};

window.tutupPesanModal = function() {
  document.getElementById('pesanModal').style.display = 'none';
};

// SWITCH TAB (SALDO ↔ DIAMOND ↔ TUKAR)
function switchTab(mode) {
  currentMode = mode;
  
  document.getElementById('tabSaldo').classList.toggle('active', mode === 'saldo');
  document.getElementById('tabSaldo').classList.toggle('inactive', mode !== 'saldo');
  
  document.getElementById('tabDiamond').classList.toggle('active', mode === 'diamond');
  document.getElementById('tabDiamond').classList.toggle('inactive', mode !== 'diamond');
  
  document.getElementById('tabConvert').classList.toggle('active', mode === 'convert');
  document.getElementById('tabConvert').classList.toggle('inactive', mode !== 'convert');
  
  document.getElementById('contentSaldo').classList.toggle('active', mode === 'saldo');
  document.getElementById('contentDiamond').classList.toggle('active', mode === 'diamond');
  document.getElementById('contentConvert').classList.toggle('active', mode === 'convert');
  
  if(mode === 'saldo') document.getElementById('pageTitle').textContent = '💰 Isi Saldo';
  if(mode === 'diamond') document.getElementById('pageTitle').textContent = '💎 Isi Diamond';
  if(mode === 'convert') document.getElementById('pageTitle').textContent = '🔄 Tukar Saldo & Diamond';
  
  selectedSaldo = 0;
  selectedDiamond = 0;
  document.querySelectorAll('.package-card').forEach(c => c.classList.remove('active'));
}

// TOGGLE MODE TUKAR DUA ARAH
function switchConvertDirection() {
  if (convertMode === 'diamondToSaldo') {
    convertMode = 'saldoToDiamond';
  } else {
    convertMode = 'diamondToSaldo';
  }
  document.getElementById('inputConvertValue').value = '';
  updateConvertUI();
}

function updateConvertUI() {
  const textDir = document.getElementById('convertDirectionText');
  const labelSumber = document.getElementById('labelSumberStok');
  const infoSumber = document.getElementById('infoUserSource');
  const labelInput = document.getElementById('labelInputKonversi');
  const labelRate = document.getElementById('labelRateTukar');
  const btnPay = document.getElementById('btnProsesKonversi');

  if (convertMode === 'diamondToSaldo') {
    textDir.textContent = '🔄 Mode: Diamond ➔ Saldo';
    labelSumber.textContent = 'Stok Diamond Kamu:';
    infoSumber.textContent = '💎 ' + formatRibuan(userDiamondAvailable);
    labelInput.textContent = '1. Masukkan Jumlah Diamond';
    labelRate.textContent = 'Nilai Tukar (💎 1 = Rp 1.000):';
    btnPay.textContent = 'Konversi Ke Saldo';
    btnPay.style.background = 'linear-gradient(90deg, #059669, #10b981)';
  } else {
    textDir.textContent = '🔄 Mode: Saldo ➔ Diamond';
    labelSumber.textContent = 'Saldo Utama Kamu:';
    infoSumber.textContent = 'Rp ' + formatRibuan(userSaldoAvailable);
    labelInput.textContent = '1. Masukkan Nominal Saldo (Rp)';
    labelRate.textContent = 'Nilai Tukar (Rp 1.000 = 💎 1):';
    btnPay.textContent = 'Konversi Ke Diamond';
    btnPay.style.background = 'linear-gradient(90deg, #2563eb, #3b82f6)';
  }

  hitungKonversi();
}

// PILIH NOMINAL SALDO
function selectSaldo(nominal, element) {
  selectedSaldo = nominal;
  document.querySelectorAll('#contentSaldo .package-card').forEach(c => c.classList.remove('active'));
  element.classList.add('active');
}

// PILIH PAKET DIAMOND
function selectDiamond(amount, element) {
  selectedDiamond = amount;
  document.querySelectorAll('#contentDiamond .package-card').forEach(c => c.classList.remove('active'));
  element.classList.add('active');
}

// SINKRONISASI REALTIME USER
auth.onAuthStateChanged((user) => {
  if (user) {
    db.ref('members/' + user.uid).on('value', (snapshot) => {
      const data = snapshot.val();
      const wallet = data?.alamatWallet || 'Belum ada';
      userDiamondAvailable = Number(data?.diamond) || 0;
      userSaldoAvailable = Number(data?.saldo) || 0;

      document.getElementById('walletSaldo').value = wallet;
      document.getElementById('walletDiamond').value = wallet;

      updateConvertUI();
    });
  }
});

// CALCULATOR TUKAR DUA ARAH (DENGAN AUTO TITIK)
function hitungKonversi() {
  const inputEl = document.getElementById('inputConvertValue');
  
  let rawVal = parseAngka(inputEl.value);

  if (rawVal > 0) {
    inputEl.value = formatRibuan(rawVal);
  } else {
    inputEl.value = '';
  }

  const out = document.getElementById('hasilTukarOutput');

  if (convertMode === 'diamondToSaldo') {
    const totalRp = rawVal * 1000;
    out.textContent = "Rp " + formatRibuan(totalRp);
  } else {
    const totalDiamond = Math.floor(rawVal / 1000);
    out.textContent = "💎 " + formatRibuan(totalDiamond);
  }
}

// PROSES KONVERSI DUA ARAH
async function prosesKonversiDuaArah() {
  const inputEl = document.getElementById('inputConvertValue');
  const inputVal = parseAngka(inputEl.value);
  const user = auth.currentUser;

  if (!user) return window.tampilPesan('⚠️', 'Gagal', 'Silakan login terlebih dahulu.');
  if (inputVal <= 0) return window.tampilPesan('⚠️', 'Input Salah', 'Masukkan jumlah yang valid.');

  try {
    const userRef = db.ref('members/' + user.uid);

    if (convertMode === 'diamondToSaldo') {
      if (inputVal > userDiamondAvailable) {
        return window.tampilPesan('❌', 'Diamond Kurang', `Diamond kamu tidak cukup! (Tersedia: 💎 ${formatRibuan(userDiamondAvailable)})`);
      }

      const totalRp = inputVal * 1000;
      await userRef.transaction((data) => {
        if (data) {
          if ((data.diamond || 0) >= inputVal) {
            data.diamond = (data.diamond || 0) - inputVal;
            data.saldo = (data.saldo || 0) + totalRp;
          }
        }
        return data;
      });

      inputEl.value = '';
      hitungKonversi();
      window.tampilPesan('🎉', 'Berhasil Ditukar!', `Berhasil menukarkan 💎 ${formatRibuan(inputVal)} menjadi Saldo Rp ${formatRibuan(totalRp)}!`);

    } else { // saldoToDiamond
      if (inputVal > userSaldoAvailable) {
        return window.tampilPesan('❌', 'Saldo Kurang', `Saldo kamu tidak cukup! (Tersedia: Rp ${formatRibuan(userSaldoAvailable)})`);
      }
      if (inputVal < 1000) {
        return window.tampilPesan('⚠️', 'Minimal Konversi', 'Minimal konversi ke Diamond adalah Rp 1.000.');
      }

      const totalDiamond = Math.floor(inputVal / 1000);
      const sisaSaldoDipotong = totalDiamond * 1000;

      await userRef.transaction((data) => {
        if (data) {
          if ((data.saldo || 0) >= sisaSaldoDipotong) {
            data.saldo = (data.saldo || 0) - sisaSaldoDipotong;
            data.diamond = (data.diamond || 0) + totalDiamond;
          }
        }
        return data;
      });

      inputEl.value = '';
      hitungKonversi();
      window.tampilPesan('🎉', 'Berhasil Ditukar!', `Berhasil menukarkan Saldo Rp ${formatRibuan(sisaSaldoDipotong)} menjadi 💎 ${formatRibuan(totalDiamond)}!`);
    }

  } catch (err) {
    window.tampilPesan('❌', 'Gagal', err.message);
  }
}

// ==========================================
// PROSES TOP UP SALDO (DENGAN BATASAN HARIAN / DAILY LIMIT)
// ==========================================
function prosesTopupSaldo() {
  const wallet = document.getElementById('walletSaldo').value.trim();
  const user = auth.currentUser;
  
  if (!wallet) return window.tampilPesan('⚠️', 'Wallet Kosong', 'Silakan login terlebih dahulu.');
  if (selectedSaldo === 0) return window.tampilPesan('⚠️', 'Pilih Nominal', 'Silakan pilih nominal saldo.');

  const btnBayar = document.createElement('button');
  btnBayar.className = 'btn-primary-modal';
  btnBayar.style.background = '#22c55e';
  btnBayar.style.color = '#ffffff';
  btnBayar.textContent = '📺 Tonton Iklan & Klaim Saldo';
  
  btnBayar.onclick = async () => {
    window.tutupPesanModal();
    
    try {
      if (!user) {
        window.tampilPesan('❌', 'Gagal', 'Terjadi kesalahan sistem (User tidak ditemukan).');
        return;
      }
      const ref = db.ref('members/' + user.uid);
      const snap = await ref.once('value');
      const dataUser = snap.val() || {};
      const saldoSekarang = Number(dataUser.saldo) || 0;

      // 1. CEK BATASAN HARIAN (DAILY LIMIT)
      const todayStr = new Date().toISOString().split('T')[0];
      const riwayatKlaimHarian = dataUser.riwayatKlaim && dataUser.riwayatKlaim[todayStr] ? dataUser.riwayatKlaim[todayStr] : { count: 0 };
      
      const MAKSIMAL_KLAIM_PER_HARI = 3; // Batas harian klaim iklan

      if (riwayatKlaimHarian.count >= MAKSIMAL_KLAIM_PER_HARI) {
        window.tampilPesan('⏳', 'Batas Harian Tercapai', `Kamu sudah mencapai batas maksimal klaim saldo via iklan (${MAKSIMAL_KLAIM_PER_HARI}x) hari ini.\n\nSilakan coba lagi besok ya!`);
        return;
      }

      // 2. Buka Smartlink Adsterra di tab baru
      window.open(ADSTERRA_SMARTLINK, '_blank');

      // 3. Update Saldo & Tambah Counter Klaim Hari Ini di Firebase
      const updateData = {};
      updateData['saldo'] = saldoSekarang + selectedSaldo;
      updateData[`riwayatKlaim/${todayStr}/count`] = riwayatKlaimHarian.count + 1;
      updateData[`riwayatKlaim/${todayStr}/terakhirKlaim`] = Date.now();

      await ref.update(updateData);

      window.tampilPesan(
        '✅', 
        'Berhasil Diklaim!', 
        `Saldo Rp ${formatRibuan(selectedSaldo)} berhasil ditambahkan!\n\nSisa kuota klaim hari ini: ${MAKSIMAL_KLAIM_PER_HARI - (riwayatKlaimHarian.count + 1)} kali lagi.`
      );

    } catch (err) {
      window.tampilPesan('❌', 'Gagal', err.message);
    }
  };

  window.tampilPesan('📱', 'Klaim Saldo via Iklan', `Anda akan mengeklaim saldo sebesar:\n💰 Rp ${formatRibuan(selectedSaldo)}`, btnBayar);
}

// ==========================================
// PROSES TOP UP DIAMOND (DENGAN BATASAN HARIAN & IKLAN ADSTERRA)
// ==========================================
function prosesTopupDiamond() {
  const wallet = document.getElementById('walletDiamond').value.trim();
  const user = auth.currentUser;
  
  if (!wallet) return window.tampilPesan('⚠️', 'Wallet Kosong', 'Silakan login terlebih dahulu.');
  if (selectedDiamond === 0) return window.tampilPesan('⚠️', 'Pilih Paket', 'Silakan pilih paket diamond.');

  const btnBayar = document.createElement('button');
  btnBayar.className = 'btn-primary-modal';
  btnBayar.style.background = '#22c55e';
  btnBayar.style.color = '#ffffff';
  btnBayar.textContent = '📺 Tonton Iklan & Klaim Diamond';
  
  btnBayar.onclick = async () => {
    window.tutupPesanModal();
    
    try {
      if (!user) {
        window.tampilPesan('❌', 'Gagal', 'Terjadi kesalahan sistem (User tidak ditemukan).');
        return;
      }
      const ref = db.ref('members/' + user.uid);
      const snap = await ref.once('value');
      const dataUser = snap.val() || {};
      const diamondSekarang = Number(dataUser.diamond) || 0;

      // 1. CEK BATASAN HARIAN (DAILY LIMIT KHUSUS DIAMOND)
      const todayStr = new Date().toISOString().split('T')[0];
      // Kita buat path riwayat khusus diamond agar tidak tabrakan dengan saldo
      const riwayatDiamondHarian = dataUser.riwayatKlaimDiamond && dataUser.riwayatKlaimDiamond[todayStr] ? dataUser.riwayatKlaimDiamond[todayStr] : { count: 0 };
      
      const MAKSIMAL_KLAIM_DIAMOND = 3; // Batas harian klaim diamond via iklan

      if (riwayatDiamondHarian.count >= MAKSIMAL_KLAIM_DIAMOND) {
        window.tampilPesan('⏳', 'Batas Harian Tercapai', `Kamu sudah mencapai batas maksimal klaim Diamond via iklan (${MAKSIMAL_KLAIM_DIAMOND}x) hari ini.\n\nSilakan coba lagi besok ya!`);
        return;
      }

      // 2. Buka Smartlink Adsterra di tab baru
      window.open(ADSTERRA_SMARTLINK, '_blank');

      // 3. Update Diamond & Tambah Counter Klaim Diamond Harian di Firebase
      const updateData = {};
      updateData['diamond'] = diamondSekarang + selectedDiamond;
      updateData[`riwayatKlaimDiamond/${todayStr}/count`] = riwayatDiamondHarian.count + 1;
      updateData[`riwayatKlaimDiamond/${todayStr}/terakhirKlaim`] = Date.now();

      await ref.update(updateData);

      window.tampilPesan(
        '✅', 
        'Berhasil Diklaim!', 
        `${formatRibuan(selectedDiamond)} Diamond berhasil ditambahkan!\n\nSisa kuota klaim Diamond hari ini: ${MAKSIMAL_KLAIM_DIAMOND - (riwayatDiamondHarian.count + 1)} kali lagi.`
      );

    } catch (err) {
      window.tampilPesan('❌', 'Gagal', err.message);
    }
  };

  window.tampilPesan('📱', 'Klaim Diamond via Iklan', `Anda akan mengeklaim paket:\n💎 ${formatRibuan(selectedDiamond)}`, btnBayar);
}

