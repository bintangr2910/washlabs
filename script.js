document.addEventListener("DOMContentLoaded", () => {


  /* =========================
     MENU MOBILE
  ========================== */
  const menuBtn = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  /* =========================
     KALKULATOR OTOMATIS
  ========================== */
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
     ANIMASI SCROLL MASUK
  ========================== */
  const animEls = document.querySelectorAll("[data-animate]");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("show");
    });
  });
  animEls.forEach((el) => observer.observe(el));

  /* =========================
     SPIN DISKON
  ========================== */
  const prizes = [
    { label: "50%", code: "WASH50" },
    { label: "25%", code: "WASH25" },
    { label: "NT", code: null },
    { label: "5%", code: "WASH5" },
    { label: "10%", code: "WASH10" },
    { label: "NT", code: null },
    { label: "15%", code: "WASH15" },
    { label: "10%", code: "WASH10" },
  ];

  const openBtn = document.getElementById("spinOpen");
  const modal = document.getElementById("spinModal");
  const backdrop = document.getElementById("spinBackdrop");
  const closeBtn = document.getElementById("closeSpin");
  const spinBtn = document.getElementById("spinButton");
  const wheel = document.getElementById("wheel");
  const resultEl = document.getElementById("resultText");
  const STORAGE_KEY = "washlabs_spin_used";

  if (!openBtn || !wheel || !spinBtn) return;

  /* ===== Bangun Roda Hadiah ===== */
  const buildWheel = () => {
    wheel.innerHTML = "";
    const segmentAngle = 360 / prizes.length;

    prizes.forEach((p, i) => {
      const seg = document.createElement("div");
      seg.className = "segment";
      seg.style.transform = `rotate(${i * segmentAngle}deg)`;
      seg.style.background = i % 2 === 0
        ? "linear-gradient(180deg, #00c3ff, #0074ff)"
        : "linear-gradient(180deg, #009fff, #0048ff)";

      const label = document.createElement("div");
      label.innerText = p.label;
      seg.appendChild(label);
      wheel.appendChild(seg);
    });
  };

  buildWheel();

  /* ===== Kontrol Modal ===== */
  const openModal = () => {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    resultEl.textContent = "";
  };
  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  };

  openBtn.addEventListener("click", openModal);
  backdrop.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeModal());

  /* ===== Logika Spin ===== */
  let spinning = false;

  spinBtn.addEventListener("click", () => {
    if (spinning) return;

    if (localStorage.getItem(STORAGE_KEY)) {
      resultEl.textContent = "⚠️ Maaf, Anda sudah menggunakan spin ini.";
      return;
    }

    spinning = true;
    resultEl.textContent = "🎡 Sedang memutar...";

    const segmentAngle = 360 / prizes.length;
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const spins = 6;
    const targetDeg = 360 * spins + (360 - (randomIndex * segmentAngle) - segmentAngle / 2);

    wheel.style.transition = "transform 5s cubic-bezier(.1,.9,.1,1)";
    wheel.style.transform = `rotate(${targetDeg}deg)`;

    wheel.addEventListener(
      "transitionend",
      function handler() {
        wheel.style.transition = "";
        const finalDeg = targetDeg % 360;
        wheel.style.transform = `rotate(${finalDeg}deg)`;

        const prize = prizes[randomIndex];
        if (prize.code) {
          resultEl.innerHTML = `🎉 Selamat! <strong>${prize.label}</strong><br>Kode: <code>${prize.code}</code>`;
        } else {
          resultEl.innerHTML = `😅 ${prize.label}. Terima kasih sudah mencoba!`;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify({ usedAt: Date.now(), prize }));
        spinning = false;
        wheel.removeEventListener("transitionend", handler);
      },
      { once: true }
    );
  });
});
