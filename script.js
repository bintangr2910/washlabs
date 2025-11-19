/* =======================================
    1. SUPABASE CONFIG & CLIENT
    (Koneksi Database)
======================================= */
const SUPABASE_URL = 'https://zfevxdhonsbxyybogjjd.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmZXZ4ZGhvbnNieHl5Ym9nampkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTU0OTEsImV4cCI6MjA3ODk5MTQ5MX0.p95pmHVjYWL7L-0tx59Wyll6OP9mIsKdbUz1WRJ5P1k'; 

// Inisialisasi Supabase
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = _supabase; 

/* =======================================
    FUNGSI GLOBAL (ADMIN)
    Memastikan fungsi loadOrders dan updateStatus dapat diakses 
    oleh onchange di HTML dan logika login/tambah pesanan admin.
======================================= */

// --- FUNGSI MUAT DATA PESANAN (ADMIN) ---
async function loadOrders() {
    const tbody = document.querySelector('#ordersTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Memuat Data...</td></tr>';
    
    // Penanganan error untuk Supabase fetch
    const { data, error } = await _supabase
        .from('orders')
        .select('*')
        .order('create_at', { ascending: false });

    if (error) {
        console.error("Error loading orders:", error.message);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color: #ef4444;">Gagal memuat data. Cek koneksi Supabase Anda.</td></tr>';
        return;
    }

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
window.loadOrders = loadOrders;

// --- FUNGSI UPDATE STATUS PESANAN (ADMIN) ---
window.updateStatus = async (id, val) => {
    const { error } = await _supabase.from('orders').update({ status: val }).eq('id', id);
    if(!error) {
        console.log(`Order ${id} updated to ${val}`);
        loadOrders(); // Refresh tabel setelah update
    } else {
        // Ganti alert() dengan console.error karena alert tidak ramah di iFrame
        console.error("Gagal update status:", error.message);
    }
};

/* =======================================
    2. LOGIKA UTAMA (Jalan saat web dimuat)
======================================= */
document.addEventListener('DOMContentLoaded', () => {

    // --- A. NAVIGASI, MENU MOBILE & RESET ADMIN ---
    const menuBtn = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");
    // ⚠️ PERINGATAN: Password admin ini disimpan di client-side dan mudah diakses.
    // Fitur ini hanya untuk keperluan testing Spin.
    const adminPassword = "washlabsadmin"; 
    let adminMenuShown = localStorage.getItem("washlabs_admin_logged") === "true";

    // Toggle Menu Mobile
    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
        // Event listener agar menu tertutup saat link diklik
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                setTimeout(() => navLinks.classList.remove('active'), 300); 
            });
        });
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

    // --- C. SPIN WHEEL ---
    const spinButton = document.getElementById("spinButton");
    const wheel = document.getElementById("wheel");
    const resultText = document.getElementById("resultText");
    const spinModal = document.getElementById("spinModal"); 
    const SPIN_KEY_SPIN = "spin_done_hash"; // Kunci LocalStorage

    const spinOpenBtn = document.getElementById("spinOpen"); 
    const closeSpinBtn = document.getElementById("closeSpin");
    const spinBackdrop = document.getElementById("spinBackdrop");

    // Event Buka/Tutup Modal
    if (spinOpenBtn && spinModal) {
        spinOpenBtn.addEventListener("click", () => spinModal.classList.add("active"));
    }
    closeSpinBtn?.addEventListener("click", () => spinModal.classList.remove("active"));
    spinBackdrop?.addEventListener("click", () => spinModal.classList.remove("active"));
    
    
    // Logika Spin Putaran 
    if (spinButton && wheel && resultText) {
        
        // Cek apakah user sudah pernah spin
        if (localStorage.getItem(SPIN_KEY_SPIN)) {
            spinButton.disabled = true;
            spinButton.textContent = "Sudah Spin";
        }

        // Logika Putaran
        spinButton.addEventListener("click", () => {
            if (localStorage.getItem(SPIN_KEY_SPIN)) return;
            
            const sectors = ["15%", "5%", "25%", "5%", "10%", "ZONK"];
            
            // Logika peluang untuk hasil Spin
                let randomIdx;
                // Pilih hanya dari 5%, 10%, dan ZONK
                const allowedResults = [1, 3, 4, 5]; // 1=5%, 3=5%, 4=10%, 5=ZONK
                randomIdx = allowedResults[Math.floor(Math.random() * allowedResults.length)];
            
            const degPerSegment = 360 / 6;
            // Tambahkan sedikit offset acak untuk visual yang lebih baik
            const randomOffset = Math.random() * (degPerSegment - 10); 
            const targetDeg = (360 * 5) + (randomIdx * degPerSegment) + randomOffset; 

            wheel.style.transition = "transform 4s cubic-bezier(0.17, 0.67, 0.83, 0.67)";
            wheel.style.transform = `rotate(-${targetDeg}deg)`;
            spinButton.disabled = true;

            setTimeout(() => {
                const hasil = sectors[randomIdx];
                resultText.innerHTML = hasil === "ZONK" ? "Yah.. ZONK 😅 Coba lagi besok!" : `Selamat! Diskon <b>${hasil}</b> 🎉`;
                localStorage.setItem(SPIN_KEY_SPIN, "done"); // Simpan status sudah spin
                spinButton.textContent = "Selesai";
                
                // Atur ulang rotasi transform agar putaran berikutnya dimulai dari posisi akhir yang bersih
                wheel.style.transition = "none";
                const finalRotation = targetDeg % 360; 
                wheel.style.transform = `rotate(-${finalRotation}deg)`; 
            }, 4000); // Tunggu animasi selesai (4 detik)
        });
    }

/* =======================================
   3. LOGIKA TRACKING (BY ID)
======================================= */
const trackBtn = document.getElementById("trackButton");

if (trackBtn) {
    trackBtn.addEventListener("click", async () => {
        const id = document.getElementById("orderIdInput").value.trim();
        const resultBox = document.getElementById("resultContainer");
        const errorMsg = document.getElementById("errorMessage");

        // Reset tampilan
        resultBox.style.display = "none";
        errorMsg.style.display = "none";

        // Validasi ID
        if (id.length !== 6 || isNaN(id)) {
            errorMsg.textContent = "ID harus berupa 6 digit angka.";
            errorMsg.style.display = "block";
            return;
        }

        // Loading state
        trackBtn.disabled = true;
        trackBtn.textContent = "Mencari...";

        try {
            // Query Supabase (TANPA create_at!)
            const { data, error } = await db
                .from("orders")
                .select("nama, barang, jumlah, status")
                .eq("id", id)
                .single();

            if (!data || error) {
                errorMsg.textContent = "Pesanan tidak ditemukan.";
                errorMsg.style.display = "block";
            } else {
                // Masukkan data ke HTML
                document.getElementById("trackNama").textContent = data.nama;
                document.getElementById("trackBarang").textContent = data.barang;
                document.getElementById("trackJumlah").textContent = data.jumlah;

                const statEl = document.getElementById("trackStatus");
                statEl.textContent = data.status;

                // Warna status
                if (data.status === "Selesai") statEl.style.color = "#10b981";
                else if (data.status === "Sedang Dicuci") statEl.style.color = "#facc15";
                else statEl.style.color = "#3b82f6";

                resultBox.style.display = "block";
            }
        } catch (err) {
            console.error("Tracking Error:", err);
            errorMsg.textContent = "Terjadi kesalahan koneksi.";
            errorMsg.style.display = "block";
        }

        // Kembalikan tombol
        trackBtn.disabled = false;
        trackBtn.textContent = "Lacak Pesanan";
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
            window.loadOrders(); // Panggil fungsi muat data global
        }

        // --- FUNGSI LOGIN ---
        loginBtn.addEventListener('click', async () => {
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            
            const { data, error } = await _supabase
                .from('admin')
                .select('*')
                .eq('username', u)
                .single();
            
            // ⚠️ PENTING: Untuk lingkungan produksi, pastikan password di tabel 'admin' 
            // di-hash (misalnya menggunakan fungsi Supabase/Auth), jangan disimpan
            // dalam bentuk plain text seperti yang diimplikasikan oleh validasi ini.
            
            if (error && error.code !== 'PGRST116') { // PGRST116 = tidak ada baris ditemukan
                 msg.textContent = "Terjadi kesalahan server saat login.";
                 msg.style.display = 'block';
                 console.error("Login Supabase Error:", error);
                 return;
            }

            // Validasi Password Sederhana (sesuai kode asli)
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
                
                // Logic untuk memastikan ID unik 6 digit
                let newId;
                let isUnique = false;
                
                // Cek unik ID di database (pencegahan tabrakan ID)
                while (!isUnique) {
                    newId = Math.floor(100000 + Math.random() * 900000); 
                    const { count } = await _supabase.from('orders').select('id', { count: 'exact', head: true }).eq('id', newId);
                    if (count === 0) {
                        isUnique = true;
                    }
                }

                const { error } = await _supabase.from('orders').insert([{
                    id: newId,
                    nama: f.get('nama'),
                    telepon: f.get('telepon'),
                    barang: f.get('barang'),
                    jumlah: f.get('jumlah'),
                    status: 'Antrian',
                    create_at: new Date().toISOString() // Tambahkan timestamp
                }]);

                const notif = document.getElementById('addMessage');
                if (!error) {
                    notif.textContent = `✅ Sukses! ID Pesanan: ${newId}`;
                    notif.style.display = 'block';
                    notif.style.color = '#10b981'; // Hijau
                    e.target.reset();
                    window.loadOrders(); // Refresh tabel
                } else {
                    notif.textContent = "❌ Gagal: " + error.message;
                    notif.style.display = 'block';
                    notif.style.color = 'red';
                    console.error("Tambah Pesanan Error:", error);
                }
            });
        }
    }
});