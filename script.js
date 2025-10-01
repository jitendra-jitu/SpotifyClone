// ========================
// Google Drive Config
// ========================
const DRIVE_FOLDER_ID = "1OAWaq-hSEEJO1abQkklrdW36gVkGi09A"; // Main folder ID
const API_KEY = "AIzaSyAZygMBoZWMdYq3P1oWFhvbg99aBm_oz4U"; // Your API Key

// ========================
// Global variables
// ========================
let songs = [];
let albums = [];
let currentsong = new Audio();
let currentSongIndex = 0;
let currentAlbumIndex = 0;

// ========================
// Play a song
// ========================
function playMusic(trackIndex) {
    const track = songs[trackIndex];
    if (!track) return console.error("❌ Track not found at index:", trackIndex);

    currentSongIndex = trackIndex;
    currentsong.src = track.url;
    currentsong.play().catch(err => console.error("❌ Error playing song:", err));

    document.querySelector(".songinfo").innerHTML = track.name;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
    console.log("▶️ Playing:", track.name, "from album:", track.album);
}

// ========================
// Format time
// ========================
function formatTime(seconds) {
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2,'0')}:${remainingSeconds.toString().padStart(2,'0')}`;
}

// ========================
// Fetch files in a folder
// ========================
async function fetchFiles(folderId) {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType)`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
}

// ========================
// Traverse folder recursively to load albums
// ========================
async function traverseFolder(folderId) {
    const items = await fetchFiles(folderId);

    for (const item of items) {
        if (item.mimeType === "application/vnd.google-apps.folder") {
            let albumInfo = { folderId: item.id, name: item.name, description: "", cover: "", songs: [] };

            // Load info.json if exists
            try {
                const infoRes = await fetch(`https://www.googleapis.com/drive/v3/files?q='${item.id}'+in+parents+and name='info.json'&key=${API_KEY}&fields=files(id,name)`);
                const infoData = await infoRes.json();
                if (infoData.files.length > 0) {
                    const infoFileId = infoData.files[0].id;
                    const infoJson = await fetch(`https://www.googleapis.com/drive/v3/files/${infoFileId}?alt=media&key=${API_KEY}`);
                    const info = await infoJson.json();
                    albumInfo.name = info.Name || albumInfo.name;
                    albumInfo.description = info.Description || "";
                }
            } catch (err) {
                console.warn("⚠️ No info.json for album:", item.name);
            }

            // Load songs and cover
            const subItems = await fetchFiles(item.id);
            for (const f of subItems) {
                if (f.mimeType.startsWith("audio/")) {
                    const track = {
                        name: f.name,
                        url: `https://drive.google.com/uc?export=download&id=${f.id}`,
                        album: albumInfo.name
                    };
                    albumInfo.songs.push(track);
                    songs.push(track); // Add globally
                } else if (f.name.toLowerCase() === "cover.jpeg") {
                    albumInfo.cover = `https://drive.google.com/uc?export=download&id=${f.id}`;
                }
            }

            if (!albumInfo.cover) albumInfo.cover = "svg/music.svg";
            albums.push(albumInfo);
        }
    }
}

// ========================
// Display albums on page
// ========================
function displayAlbums() {
    const container = document.querySelector(".cardcontainer");
    container.innerHTML = "";

    albums.forEach((album, idx) => {
        container.innerHTML += `
            <div data-album="${idx}" class="card">
                <svg class="play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50">
                    <defs>
                        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="black" flood-opacity="0.5"/>
                        </filter>
                    </defs>
                    <circle cx="12" cy="12" r="10" fill="#3fd671" filter="url(#dropShadow)" />
                    <polygon points="10,8 16,12 10,16" fill="black"/>
                </svg>
                <img src="${album.cover}" alt="${album.name}">
                <h4>${album.name}</h4>
                <p>${album.description}</p>
            </div>`;
    });

    // Album click
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", e => {
            const idx = parseInt(card.dataset.album);
            currentAlbumIndex = idx;
            songs = albums[idx].songs;

            if (songs.length > 0) playMusic(0);

            // Display playlist
            const ul = document.querySelector(".songs-list ul");
            ul.innerHTML = "";
            songs.forEach(track => {
                ul.innerHTML += `
                    <li>
                        <img src="svg/music.svg" alt="">
                        <div class="info">
                            <div>${track.name}</div>
                            <div>${track.album}</div>
                        </div>
                        <div class="playnow">
                            <span>playnow</span>
                            <img class="invert" src="svg/playbtn.svg" alt="">
                        </div>
                    </li>`;
            });

            Array.from(ul.getElementsByTagName("li")).forEach((li, idx2) => {
                li.addEventListener("click", () => playMusic(idx2));
            });
        });
    });
}

// ========================
// Main
// ========================
async function main() {
    console.log("🚀 Starting music player...");
    await traverseFolder(DRIVE_FOLDER_ID);
    console.log("✅ Loaded albums and songs");
    displayAlbums();

    const playBtn = document.getElementById("play");
    playBtn.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            playBtn.src = "svg/pause.svg";
        } else {
            currentsong.pause();
            playBtn.src = "svg/playbtn.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.getElementById("previous").addEventListener("click", () => {
        let idx = currentSongIndex - 1;
        if (idx < 0) idx = songs.length - 1;
        playMusic(idx);
    });

    document.getElementById("next").addEventListener("click", () => {
        let idx = currentSongIndex + 1;
        if (idx >= songs.length) idx = 0;
        playMusic(idx);
    });

    const range = document.getElementById("range");
    range.addEventListener("change", e => currentsong.volume = e.target.value / 100);

    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentsong.volume = 0.7;
        }
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px";
        document.querySelector(".left").style.width = "80vw";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-80vw";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width;
        currentsong.currentTime = percent * currentsong.duration;
    });
}

main();
