// list of songs
let songs;
let currentfolder;

// Song-Slot to update
let currentsong = new Audio();

const playMusic = (track) => {
    currentsong.src = `/songs/${currentfolder}/` + track;
    currentsong.play();
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

// ✅ Get songs via Netlify Function
async function getsongs(folder) {
    currentfolder = folder;
    console.log("📂 Loading songs from folder:", folder);

    let res = await fetch(`/api/songs?folder=${folder}`);
    let data = await res.json();


    if (!data.Songs) {
        console.error("❌ No songs found for", folder);
        return [];
    }

    songs = data.Songs;
    console.log("🎵 Final songs array:", songs);

    let songsUl = document.querySelector(".songs-list ul");
    songsUl.innerHTML = "";

    for (const song of songs) {
        songsUl.innerHTML += `
            <li>
                <img src="svg/music.svg" alt="">
                <div class="info">
                    <div>${song}</div>
                    <div>${data.Name}</div>
                </div>
                <div class="playnow">
                    <span>playnow</span>
                    <img class="invert" src="svg/playbtn.svg" alt="">
                </div>
            </li>`;
    }

    // Attach EventListener to each song
    Array.from(songsUl.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let track = e.querySelector(".info").firstElementChild.innerText.trim();
            console.log("🖱️ Song clicked:", track);
            playMusic(track);
            document.querySelector("#play").src = "svg/pause.svg";
        });
    });

    return songs;
}

// seconds to minute:second format [00:00]
function formatTime(seconds) {
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2,'0')}:${remainingSeconds.toString().padStart(2,'0')}`;
}

// ✅ Display albums using Netlify Function
async function DisplayAlbums() {
    console.log("📀 Starting to load albums...");

    // For simplicity: hardcode album folders OR fetch from root API
    let folders = ["Manam", "NonCopyright", "Copyright"];

    let cardContainer = document.querySelector(".cardcontainer");

    for (const folder of folders) {
        try {
            let res = await fetch(`/.netlify/functions/songs?folder=${folder}`);
            let jsondata = await res.json();

            if (!jsondata.Songs) continue;

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <svg class="play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50">
                        <defs>
                            <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="black" flood-opacity="0.5"/>
                            </filter>
                        </defs>
                        <circle cx="12" cy="12" r="10" fill="#3fd671" filter="url(#dropShadow)" />
                        <polygon points="10,8 16,12 10,16" fill="black"/>
                    </svg>
                    <img src="songs/${folder}/cover.jpeg" alt="">
                    <h4>${jsondata.Name}</h4>
                    <p>${jsondata.Description}</p>
                </div>`;
            console.log("✅ Album card added for folder:", folder);
        } catch (err) {
            console.error("❌ Failed to fetch info for folder:", folder, err);
        }
    }

    // Load playlist when card is clicked
    setTimeout(() => {
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                let folder = item.currentTarget.dataset.folder;
                console.log("🖱️ Album clicked:", folder);
                let list = await getsongs(folder);
                console.log("🎵 Songs loaded for album:", list);
                if (songs.length > 0) playMusic(songs[0]);
            });
        });
    }, 500);
}

// Main
async function main() {
    await getsongs("Manam");
    DisplayAlbums();

    // play/pause button
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "svg/pause.svg";
        } else {
            currentsong.pause();
            play.src = "svg/playbtn.svg";
        }
    });

    // timeupdate
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    // seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width;
        currentsong.currentTime = percent * currentsong.duration;
    });

    // hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px";
        document.querySelector(".left").style.width = "80vw";
    });

    // close menu
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-80vw";
    });

    // previous button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index > 0) playMusic(songs[index - 1]);
        else playMusic(songs[songs.length - 1]);
    });

    // next button
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index === songs.length - 1) playMusic(songs[0]);
        else playMusic(songs[index + 1]);
    });

    // volume slider
    range.addEventListener("change", (e) => {
        currentsong.volume = e.target.value / 100;
    });

    // mute/unmute
    document.querySelector(".volume img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentsong.volume = 0.7;
        }
    });
}

main();
