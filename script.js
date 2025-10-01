
//list of songs
let songs;


let currentfolder;


//Song-Slot to update
let currentsong = new Audio();

const playMusic = (track) => {
    // let audio=new Audio("/songs/"+track);
    currentsong.src = `/songs/${currentfolder}/` + track;
    currentsong.play();

    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00/00:00";

}


async function getsongs(folder) {
    currentfolder = folder;
    console.log("📂 Loading songs from folder:", folder);

    let a = await fetch(`songs/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let s = div.getElementsByTagName("a");
    songs = [];

    for (let index = 1; index < s.length; index++) {
        const element = s[index];
        if (element.href.endsWith(".mp3")) {
            // Use the text inside <a> instead of href
            let filename = element.innerText.trim();
            console.log("   🎶 Found:", filename);
            songs.push(filename);
        }
    }

    console.log("🎵 Final songs array:", songs);

    let songsUl = document.querySelector(".songs-list ul");
    songsUl.innerHTML = "";

    let info = await fetch(`songs/${folder}/info.json`);
    let jsondata = await info.json();

    for (const song of songs) {
        songsUl.innerHTML += `
            <li>
                <img src="svg/music.svg" alt="">
                <div class="info">
                    <div>${song}</div>
                    <div>${jsondata.Name}</div>
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







//
/////
// seconds to minute:second format[00:00]
function formatTime(seconds) {

    //as seconds are taken as input 
    totalMilliseconds = seconds * 1000;

    // Convert milliseconds to total seconds
    const totalSeconds = Math.floor(totalMilliseconds / 1000);

    // Calculate minutes and seconds
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    // Format minutes and seconds with leading zeros
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function DisplayAlbums() {
    console.log("📀 Starting to load albums...");

    let a = await fetch(`songs`);
    let response = await a.text();
    console.log("📄 Raw server response for /songs/:", response);

    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    console.log("🔗 Found anchors in /songs/:", anchors.length);

    let cardContainer = document.querySelector(".cardcontainer");

    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        console.log(`🔍 Checking link ${index}:`, e.getAttribute("href"));

        if (!e.getAttribute("href") || e.getAttribute("href") === "../") {
            console.log("⏩ Skipping parent folder or empty link");
            continue;
        }

        // Decode and normalize the href
        let hrefDecoded = decodeURIComponent(e.getAttribute("href")).replace(/\\/g, "/");
        console.log("🌐 Normalized href:", hrefDecoded);

        // Extract folder name (last part of the path)
        let folderParts = hrefDecoded.split("/").filter(Boolean);
        let folder = folderParts[folderParts.length - 1];
        console.log("📂 Detected folder name:", folder);

        // Skip files like .mp3, .json, cover.jpeg
        if (folder.endsWith(".mp3") || folder.endsWith(".json") || folder.endsWith(".jpeg")) {
            console.log("⏩ Skipping file:", folder);
            continue;
        }

        try {
            let info = await fetch(`songs/${folder}/info.json`);
            let jsondata = await info.json();
            console.log("ℹ️ Fetched info.json for folder:", folder, jsondata);

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
            console.error("❌ Failed to fetch info.json for folder:", folder, err);
        }
    }

    // Load the playlist whenever card is clicked
    setTimeout(() => {
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                let folder = item.currentTarget.dataset.folder;
                console.log("🖱️ Album clicked:", folder);
                let list = await getsongs(folder);
                console.log("🎵 Songs loaded for album:", list);
                playMusic(songs[0]);
            });
        });
    }, 500);
}






///
/////
///////
async function main() {

    //listing the songs
    await getsongs("Manam");
    console.log("songs:",songs);


    // Display all the Albums on the page 
    DisplayAlbums();






    // Attach EventListener to play,next,previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "svg/pause.svg";
        }
        else {
            currentsong.pause();
            play.src = "svg/playbtn.svg";
        }
    })



    // timeupdate event 
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime,currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    }
    )


    // addEventListener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        // console.log(e,e.offsetX,e.target.getBoundingClientRect());
        let percent = e.offsetX / e.target.getBoundingClientRect().width;
        currentsong.currentTime = (percent) * currentsong.duration;
    })


    // addEventListener to hamburger svg
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px";
        document.querySelector(".left").style.width = "80vw";
    })


    // addEventListener to close svg
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-80vw"
    })



    // addEventListener to previous svg
    previous.addEventListener("click", () => {

        // console.log(currentsong);
        // console.log(currentsong.src.split("/")[-1][0]);

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
        else{
            playMusic(songs[songs.length-1])
        }
    })



    // addEventListener to next svg
    next.addEventListener("click", () => {

        // console.log(currentsong);
        // console.log(currentsong.src.split("/")[-1][0]);

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);

        if(index == songs.length-1){
            playMusic(songs[0])
        }
        // if (index < songs.length)
        else {
            playMusic(songs[index + 1]);
        }
    })


    // addEventListener for volume
    range.addEventListener("change", (e) => {
        // console.log(e,e.target,e.target.value);
        // console.log(e.target.value);
        currentsong.volume = (e.target.value) / 100;
    })


    document.querySelector(".volume img").addEventListener("click",(e)=>{
        if(e.target.src.includes("volume.svg")){
            // console.log(e.target.src)
            e.target.src= e.target.src.replace("volume.svg","mute.svg");
            currentsong.volume=0
        }
        else{
            e.target.src= e.target.src.replace("mute.svg","volume.svg");
            currentsong.volume=.7;
        }
    })



    

}



main();

