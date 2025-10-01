// netlify/functions/songs.js
import fs from "fs";
import path from "path";

export async function handler(event, context) {
  const params = event.queryStringParameters;
  const folder = params.folder || "Manam";

  const songsDir = path.join(process.cwd(), "public", "songs", folder);

  try {
    const files = fs.readdirSync(songsDir);
    const mp3Files = files.filter(f => f.endsWith(".mp3"));

    let infoFile = path.join(songsDir, "info.json");
    let info = {};
    if (fs.existsSync(infoFile)) {
      info = JSON.parse(fs.readFileSync(infoFile, "utf-8"));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        Name: info.Name || folder,
        Description: info.Description || `${folder} Album`,
        Songs: mp3Files,
      }),
    };
  } catch (err) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Folder not found" }),
    };
  }
}
