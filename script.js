let tasks = [
  { text: "Mengerjakan praktikum pemweb", matkul: "Pemrograman Web", deadline: "2026-10-10", completed: false },
  { text: "Mengerjakan projek blog", matkul: "Etika Profesi", deadline: "2026-10-12", completed: false },
  { text: "Mengerjakan praktikum jarkom", matkul: "Jaringan Komputer", deadline: "2026-10-08", completed: true }
];

let currentFilter = "semua";

const inputTugas = document.getElementById("input-tugas");
const selectMatkul = document.getElementById("select-matkul");
const inputDeadline = document.getElementById("input-deadline");
const tombolTambah = document.getElementById("tombol-tambah");
const daftarTugas = document.getElementById("daftar-tugas");
const tombolFilter = document.querySelectorAll(".tombol-filter");
const pesanError = document.getElementById("pesan-error");
const counterTugas = document.getElementById("counter-tugas");

// Fungsi untuk mengambil data tugas dari API
async function fetchTasks() {
  try {
    const response = await fetch('/api/tugas');
    
    if (!response.ok) {
      throw new Error('Gagal mengambil data dari server');
    }

    // Ubah respons menjadi format JSON
    const data = await response.json();
    
    // Masukkan data dari API ke dalam variabel tasks kita
    tasks = data;

    // Render ulang tampilan agar tugas-tugas dari server muncul di layar
    renderTasks();
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    pesanError.textContent = 'Gagal memuat tugas dari server.';
  }
}



function renderTasks() {
  daftarTugas.innerHTML = "";
  //task render
  // filter tugas
  let filteredTasks = tasks;
  if (currentFilter === "aktif") {
    filteredTasks = tasks.filter(task => task.completed === false);
  } else if (currentFilter === "selesai") {
    filteredTasks = tasks.filter(task => task.completed === true);
  }

  // tugas kosong di filter
  if (filteredTasks.length === 0) {
    const liKosong = document.createElement("li");
    liKosong.textContent = "Belum ada tugas.";
    daftarTugas.appendChild(liKosong);
    return;
  }

  // loop untuk menampilkan tugas
  filteredTasks.forEach(function(task) {
    const li = document.createElement("li");
    li.className = "kotak-tugas";
    if (task.completed) {
      li.classList.add("selesai");
    }

    // Bagian info (Judul & Detail)
    const infoDiv = document.createElement("div");
    infoDiv.className = "info-tugas";

    const spanTeks = document.createElement("span");
    spanTeks.className = "teks-tugas";
    spanTeks.textContent = task.text;

    const spanDetail = document.createElement("span");
    spanDetail.className = "teks-detail";
    spanDetail.textContent = task.matkul + " - " + task.deadline;

    infoDiv.appendChild(spanTeks);
    infoDiv.appendChild(spanDetail);

    // ubah status
    infoDiv.addEventListener("click", function() {
      if (task.completed === true) {
        task.completed = false;
      } else {
        task.completed = true;
      }
      renderTasks();
    });

    // hapus
    const tombolHapus = document.createElement("button");
    tombolHapus.type = "button";
    tombolHapus.className = "tombol-hapus";
    tombolHapus.textContent = "Hapus";

    tombolHapus.addEventListener("click", function() {
      const posisi = tasks.indexOf(task);
      tasks.splice(posisi, 1);
      renderTasks();
    });

    li.appendChild(infoDiv);
    li.appendChild(tombolHapus);
    daftarTugas.appendChild(li);
  });

  // hitung tugas aktif
  let jumlahAktif = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].completed === false) {
      jumlahAktif++;
    }
  }
  
  if (counterTugas) {
    counterTugas.textContent = jumlahAktif + " tugas aktif";
  }
}

// add new task
// Mengubah fungsi tambahTugas menjadi async untuk mendukung POST API
async function tambahTugas() {
  const teksInput = inputTugas.value.trim();
  const matkulInput = selectMatkul.value;
  const deadlineInput = inputDeadline.value;

  pesanError.textContent = "";

  // 1. Validasi Input (sudah ada sebelumnya)
  if (teksInput.length < 3) {
    pesanError.textContent = "Judul tugas minimal 3 karakter!";
    return;
  }
  if (matkulInput === "") {
    pesanError.textContent = "Pilih mata kuliah dulu!";
    return;
  }
  if (deadlineInput === "") {
    pesanError.textContent = "Tanggal deadline harus diisi!";
    return;
  }

  // 2. Siapkan data objek yang akan dikirim ke server
  const tugasBaru = {
    text: teksInput,
    matkul: matkulInput,
    deadline: deadlineInput,
    completed: false
  };

  try {
    // 3. Kirim data ke server menggunakan POST /api/tugas
    const response = await fetch('/api/tugas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Memberitahu server bahwa data berformat JSON
      },
      body: JSON.stringify(tugasBaru) // Mengubah objek JS menjadi string JSON
    });

    // Periksa jika server menolak / terjadi error
    if (!response.ok) {
      throw new Error('Gagal menyimpan tugas ke server');
    }

    // 4. Jika berhasil, ambil ulang data terbaru dari server agar UI sinkron
    await fetchTasks();

    // 5. Kosongkan form input dan pesan error
    inputTugas.value = "";
    selectMatkul.selectedIndex = 0;
    inputDeadline.value = "";
    pesanError.textContent = "";

  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    pesanError.textContent = 'Gagal menambahkan tugas. Coba lagi.';
  }
}

// pada tombol tambah
tombolTambah.addEventListener("click", function() {
  tambahTugas();
});

// pada input
inputTugas.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    tambahTugas();
  }
});

// filter
tombolFilter.forEach(function(tombol) {
  tombol.addEventListener("click", function() {
    currentFilter = tombol.getAttribute("data-filter");

    // hapus kelas aktif dari semua tombol filter
    tombolFilter.forEach(function(btn) {
      btn.classList.remove("aktif");
    });

    // tambah kelas aktif ke tombol yang diklik
    tombol.classList.add("aktif");

    renderTasks();
  });
});

// panggil fungsi lagi untuk menampilkan tugas saat pertama kali halaman dimuat
renderTasks();