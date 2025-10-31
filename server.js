// server.js — versi sempurna
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ====== DATA IN-MEMORY ======
let devices = [];
let qcList = [];

// ====== HELPER ======
const success = (data, message) => ({ success: true, message, data });
const failure = (message) => ({ success: false, error: message });

// ====== ROUTES ======

// Root check
app.get("/", (req, res) => {
  res.json(success(null, "QC Tracking API aktif 🚀"));
});

// Tambah device baru
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

// Tandai QC OK
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

// Ambil semua device
app.get("/devices", (req, res) => {
  res.json(success(devices, "Daftar semua device"));
});

// Ambil semua QC OK
app.get("/qc", (req, res) => {
  const qcDevices = devices.filter(d => qcList.includes(d.deviceId));
  res.json(success(qcDevices, "Daftar device QC OK"));
});

// Reset data (khusus testing)
app.delete("/reset", (req, res) => {
  devices = [];
  qcList = [];
  res.json(success(null, "Semua data berhasil direset"));
});

// Middleware error handler umum
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json(failure("Terjadi kesalahan server"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server berjalan di http://localhost:${PORT}`));
