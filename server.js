const express = require('express');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const rtspUrl = process.env.RTSP_URL; // RTSP URL from Render environment variable

app.use(express.static(path.join(__dirname)));

// Route to stream live camera footage using FFmpeg
app.get('/stream', (req, res) => {
    const ffmpeg = spawn('ffmpeg', [
        '-i', rtspUrl,
        '-f', 'mp4',
        '-movflags', 'frag_keyframe+empty_moov',
        '-reset_timestamps', '1',
        '-vsync', '1',
        '-c:v', 'libx264',
        '-an',
        '-'
    ]);

    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    ffmpeg.stdout.pipe(res);

    ffmpeg.stderr.on('data', (data) => console.log(`FFmpeg error: ${data}`));
    ffmpeg.on('close', () => res.end());
});

// Route to list SD card files (simulated for now)
app.get('/files', (req, res) => {
    const storagePath = "./sdcard"; // Simulated storage folder
    fs.readdir(storagePath, (err, files) => {
        if (err) return res.status(500).json({ error: "Failed to read storage" });
        res.json(files);
    });
});

// Route to download specific SD card files
app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'sdcard', req.params.filename);
    res.download(filePath);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
