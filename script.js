/* =========================
   MENU MOBILE & ADMIN RESET
========================= */
const menuBtn = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const adminPassword = "washlabsadmin";
let adminMenuShown = localStorage.getItem("washlabs_admin_logged") === "true";

// Tambahkan tombol reset admin
const navItems = Array.from(navLinks.querySelectorAll("li"));
let kontakLi = navItems.find(li => li.textContent.trim().toLowerCase() === "kontak");
let resetBtn;

if (kontakLi) {
  const resetBtnLi = document.createElement("li");
  resetBtn = document.createElement("button");
  resetBtn.textContent = "Reset Spin (Admin)";
  resetBtn.classList.add("admin-reset-btn");
  resetBtnLi.appendChild(resetBtn);
  kontakLi.insertAdjacentElement("afterend", resetBtnLi);
  resetBtn.style.display = adminMenuShown ? "block" : "none";

  // Event reset
  resetBtn.addEventListener("click", async () => {
    const input = prompt("Masukkan password admin:");
    if (input === adminPassword) {
      localStorage.setItem("washlabsadmin_logged", "true");
      resetBtn.style.display = "block";

      try {
        const response = await fetch("/api/reset-spin", { method: "POST" });
        if (response.ok) {
          alert("✅ Semua status spin user telah di-reset.");

          // Reset spin di admin browser juga
          localStorage.removeItem("washlabs_spin_done");
          if (spinButton) {
            spinButton.disabled = false;
            spinButton.textContent = "PUTAR";
          }
        } else {
          alert("❌ Gagal mereset. Coba lagi.");
        }
      } catch (err) {
        console.error(err);
        alert("❌ Terjadi error saat mereset spin.");
      }
    } else if (input) {
      alert("❌ Password salah!");
    }
  });
}

// Toggle menu
if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");

    if (!adminMenuShown && resetBtn) {
      const input = prompt("Masukkan password admin untuk akses menu reset:");
      if (input === adminPassword) {
        localStorage.setItem("washlabs_admin_logged", "true");
        adminMenuShown = true;
        resetBtn.style.display = "block";
      } else if (input) {
        alert("❌ Password salah! Menu admin tidak ditampilkan.");
      }
    }
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
const openBtn = document.getElementById("spinOpen");
const modal = document.getElementById("spinModal");
const backdrop = document.getElementById("spinBackdrop");
const closeBtn = document.getElementById("closeSpin");
const wheel = document.getElementById("wheel");
const spinButton = document.getElementById("spinButton");
const resultText = document.getElementById("resultText");

const sectors = ["15%", "5%", "25%", "5%", "10%", "ZONK"];
const sectorWeights = [1, 6, 0.3, 8, 1, 8];
const sectorAngle = 360 / sectors.length;
const SPIN_KEY = "washlabs_spin_done";

let isSpinning = false;

// Modal control
openBtn.addEventListener("click", () => {
  modal.classList.add("active");
  resultText.textContent = "";
  if (!localStorage.getItem(SPIN_KEY)) {
    spinButton.disabled = false;
    spinButton.textContent = "PUTAR";
  }
});

closeBtn.addEventListener("click", () => modal.classList.remove("active"));
backdrop.addEventListener("click", () => modal.classList.remove("active"));

// Weighted random function
function weightedRandom(weights) {
  let total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) return i;
    random -= weights[i];
  }
  return weights.length - 1;
}

// Spin logic
if (localStorage.getItem(SPIN_KEY)) {
  spinButton.disabled = true;
  spinButton.textContent = "Sudah Spin";
}

spinButton.addEventListener("click", () => {
  if (isSpinning || localStorage.getItem(SPIN_KEY)) return;
  isSpinning = true;

  const randomIndex = weightedRandom(sectorWeights);
  const selected = sectors[randomIndex];
  const finalRotation = 360 * 8 - (randomIndex * sectorAngle + sectorAngle / 2);

  wheel.style.transition = "transform 2.3s cubic-bezier(0.15,0.85,0.3,1)";
  wheel.style.transform = `rotate(${finalRotation}deg)`;

  setTimeout(() => {
    resultText.innerHTML = selected === "ZONK"
      ? `😅 Yah... kamu <b>ZONK</b> kali ini.`
      : `🎉 Selamat! Kamu dapat diskon <b>${selected}</b>!`;

    spinButton.disabled = true;
    spinButton.textContent = "Sudah Spin";
    localStorage.setItem(SPIN_KEY, "true");
    isSpinning = false;
  }, 2400);
});
