/* =======================================
   1. SUPABASE CONFIG & CLIENT
   (Koneksi Database)
======================================= */
const SUPABASE_URL = 'https://zfevxdhonsbxyybogjjd.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmZXZ4ZGhvbnNieHl5Ym9nampkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTU0OTEsImV4cCI6MjA3ODk5MTQ5MX0.p95pmHVjYWL7L-0tx59Wyll6OP9mIsKdbUz1WRJ5P1k'; 

// Inisialisasi Supabase
// Pastikan <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> ada di HTML
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = _supabase; 

/* =======================================
   2. LOGIKA UTAMA (Jalan saat web dimuat)
======================================= */
document.addEventListener('DOMContentLoaded', () => {

    // --- A. NAVIGASI, MENU MOBILE & RESET ADMIN ---
    const menuBtn = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");
    const adminPassword = "washlabsadmin"; // Password Reset Spin
    let adminMenuShown = localStorage.getItem("washlabs_admin_logged") === "true";

    // Toggle Menu Mobile
    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }

    // Tombol Reset Spin (Fitur Tersembunyi Admin)
    // Mencari link "Kontak" untuk menyelipkan tombol reset di sebelahnya
    const navItems = Array.from(document.querySelectorAll(".nav-links li"));
    const kontakLi = navItems.find(li => li.textContent.includes("Kontak") || li.querySelector('a')?.getAttribute('href') === "#contact");

    if (kontakLi) {
        const resetLi = document.createElement("li");
        resetLi.innerHTML = `<a href="javascript:void(0)" class="admin-reset-btn" style="color:#ef4444; font-weight:bold;">Reset Spin 🔄</a>`;
        
        // Tampilkan tombol jika admin sudah pernah login
        resetLi.style.display = adminMenuShown ? "block" : "none";
        
        resetLi.addEventListener("click", () => {
            const input = prompt("Masukkan password admin untuk Reset Spin:");
            if (input === adminPassword) {
                localStorage.setItem("washlabs_admin_logged", "true");
                resetLi.style.display = "block"; // Pastikan tetap muncul
                localStorage.removeItem("spin_done_hash"); // Hapus history spin
                alert("✅ Sukses! User sekarang bisa melakukan Spin lagi.");
            } else if (input) {
                alert("❌ Password salah!");
            }
        });
        
        // Masukkan tombol ke menu
        kontakLi.insertAdjacentElement('afterend', resetLi);
    }

    // --- B. KALKULATOR HARGA (Halaman Utama) ---
    const priceForm = document.getElementById("priceForm");
    const totalPrice = document.getElementById("totalPrice");

    if (priceForm && totalPrice) {
        const prices = {
            shoes_canvas: 25000, shoes_suede_half: 35000, shoes_suede_full: 50000,
            shoes_unyellow: 50000, shoes_retouch: 70000, helm_clean: 30000,
            helm_half: 50000, helm_full: 60000, topi_clean: 15000, topi_retouch: 50000,
        };

        priceForm.addEventListener("input", () => {
            let total = 0;
            const inputs = priceForm.querySelectorAll("input");
            inputs.forEach(input => {
                const price = prices[input.name] || 0;
                total += price * (parseInt(input.value) || 0);
            });
            totalPrice.textContent = "Rp" + total.toLocaleString("id-ID");
        });
    }

    // --- C. SPIN WHEEL (Halaman Utama) ---
    const spinButton = document.getElementById("spinButton");
    if (spinButton) {
        const wheel = document.getElementById("wheel");
        const resultText = document.getElementById("resultText");
        const spinModal = document.getElementById("spinModal");
        const SPIN_KEY = "spin_done_hash";
        
        // Cek apakah user sudah pernah spin
        if (localStorage.getItem(SPIN_KEY)) {
            spinButton.disabled = true;
            spinButton.textContent = "Sudah Spin";
        }

        // Event Buka/Tutup Modal
        document.getElementById("spinOpen")?.addEventListener("click", () => spinModal.classList.add("active"));
        document.getElementById("closeSpin")?.addEventListener("click", () => spinModal.classList.remove("active"));
        document.getElementById("spinBackdrop")?.addEventListener("click", () => spinModal.classList.remove("active"));

        // Logika Putaran
        spinButton.addEventListener("click", () => {
            if (localStorage.getItem(SPIN_KEY)) return;
            
            const sectors = ["15%", "5%", "25%", "5%", "10%", "ZONK"];
            // Manipulasi peluang: 70% kemungkinan jatuh di ZONK atau diskon kecil
            const randomIdx = Math.random() < 0.7 ? 5 : Math.floor(Math.random() * 5); 
            
            const degPerSegment = 360 / 6;
            // Hitung sudut: 5 putaran penuh + sudut segmen target
            const targetDeg = (360 * 5) + (randomIdx * degPerSegment); 

            wheel.style.transition = "transform 4s cubic-bezier(0.17, 0.67, 0.83, 0.67)";
            wheel.style.transform = `rotate(-${targetDeg}deg)`;
            spinButton.disabled = true;

            setTimeout(() => {
                const hasil = sectors[randomIdx];
                resultText.innerHTML = hasil === "ZONK" ? "Yah.. ZONK 😅 Coba lagi besok!" : `Selamat! Diskon ${hasil} 🎉`;
                localStorage.setItem(SPIN_KEY, "done"); // Simpan status sudah spin
                spinButton.textContent = "Selesai";
            }, 4000); // Tunggu animasi selesai (4 detik)
        });
    }

    /* =======================================
       3. LOGIKA TRACKING (Khusus Halaman Tracking)
    ======================================= */
    const trackBtn = document.getElementById('trackButton');
    if (trackBtn) {
        trackBtn.addEventListener('click', async () => {
            const id = document.getElementById('orderIdInput').value.trim();
            const resultBox = document.getElementById('resultContainer');
            const errorMsg = document.getElementById('errorMessage');

            // Reset tampilan
            resultBox.style.display = 'none';
            errorMsg.style.display = 'none';

            // Validasi input
            if (id.length !== 6 || isNaN(id)) {
                errorMsg.textContent = "ID harus berupa 6 digit angka.";
                errorMsg.style.display = 'block';
                return;
            }

            try {
                // Ambil data dari Supabase
                const { data, error } = await _supabase
                    .from('orders')
                    .select('nama, barang, jumlah, status, create_at')
                    .eq('id', id)
                    .single();

                if (error || !data) {
                    errorMsg.textContent = "Pesanan tidak ditemukan.";
                    errorMsg.style.display = 'block';
                } else {
                    // Isi data ke HTML
                    document.getElementById('trackNama').textContent = data.nama;
                    document.getElementById('trackBarang').textContent = data.barang;
                    document.getElementById('trackJumlah').textContent = data.jumlah;
                    document.getElementById('trackDate').textContent = new Date(data.create_at).toLocaleDateString('id-ID');
                    
                    const statEl = document.getElementById('trackStatus');
                    statEl.textContent = data.status;
                    
                    // Warna Status
                    if(data.status === 'Selesai') statEl.style.color = '#10b981';
                    else if(data.status === 'Sedang Dicuci') statEl.style.color = '#facc15';
                    else statEl.style.color = '#3b82f6';

                    resultBox.style.display = 'block';
                }
            } catch (err) {
                errorMsg.textContent = "Terjadi kesalahan koneksi.";
                errorMsg.style.display = 'block';
            }
        });
    }

    /* =======================================
       4. LOGIKA ADMIN (Khusus Halaman Admin)
    ======================================= */
    const loginForm = document.getElementById('login-form');
    
    // Cek apakah kita sedang di halaman admin
    if (loginForm) { 
        const dashboard = document.getElementById('admin-dashboard');
        const loginBtn = document.getElementById('loginButton');
        const msg = document.getElementById('loginMessage');
        const logoutBtn = document.getElementById('logoutButton');

        // Cek Session Login
        if (localStorage.getItem('isAdminLoggedIn') === 'true') {
            loginForm.style.display = 'none';
            dashboard.style.display = 'block';
            logoutBtn.style.display = 'block';
            loadOrders(); // Panggil fungsi muat data
        }

        // --- FUNGSI LOGIN ---
        loginBtn.addEventListener('click', async () => {
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            
            // Ambil user dari tabel 'admin'
            const { data } = await _supabase
                .from('admin')
                .select('*')
                .eq('username', u)
                .single();

            // Validasi Password Sederhana
            if (data && data.password === p) {
                localStorage.setItem('isAdminLoggedIn', 'true');
                location.reload(); // Refresh halaman
            } else {
                msg.textContent = "Username atau Password Salah!";
                msg.style.display = 'block';
            }
        });

        // --- FUNGSI LOGOUT ---
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isAdminLoggedIn');
            location.reload();
        });

        // --- FUNGSI TAMBAH PESANAN ---
        const addForm = document.getElementById('addOrderForm');
        if (addForm) {
            addForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const f = new FormData(e.target);
                const newId = Math.floor(100000 + Math.random() * 900000); // Generate ID 6 Digit

                const { error } = await _supabase.from('orders').insert([{
                    id: newId,
                    nama: f.get('nama'),
                    telepon: f.get('telepon'),
                    barang: f.get('barang'),
                    jumlah: f.get('jumlah'),
                    status: 'Antrian'
                }]);

                const notif = document.getElementById('addMessage');
                if (!error) {
                    notif.textContent = `✅ Sukses! ID Pesanan: ${newId}`;
                    notif.style.display = 'block';
                    notif.style.color = '#10b981';
                    e.target.reset();
                    loadOrders(); // Refresh tabel
                } else {
                    notif.textContent = "Gagal: " + error.message;
                    notif.style.display = 'block';
                    notif.style.color = 'red';
                }
            });
        }
    }

    // --- FUNGSI MUAT DATA PESANAN (ADMIN) ---
    async function loadOrders() {
        const tbody = document.querySelector('#ordersTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Memuat Data...</td></tr>';
        
        const { data } = await _supabase
            .from('orders')
            .select('*')
            .order('create_at', { ascending: false });

        if (data && data.length > 0) {
            tbody.innerHTML = data.map(o => `
                <tr>
                    <td data-label="ID"><b>${o.id}</b></td>
                    <td data-label="Nama">${o.nama}</td>
                    <td data-label="HP">${o.telepon}</td>
                    <td data-label="Barang">${o.barang} (${o.jumlah})</td>
                    <td data-label="Status" style="color:${o.status === 'Selesai' ? '#10b981' : o.status === 'Sedang Dicuci' ? '#facc15' : '#3b82f6'}">
                        ${o.status}
                    </td>
                    <td data-label="Aksi">
                        <select onchange="updateStatus(${o.id}, this.value)" style="background:#222; color:#fff; padding:5px; border-radius:4px;">
                            <option value="Antrian" ${o.status === 'Antrian' ? 'selected' : ''}>Antrian</option>
                            <option value="Sedang Dicuci" ${o.status === 'Sedang Dicuci' ? 'selected' : ''}>Dicuci</option>
                            <option value="Selesai" ${o.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
                        </select>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Belum ada pesanan.</td></tr>';
        }
    }

    // Ekspos fungsi updateStatus ke window agar bisa dipanggil oleh onchange di HTML
    window.updateStatus = async (id, val) => {
        const { error } = await _supabase.from('orders').update({ status: val }).eq('id', id);
        if(!error) {
            // Opsional: beri notifikasi kecil atau refresh tabel
            // loadOrders(); // Refresh otomatis jika diinginkan
            console.log(`Order ${id} updated to ${val}`);
            // Ganti warna text status secara langsung biar cepat (opsional)
            loadOrders(); 
        } else {
            alert("Gagal update status");
        }
    };

});