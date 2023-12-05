let textNum = 0
let musicNum = 0

let players = []
let lastPlayerTime = []

// Coded with help from: https://stackoverflow.com/questions/52229901/navigate-to-route-on-button-click
var loginButton = document.getElementById('loginButton');
loginButton.onclick = function() {
    location.assign("/login");
}

var backButton = document.getElementById('backButton');
backButton.onclick = function() {
    location.assign("../");
}

var logoutButton = document.getElementById('logout');
logoutButton.onclick = function() {
    location.assign("/logout");
}



// TODO: Not working, not sure why
// var createAccount = document.getElementById('newAccount');
// createAccount.onclick = function() {
//     location.assign("/newAccount");
// }

// Coded with help from: https://stackoverflow.com/questions/178325/how-do-i-check-if-an-element-is-hidden-in-jquery
function clickAdd() {
    if ( $("#addChoice").css('display') == 'none') {
        $("#addChoice").show()
    }
    else {
        $("#addChoice").hide()
    }
}

// Coded with help from: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/search
function addMusic() {
    $("#addChoice").hide()
    var musicId = "music" + musicNum
    $("<div id=\"" + musicId + "\"><search><form id=\"songSearchForm\"><input id=\"search-" + musicId + "\" name=\"songSearch\" type=\"search\" placeholder=\"Search...\"</form><input class=\"formSubmit\" type=\"button\" value=\"Search\" onclick=\"doSearch('" + musicId + "')\"></search></div><br/>").insertBefore("#addDiv")
    musicNum++
}

function addText() {
    $("#addChoice").hide()
    var textId = "text" + textNum
    textNum++
    $("<p id=\"" + textId + "\" contenteditable data-placeholder=\"Start Typing...\"></p><br/>").insertBefore("#addDiv")
}

// will probably be helpful https://stackoverflow.com/questions/18169933/submit-form-without-reloading-page
async function doSearch(musicId) {
    query = $("#search-" + musicId).val();

    let previousSearch = $("#search-results");
    if (previousSearch.length) {
        previousSearch.remove();
    }
    
    const response = await fetch("/search/" + query);
    const search_results = await response.json() // this returns a list of the top 5 search (as youtube id)

    $("<div id='search-results'></div>").insertAfter("search");

    for (key of Object.keys(search_results)) {
        let item = search_results[key];
        $("<div class='result-item'><p class='search-title'>" + item["snippet"]["title"] + "</p>" + "<p class='search-description'>" + item["snippet"]["description"] + "</p></br></div><button id=\"result-" + key + "\" class='addVideoButton' type='button'>Add</button>").appendTo("#search-results");
        $(("#result-" + key)).on("click", () => {
            addSong(item["id"]["videoId"], musicId)
        })
    }
}

function addSong(youtubeID, musicId) {    
    idNum = musicId.substring(5)
    exampleEmbed = "<div id=\"player-" + musicId + "\"></div><button type='button' id='button-" + musicId + "' class='commentButton' onclick='addComment(" + idNum + ")'>Add Comment</button>"
    $("#search-results").remove()
    $(exampleEmbed).insertAfter("search")
    $("search").remove()

    var player;
    player = new YT.Player('player-' + musicId, {
        height: '390',
        width: '640',
        videoId: youtubeID,
        // events: {
        //     'onStateChange': onPlayerStateChange
        // },
        // playerVars: {
        //     'start': 35
        // }
    });

    // player.onclick = clickPlayer;

    players.push(player)

    
    // I think the below will be the function we need to change start time dynamically (documentation: https://developers.google.com/youtube/iframe_api_reference#Playback_controls)
    // player.seekTo(35, true)   
}

function addComment(idNum) {
    // not sure why but it wont let me make the finish comment button an input.... (in or out of form!!!)
    commentForm = "<div class='commentForm'><form><label>Leave comment at current timestamp: </label><br/><textarea name='comment'></textarea></form><button class=\"formSubmit\" type=\"button\" onclick=\"finishComment('" + idNum + "')\">Finish Comment</button></div>"

    $("#button-music" +idNum).hide()
    $(commentForm).insertBefore("#button-music"+idNum)
}

function finishComment(idNum) {
    player = players[idNum]
    $("#button-music" +idNum).show()
    $(".commentForm").remove()
    // will need to get comment info and start of comment time
}


// function clickPlayer() {
//     window.alert("Clicked")
//     // player = players[playerNum]
//     // if (player && player.getPlayerState() == 2) {
//     //     playerTime = player.getCurrentTime()
//     //     if (lastPlayerTime[playerNum] != playerTime) {
//     //         window.alert(player.getCurrentTime())
//     //     }
//     //     lastPlayerTime[playerNum] = playerTime
//     // }
// }

// function onPlayerStateChange(event) {
//     // currTime = players[0].getCurrentTime()
//     // if(event.data==2) {
//     //     window.alert(players[0].getCurrentTime())
//     // }
//     // window.alert("Curr: ")
// }

function onYouTubeIframeAPIReady() {
    console.log("youtube ready")
}
// window.onSpotifyWebPlaybackSDKReady = () => {
//     const token = getAccessKey();
//     const player = new Spotify.Player({
//       name: 'Web Playback SDK Quick Start Player',
//       getOAuthToken: cb => { cb(token); },
//       volume: 0.5
//     });

//     // Ready
//     player.addListener('ready', ({ device_id }) => {
//     console.log('Ready with Device ID', device_id);
//     });
    
//     // Not Ready
//     player.addListener('not_ready', ({ device_id }) => {
//     console.log('Device ID has gone offline', device_id);
//     });
    
//     player.addListener('initialization_error', ({ message }) => {
//         console.error(message);
//     });
    
//     player.addListener('authentication_error', ({ message }) => {
//         console.error(message);
//     });
    
//     player.addListener('account_error', ({ message }) => {
//         console.error(message);
//     });
    
//     player.connect();
// }

// async function getAccessKey() {
//     const client_id = "b7bc1b3b25c64838b631dcd8fbda3894";
//     const client_secret = "3ca65cbb7c374c0da726c9cca1e9da57";
//     const options = {
//         url: "https://accounts.spotify.com/api/token",
//         method: "POST",
//         headers: {
//             "Authorization":"Basic " + btoa(client_id + ":" + client_secret),
//             "Content-Type":"application/x-www-form-urlencoded",
//         },
//         body:"grant_type=client_credentials&client_id=" + client_id +"&client_secret=" + client_secret,
//         json:true
//     };
//     const response = await fetch("https://accounts.spotify.com/api/token", options);
    
//     const token = await response.json();

//     return token["access_token"]
// };

// from https://www.w3schools.com/howto/howto_css_modals.asp
// // When the user clicks anywhere outside of the modal, close it
// finishBox = document.getElementById("finishDiv")
// window.onclick = function(event) {
//     if (event.target == finishBox) {
//         finishBox.style.display = "none"
//     }
// }

function finishPost() {
    $("#finishDiv").show()
}

function closeFinishPost() {
    $("#finishDiv").hide()
}