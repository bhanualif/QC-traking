// ===== backend/server.js =====
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// === Path setup (biar bisa akses folder frontend) ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Serve file index.html dari folder ../frontend ===
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// ====== DATA IN-MEMORY ======
let devices = [];
let qcList = [];

// ====== HELPER ======
const success = (data, message) => ({ success: true, message, data });
const failure = (message) => ({ success: false, error: message });

// ====== ROUTES API ======
app.post("/devices", (req, res) => {
  const { deviceId, deviceName } = req.body;
  if (!deviceId || !deviceName)
    return res.status(400).json(failure("Semua field wajib diisi"));

  const exists = devices.find(d => d.deviceId === deviceId);
  if (exists)
    return res.status(400).json(failure(`Device ${deviceId} sudah terdaftar`));

  const newDevice = { deviceId, deviceName };
  devices.push(newDevice);
  res.status(201).json(success(newDevice, `Device ${deviceId} berhasil ditambahkan`));
});

app.post("/qc", (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId)
    return res.status(400).json(failure("Device ID wajib diisi"));

  const found = devices.find(d => d.deviceId === deviceId);
  if (!found)
    return res.status(400).json(failure(`Device ${deviceId} belum terdaftar`));

  if (qcList.includes(deviceId))
    return res.status(400).json(failure(`Device ${deviceId} sudah QC sebelumnya`));

  qcList.push(deviceId);
  res.json(success({ deviceId, status: "QC OK" }, `Device ${deviceId} dinyatakan QC OK`));
});

app.get("/devices", (req, res) => {
  res.json(success(devices, "Daftar semua device"));
});

app.get("/qc", (req, res) => {
  const qcDevices = devices.filter(d => qcList.includes(d.deviceId));
  res.json(success(qcDevices, "Daftar device QC OK"));
});

app.delete("/reset", (req, res) => {
  devices = [];
  qcList = [];
  res.json(success(null, "Semua data berhasil direset"));
});

// === Route utama untuk tampilkan index.html ===
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// === Error handler ===
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json(failure("Terjadi kesalahan server"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server berjalan di http://localhost:${PORT}`)
);
