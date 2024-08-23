
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

    let a = await fetch(`songs/${folder}/`);
    let response = await a.text();
    // console.log(response)


    let div = document.createElement("div");
    div.innerHTML = response
    s = div.getElementsByTagName("a");
    songs = [];



    for (let index = 1; index < s.length; index++) {
        const element = s[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/songs/${folder}/`)[1])
        }
    }




    let songsUl = document.querySelector(".songs-list").getElementsByTagName("ul")[0];
    songsUl.innerHTML = "";

    for (const song of songs) {
        songsUl.innerHTML = songsUl.innerHTML + `<li>
                            <img  src="svg/music.svg" alt="" srcset="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Jitu</div>
                            </div>
                            <div class="playnow">
                                <span>playnow</span>
                                <img class="invert" src="svg/playbtn.svg" alt="">
                            </div>
                        </li>`;
    }

    // //play the first song 
    // var audio=new Audio(songs[1]);
    // // audio.play();

    // audio.addEventListener("loadeddata",()=>{
    //     console.log(audio.duration,audio.currentSrc,audio.currentTime)
    // })



    // Attach EventListener to each song 
    Array.from(document.querySelector(".songs-list").getElementsByTagName("li")).forEach(e => [

        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
            if (document.querySelector("#play").src = "svg/playbtn.svg") {
                document.querySelector("#play").src = "svg/pause.svg"
            }
        })

    ])


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
    let a = await fetch(`songs`);
    let response = await a.text();
    // console.log(response)

    let div = document.createElement("div");
    div.innerHTML = response
    console.log(div)

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardcontainer");




    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            folder = e.href.split("/").slice(-2)[0];

            let a = await fetch(`songs/${folder}/info.json`);
            let response = await a.json();

            cardContainer.innerHTML +=

                `<div data-folder="${folder}"  class="card">
                        <svg class="play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50">
                            <!-- Define the filter for the shadow -->
                            <defs>
                                <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="black" flood-opacity="0.5"/>
                                </filter>
                            </defs>
                        
                            <!-- Apply the filter to the circle -->
                            <circle cx="12" cy="12" r="10" fill="#3fd671" filter="url(#dropShadow)" />
                            <polygon points="10,8 16,12 10,16" fill="black"/>
                        </svg>
                              
                        <img src="songs/${folder}/cover.jpeg" alt="">
                        <h4>${response.Name}</h4>
                        <p>${response.Description}</p>
                    </div>`;


        }
    }

    // Load the playlist whenever card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {

            console.log(item.currentTarget, item.currentTarget.dataset)
            let list = await getsongs(`${item.currentTarget.dataset.folder}`)
            console.log(list)
            playMusic(songs[0])
        })
    })


}






///
/////
///////
async function main() {

    //listing the songs
    await getsongs("Manam");
    console.log(songs);


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
    })



    // addEventListener to next svg
    next.addEventListener("click", () => {

        // console.log(currentsong);
        // console.log(currentsong.src.split("/")[-1][0]);

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index < songs.length) {
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

