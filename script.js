
let currentsong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let responce = await a.text()
    let div = document.createElement("div")
    div.innerHTML = responce;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }
    //play the firstsong

    // show all the song in playlist
    let songUl = document.querySelector(".songsList").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li> 
          
          <img class="invert" src="music.svg" alt="">
          <div class="info">
              <div>${song.replaceAll("%20", " ")}</div>
              <div>Yash</div>
          </div>
          <div class="playnow">
              <span>Play Now</span>
              <img src="play.svg" alt="">
          </div>
          
           </li>`;
    }
    //Attach event listner to each 
    Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            //   console.log(e.querySelector(".info").firstElementChild.innerHTML)
            PlayMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })

    });
    return songs


}
const PlayMusic = (track, pause = false) => {
    currentsong.src = `/${currFolder}/` + track

    if (!pause) {
        play.src = "paused.svg"
        currentsong.play()
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}
async function displayAlbumbs() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let responce = await a.text()
    let div = document.createElement("div")
    div.innerHTML = responce;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            //Get the meta data of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let responce = await a.json()
            // console.log(responce)
            cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div data-folder=${folder} class="card ">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"
                    fill="none">
                    <circle cx="12" cy="12" r="12" fill="#1DB954" />
                    <polygon points="10,8 16,12 10,16" fill="black" />
                </svg>
            </div>
            <img aria-hidden="false" draggable="false" loading="lazy"
                src="/songs/${folder}/cover.jpg"
                data-testid="card-image" alt=""
                class="mMx2LUixlnN_Fu45JpFB yMQTWVwLJ5bV8VGiaqU3 Yn2Ei5QZn19gria6LjZj">
            <h2>${responce.title}</h2>
            <p>${responce.description}</p>
        </div>`
        
        }
    };

    // load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log(item,item.currentTarget.dataset)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            PlayMusic(songs[0])

        })

    });

}

async function main() {

    //get the list of all songs   
    await getSongs("songs/ncs")
    PlayMusic(songs[0], true)

    //Display all the albumbs on the page
    displayAlbumbs()




    //Attach an event listner to play,next and privious 
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "paused.svg"
        }
        else {
            currentsong.pause()
            play.src = "play.svg"
        }
    })
    //Listen for time update event
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}:${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })
    //add a event listner to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let persent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = persent + "%";
        currentsong.currentTime = ((currentsong.duration) * persent) / 100
    })

    //add an event listner for hamburger open

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Add an event listner for hamburger clode
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })


    //Add an event listner to privious button
    privious.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            PlayMusic(songs[index - 1])
        }
    })


    //Add an event listner to next button
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            PlayMusic(songs[index + 1])
        }
    })

    //Add an event to volme
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e, e.target, e.target.value)
        currentsong.volume = parseInt(e.target.value) / 100
    })

    //Add event listner to mute songs
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target)
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            e.target.value = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            e.target.value = 10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}

main()

