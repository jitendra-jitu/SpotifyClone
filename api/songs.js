// api/songs.js
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { folder = "Manam" } = req.query;
  const songsDir = path.join(process.cwd(), "public", "songs", folder);

  try {
    const files = fs.readdirSync(songsDir);
    const mp3Files = files.filter(f => f.endsWith(".mp3"));

    res.status(200).json({
      Name: folder,
      Description: `${folder} Album`,
      Songs: mp3Files
    });
  } catch (err) {
    res.status(404).json({ error: "Folder not found" });
  }
}
