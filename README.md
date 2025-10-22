🧩 QC Tracking — Web Form Tanpa Library
📋 Deskripsi

Aplikasi sederhana untuk mencatat status QC (Quality Control) perangkat seperti sound box pocket atau sound box premium.
Pengguna dapat:

Menambahkan perangkat baru (berdasarkan deviceId dan deviceName)

Melakukan checklist QC untuk menandai perangkat sebagai QC OK

Dicegah melakukan QC pada perangkat yang:

❌ Belum terdaftar

⚠️ Sudah pernah di-QC sebelumnya

Semua dilakukan tanpa library eksternal, hanya memakai JavaScript murni (Vanilla JS).

🚀 Fitur Utama
Fitur	Deskripsi
➕ Tambah Device	Menyimpan perangkat baru berdasarkan deviceId dan deviceName
🧾 QC Checklist	Menandai perangkat sebagai “QC OK”
🚫 Validasi	Tidak bisa QC perangkat yang belum terdaftar atau sudah pernah QC
🪶 Log Aktivitas	Menampilkan semua hasil aksi di kotak log sederhana
🧱 Struktur Data
Variabel	Tipe	Fungsi
devices	Array	Menyimpan daftar perangkat terdaftar ({deviceId, deviceName})
qcList	Array	Menyimpan daftar deviceId yang sudah QC
⚙️ Fungsi Utama
addDevice(deviceId, deviceName)

Menambahkan perangkat baru ke daftar devices.
Cegah duplikasi deviceId.

function addDevice(deviceId, deviceName) {
  const exists = devices.some(d => d.deviceId === deviceId);
  if (exists) return `❌ Device ${deviceId} sudah terdaftar!`;

  devices.push({ deviceId, deviceName });
  return `✅ Device ${deviceId} (${deviceName}) berhasil ditambahkan.`;
}

qcDevice(deviceId)

Melakukan proses QC pada perangkat yang sudah terdaftar.

function qcDevice(deviceId) {
  const found = devices.find(d => d.deviceId === deviceId);
  if (!found) return `❌ Device ${deviceId} belum terdaftar!`;

  const alreadyQC = qcList.includes(deviceId);
  if (alreadyQC) return `⚠️ Device ${deviceId} sudah QC sebelumnya!`;

  qcList.push(deviceId);
  return `✅ Device ${deviceId} dinyatakan QC OK.`;
}

🧰 Cara Menjalankan

Simpan file berikut sebagai index.html

Buka file di browser (Chrome, Edge, Firefox, dsb)

Isi form “Input Device Info” lalu klik Add Device

Lalu isi form “QC Checklist” untuk melakukan QC

Hasilnya muncul di bagian Log

🧾 Contoh Alur
Langkah	Input	Hasil
Tambah Device	SBX-0001 / sound box premium	✅ Device SBX-0001 berhasil ditambahkan
QC Checklist	SBX-0001	✅ Device SBX-0001 dinyatakan QC OK
QC Checklist lagi	SBX-0001	⚠️ Device SBX-0001 sudah QC sebelumnya
QC Checklist	SBX-9999	❌ Device SBX-9999 belum terdaftar
🧩 Kode Lengkap (index.html)
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>QC Tracking</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 30px; }
    h1 { color: #333; }
    form { margin-bottom: 20px; }
    input, button {
      padding: 8px; margin: 5px 0;
    }
    .log {
      border: 1px solid #ccc;
      padding: 10px;
      width: 300px;
      background: #f9f9f9;
    }
  </style>
</head>
<body>

  <h1>QC Tracking</h1>

  <h3>1️⃣ Input Device Info</h3>
  <form id="deviceForm">
    <label>Device ID</label><br>
    <input type="text" id="deviceId" placeholder="misal: SBX-0001" required><br>

    <label>Device Name</label><br>
    <input type="text" id="deviceName" placeholder="misal: sound box premium" required><br>

    <button type="submit">Add Device</button>
  </form>

  <h3>2️⃣ QC Checklist</h3>
  <form id="qcForm">
    <label>Device ID</label><br>
    <input type="text" id="qcDeviceId" placeholder="misal: SBX-0001" required><br>

    <button type="submit">Checklist QC</button>
  </form>

  <h3>📋 Log</h3>
  <div class="log" id="log"></div>

  <script>
    const devices = [];
    const qcList = [];

    function addDevice(deviceId, deviceName) {
      const exists = devices.some(d => d.deviceId === deviceId);
      if (exists) return `❌ Device ${deviceId} sudah terdaftar!`;
      devices.push({ deviceId, deviceName });
      return `✅ Device ${deviceId} (${deviceName}) berhasil ditambahkan.`;
    }

    function qcDevice(deviceId) {
      const found = devices.find(d => d.deviceId === deviceId);
      if (!found) return `❌ Device ${deviceId} belum terdaftar!`;
      const alreadyQC = qcList.includes(deviceId);
      if (alreadyQC) return `⚠️ Device ${deviceId} sudah QC sebelumnya!`;
      qcList.push(deviceId);
      return `✅ Device ${deviceId} dinyatakan QC OK.`;
    }

    const logBox = document.getElementById('log');
    function addLog(msg) {
      logBox.innerHTML += msg + "<br>";
    }

    document.getElementById('deviceForm').addEventListener('submit', e => {
      e.preventDefault();
      const id = document.getElementById('deviceId').value.trim();
      const name = document.getElementById('deviceName').value.trim();
      const result = addDevice(id, name);
      addLog(result);
      e.target.reset();
    });

    document.getElementById('qcForm').addEventListener('submit', e => {
      e.preventDefault();
      const id = document.getElementById('qcDeviceId').value.trim();
      const result = qcDevice(id);
      addLog(result);
      e.target.reset();
    });
  </script>

</body>
</html>

# QC Tracking — Frontend + Backend API

Proyek ini terdiri dari dua bagian:
- **Frontend (HTML + CSS + JS)** → Form input dan QC tracking
- **Backend (Express.js API)** → Menyimpan dan memvalidasi data device & QC

---

## ⚙️ Instalasi Backend

```bash
cd backend
npm install
npm start
Server akan berjalan di:

arduino
Copy code
http://localhost:3000
🖥️ Menjalankan Frontend
Buka file frontend/index.html langsung di browser
atau gunakan Live Server di VSCode.

🔗 Endpoint API
Method	Endpoint	Deskripsi
POST	/devices	Tambah device baru
POST	/qc	Tandai device sudah QC
GET	/devices	Ambil semua device terdaftar
GET	/qc	Ambil semua device yang QC OK


