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

// (Baris global 'await fetch' sudah dihapus dari sini agar script tidak crash)

// Fungsi helper untuk mengecek respons fetch
async function handleResponse(response) {
  if (response.status === 204) {
    return true; 
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Terjadi kesalahan pada server');
  }

  return data;
}

// Fungsi untuk mengambil data tugas dari API
async function fetchTasks() {
  try {
    const response = await fetch('http://localhost:3000/api/tugas');
    tasks = await handleResponse(response);
    renderTasks();
  } catch (error) {
    console.warn('Gagal memuat dari server, menggunakan data lokal:', error);
    // Jika backend belum aktif, tetap jalankan render dari data lokal
    renderTasks();
  }
}

function renderTasks() {
  daftarTugas.innerHTML = "";

  let filteredTasks = tasks;
  if (currentFilter === "aktif") {
    filteredTasks = tasks.filter(task => task.completed === false);
  } else if (currentFilter === "selesai") {
    filteredTasks = tasks.filter(task => task.completed === true);
  }

  if (filteredTasks.length === 0) {
    const liKosong = document.createElement("li");
    liKosong.textContent = "Belum ada tugas.";
    daftarTugas.appendChild(liKosong);
    return;
  }

  filteredTasks.forEach(function(task) {
    const li = document.createElement("li");
    li.className = "kotak-tugas";
    if (task.completed) {
      li.classList.add("selesai");
    }

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
      task.completed = !task.completed;
      renderTasks();
    });

    // Tombol Hapus
    const tombolHapus = document.createElement("button");
    tombolHapus.type = "button";
    tombolHapus.className = "tombol-hapus";
    tombolHapus.textContent = "Hapus";
    tombolHapus.dataset.id = task.id; // Untuk event delegation

    tombolHapus.addEventListener("click", function() {
      const posisi = tasks.indexOf(task);
      tasks.splice(posisi, 1);
      renderTasks();
    });

    li.appendChild(infoDiv);
    li.appendChild(tombolHapus);
    daftarTugas.appendChild(li);
  });

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

// Fungsi Tambah Tugas
async function tambahTugas() {
  const teksInput = inputTugas.value.trim();
  const matkulInput = selectMatkul.value;
  const deadlineInput = inputDeadline.value;

  pesanError.textContent = "";

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

  const tugasBaru = {
    text: teksInput,
    matkul: matkulInput,
    deadline: deadlineInput,
    completed: false
  };

  try {
    const response = await fetch('http://localhost:3000/api/tugas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tugasBaru)
    });

    if (!response.ok) {
      throw new Error('Gagal menyimpan tugas ke server');
    }

    await fetchTasks();

  } catch (error) {
    console.warn("Server tidak aktif, menyimpan secara lokal:", error);
    tasks.push(tugasBaru);
    renderTasks();
  }

  inputTugas.value = "";
  selectMatkul.selectedIndex = 0;
  inputDeadline.value = "";
  pesanError.textContent = "";
}

// Event Listener Tombol Tambah
tombolTambah.addEventListener("click", function() {
  tambahTugas();
});

// Event Listener Enter di Input
inputTugas.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    tambahTugas();
  }
});

// Event Delegation Hapus
daftarTugas.addEventListener("click", async function(event) {
  if (event.target.classList.contains("tombol-hapus")) {
    const idTugas = event.target.dataset.id;

    try {
      const response = await fetch(`http://localhost:3000/api/tugas/${idTugas}`, {
        method: 'DELETE'
      });

      if (response.status === 204 || response.ok) {
        tasks = tasks.filter(task => task.id != idTugas);
        renderTasks();
      }
    } catch (error) {
      console.error("Gagal menghapus tugas:", error);
    }
  }
});

// Filter
tombolFilter.forEach(function(tombol) {
  tombol.addEventListener("click", function() {
    currentFilter = tombol.getAttribute("data-filter");

    tombolFilter.forEach(function(btn) {
      btn.classList.remove("aktif");
    });

    tombol.classList.add("aktif");
    renderTasks();
  });
});

// Panggil fetch saat halaman dimuat
fetchTasks();