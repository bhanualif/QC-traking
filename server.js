import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const devices = [];
const qcList = [];

// Tambah device
app.post("/devices", (req, res) => {
  const { deviceId, deviceName } = req.body;
  if (!deviceId || !deviceName)
    return res.status(400).json({ error: "Semua field wajib diisi" });

  const exists = devices.find(d => d.deviceId === deviceId);
  if (exists)
    return res.status(400).json({ error: `Device ${deviceId} sudah terdaftar` });

  devices.push({ deviceId, deviceName });
  res.json({ deviceId, deviceName });
});

// QC device
app.post("/qc", (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId)
    return res.status(400).json({ error: "Device ID wajib diisi" });

  const found = devices.find(d => d.deviceId === deviceId);
  if (!found)
    return res.status(400).json({ error: `Device ${deviceId} belum terdaftar` });

  if (qcList.includes(deviceId))
    return res.status(400).json({ error: `Device ${deviceId} sudah QC sebelumnya` });

  qcList.push(deviceId);
  res.json({ deviceId, status: "QC OK" });
});

// List semua device
app.get("/devices", (req, res) => {
  res.json(devices);
});

// List semua QC OK
app.get("/qc", (req, res) => {
  res.json(qcList);
});

app.listen(3000, () => console.log("✅ Server berjalan di http://localhost:3000"));
