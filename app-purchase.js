// ==========================================
// 🛍️ NEXHUB — PROSES PEMBELIAN APLIKASI (PERBAIKAN KONVERSI DIAMOND)
// ==========================================

const ADSTERRA_SMARTLINK_APP = "https://www.profitableratecpmnetwork.com/i3nzyxa8e0?key=7c65084cf20b5de0eee1c8fc16952329";

// Fungsi pembantu: Format angka ke ribuan (10000 -> 10.000)
function formatAngka(angka) {
  return Number(angka || 0).toLocaleString('id-ID');
}

// Fungsi pembantu: Ubah teks "1,52M" atau "50K" jadi Angka Asli (1520000)
function parseFormattedNumber(text) {
  if (typeof text === 'number') return text;
  if (!text) return 0;

  let str = text.toString().trim().toUpperCase().replace(/\./g, '').replace(',', '.');
  
  if (str.endsWith('M')) {
    return parseFloat(str.replace('M', '')) * 1000000;
  } else if (str.endsWith('K')) {
    return parseFloat(str.replace('K', '')) * 1000;
  }
  return parseFloat(str) || 0;
}

function prosesBeliAplikasi(namaApp, hargaDiamond, urlDownload) {
  const user = typeof auth !== 'undefined' ? auth.currentUser : null;

  // 1. Cek Login
  if (!user) {
    if (typeof window.tampilPesan === 'function') {
      return window.tampilPesan('⚠️', 'Akses Ditolak', 'Silakan login terlebih dahulu untuk mengakses aplikasi.');
    } else {
      return alert('⚠️ Silakan login terlebih dahulu!');
    }
  }

  // 2. Ambil Saldo Diamond (Cek dari JS / langsung dari teks Header UI jika JS kosong)
  let rawDiamond = 0;
  if (typeof window.userDiamondAvailable !== 'undefined') {
    rawDiamond = window.userDiamondAvailable;
  } else if (typeof userDiamondAvailable !== 'undefined') {
    rawDiamond = userDiamondAvailable;
  } else {
    // Ambil langsung dari elemen teks UI Header jika variabel JS tidak terdeteksi
    const elHeaderDiamond = document.querySelector('.user-diamond, #userDiamond, [data-diamond]');
    if (elHeaderDiamond) {
      rawDiamond = elHeaderDiamond.textContent || elHeaderDiamond.innerText;
    }
  }

  // Konversi saldo ke angka murni
  const saldoDiamond = parseFormattedNumber(rawDiamond);

  // 3. Cek Saldo vs Harga
  if (saldoDiamond < hargaDiamond) {
    const pesan = `Harga aplikasi: 💎 ${formatAngka(hargaDiamond)}\nDiamond kamu: 💎 ${formatAngka(saldoDiamond)}\n\nSilakan kumpulkan Diamond lebih banyak!`;
    if (typeof window.tampilPesan === 'function') {
      return window.tampilPesan('❌', 'Diamond Tidak Cukup', pesan);
    } else {
      return alert('❌ Diamond Tidak Cukup!\n\n' + pesan);
    }
  }

  // 4. Modal Konfirmasi Nonton Iklan Adsterra
  const btnIklanBayar = document.createElement('button');
  btnIklanBayar.className = 'btn-primary-modal';
  btnIklanBayar.style.background = '#2563eb';
  btnIklanBayar.style.color = '#ffffff';
  btnIklanBayar.style.padding = '10px 15px';
  btnIklanBayar.style.border = 'none';
  btnIklanBayar.style.borderRadius = '8px';
  btnIklanBayar.style.marginTop = '10px';
  btnIklanBayar.style.cursor = 'pointer';
  btnIklanBayar.textContent = '📺 Tonton Iklan & Lanjutkan Tagihan';

  btnIklanBayar.onclick = () => {
    if (typeof window.tutupPesanModal === 'function') window.tutupPesanModal();

    // Buka Smartlink Adsterra di tab baru
    window.open(ADSTERRA_SMARTLINK_APP, '_blank');

    // Tampilkan Modal Tagihan Pembayaran
    setTimeout(() => {
      tampilModalTagihanAplikasi(namaApp, hargaDiamond, urlDownload);
    }, 500);
  };

  if (typeof window.tampilPesan === 'function') {
    window.tampilPesan(
      '🏷️', 
      'Konfirmasi Akses Aplikasi', 
      `Kamu akan membuka:\n📱 ${namaApp}\n\nHarga: 💎 ${formatAngka(hargaDiamond)}`, 
      btnIklanBayar
    );
  }
}

function tampilModalTagihanAplikasi(namaApp, hargaDiamond, urlDownload) {
  const btnBayarTagihan = document.createElement('button');
  btnBayarTagihan.className = 'btn-primary-modal';
  btnBayarTagihan.style.background = '#22c55e';
  btnBayarTagihan.style.color = '#ffffff';
  btnBayarTagihan.style.padding = '10px 15px';
  btnBayarTagihan.style.border = 'none';
  btnBayarTagihan.style.borderRadius = '8px';
  btnBayarTagihan.style.marginTop = '10px';
  btnBayarTagihan.style.cursor = 'pointer';
  btnBayarTagihan.textContent = `💳 Potong 💎 ${formatAngka(hargaDiamond)} & Download`;

  btnBayarTagihan.onclick = async () => {
    if (typeof window.tutupPesanModal === 'function') window.tutupPesanModal();

    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = db.ref('members/' + user.uid);
      
      const result = await userRef.transaction((data) => {
        if (data) {
          const currentDiamond = Number(data.diamond) || 0;
          if (currentDiamond >= hargaDiamond) {
            data.diamond = currentDiamond - hargaDiamond;
          } else {
            return;
          }
        }
        return data;
      });

      if (result.committed) {
        if (typeof window.tampilPesan === 'function') {
          window.tampilPesan(
            '🎉', 
            'Pembayaran Berhasil!', 
            `Tagihan 💎 ${formatAngka(hargaDiamond)} berhasil dipotong.\n\nFile aplikasi akan langsung terunduh/terbuka!`
          );
        }
        
        setTimeout(() => {
          window.open(urlDownload, '_blank');
        }, 1200);

      } else {
        window.tampilPesan('❌', 'Gagal', 'Transaksi dibatalkan. Diamond kamu tidak mencukupi.');
      }

    } catch (err) {
      window.tampilPesan('❌', 'Error Transaksi', err.message);
    }
  };

  if (typeof window.tampilPesan === 'function') {
    window.tampilPesan(
      '🧾', 
      'Tagihan Pembayaran', 
      `Terima kasih sudah menonton iklan!\n\nKlik tombol di bawah untuk membayar 💎 ${formatAngka(hargaDiamond)} dan mengunduh ${namaApp}:`, 
      btnBayarTagihan
    );
  }
}
