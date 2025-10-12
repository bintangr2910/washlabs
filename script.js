// Mode Gelap/Terang
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
});


// Kalkulator Otomatis
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

form.addEventListener("input", () => {
  let total = 0;
  for (let key in prices) {
    const qty = parseInt(form[key].value) || 0;
    total += qty * prices[key];
  }
  totalPrice.textContent = "Rp" + total.toLocaleString("id-ID");
});

// Efek animasi scroll
const animEls = document.querySelectorAll("[data-animate]");
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
});
animEls.forEach(el => observer.observe(el));
