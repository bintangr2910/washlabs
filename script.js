
/* =========================
   MENU MOBILE
========================= */
const menuBtn = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

/* =========================
   KALKULATOR OTOMATIS
========================= */
const prices = {
  shoes_canvas: 25000,
  shoes_suede_half: 35000,
  shoes_suede_full: 50000,
  shoes_unyellow: 50000,
  shoes_retouch: 70000,
  helm_clean: 30000,
  helm_half: 50000,
  helm_full: 60000,
  topi_clean: 15000,
  topi_retouch: 50000,
};

const form = document.getElementById("priceForm");
const totalPrice = document.getElementById("totalPrice");

if (form && totalPrice) {
  form.addEventListener("input", () => {
    let total = 0;
    for (let key in prices) {
      const qty = parseInt(form[key]?.value) || 0;
      total += qty * prices[key];
    }
    totalPrice.textContent = "Rp" + total.toLocaleString("id-ID");
  });
}

/* =========================
   SPIN DISKON
========================= */
// Elemen DOM
const openBtn = document.getElementById("spinOpen");
const modal = document.getElementById("spinModal");
const backdrop = document.getElementById("spinBackdrop");
const closeBtn = document.getElementById("closeSpin");
const wheel = document.getElementById("wheel");
const spinButton = document.getElementById("spinButton");
const resultText = document.getElementById("resultText");

// Data sektor
const sectors = ["5%", "10%", "15%", "20%", "25%", "30%"];
const sectorAngle = 360 / sectors.length;

// Cegah spin ulang
let isSpinning = false;
let hasSpun = localStorage.getItem("hasSpun");

// Buka modal
openBtn.addEventListener("click", () => {
  modal.classList.add("active");
});

// Tutup modal
const closeModal = () => modal.classList.remove("active");
closeBtn.addEventListener("click", closeModal);
backdrop.addEventListener("click", closeModal);

// Saat reload, kalau sudah spin sebelumnya
if (hasSpun) {
  const prevResult = localStorage.getItem("spinResult");
  resultText.textContent = `🎉 Kamu sudah dapat diskon ${prevResult}`;
  spinButton.disabled = true;
  spinButton.textContent = "Sudah digunakan";
}

// Fungsi spin
spinButton.addEventListener("click", () => {
  if (isSpinning || hasSpun) return;
  isSpinning = true;

  const randomIndex = Math.floor(Math.random() * sectors.length);
  const selected = sectors[randomIndex];

  // Sudut berhenti (pointer di bawah)
  const stopAngle = randomIndex * sectorAngle + sectorAngle / 2;
  const finalRotation = 360 * 5 + stopAngle;

  wheel.style.transform = `rotate(${finalRotation}deg)`;

  setTimeout(() => {
    resultText.textContent = `🎉 Selamat! Kamu dapat diskon ${selected}`;
    localStorage.setItem("hasSpun", "true");
    localStorage.setItem("spinResult", selected);
    spinButton.disabled = true;
    spinButton.textContent = "Sudah digunakan";
    isSpinning = false;
  }, 5200);
});





