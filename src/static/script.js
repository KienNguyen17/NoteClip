class MusicComment {
    constructor(startTime, commentText, playerId) {
        this.startTime = startTime;
        // this.endTime = endTime;
        // this.duration = endTime - startTime;
        this.commentText = commentText
        this.playerId = playerId
    }
}

class MusicBlock {
    constructor(youtubeID, playerId) {
        this.youtubeID = youtubeID
        this.playerId = playerId
        this.comments = []
    }

    addComment(myFormData) {
        var startTime = (myFormData.get("startMinute")*60)
        startTime += Number(myFormData.get("startSecond"))
        // var endTime = (myFormData.get("endMinute")*60)
        // endTime += Number(myFormData.get("endSecond"))

        
        var commentText = myFormData.get("comment")

        var musicComment = new MusicComment(startTime, commentText, this.playerId)
        this.comments.push(musicComment) 

        return musicComment
    }
}

// -------------------------
// USED FOR CREATING A POST
// -------------------------

let textNum = 0
let musicNum = 0
let thumbnailURL = ""

let players = []
let playersTime = []

let musicBlocks = []

function initCreatePost() {
    // make sure they are restarted on new load
    textNum = 0
    musicNum = 0

    players = []
    playersTime = []

    musicBlocks = []

    $("#finishForm").on("submit", (e) => submitPost(e));
}

// Coded with help from: https://stackoverflow.com/questions/52229901/navigate-to-route-on-button-clickTODO 
function applyFunction(clickedButton, callback) {
    if (clickedButton != null) {
        clickedButton.onclick = callback;
    }
}

var loginButton = document.getElementById('loginButton');
applyFunction(loginButton, () => {
    location.assign("/login/good");
})

var newPostButton = document.getElementById('newPostButton');
applyFunction(newPostButton, () => {
    location.assign("/new");
})

var newAccountButton = document.getElementById('newAccount');
applyFunction(newAccountButton, () => {
    location.assign("/newAccount/good");
})

var logoutButton = document.getElementById('logout');
applyFunction(logoutButton, () => {
    location.assign("/logout");
})

var backButton = document.getElementById('backButton');
applyFunction(backButton, () => {
    location.assign("../");
})

// Coded with help from: https://stackoverflow.com/questions/178325/how-do-i-check-if-an-element-is-hidden-in-jquery
// Used when creating a new post, when a user clicks the add button
function clickAdd() {
    if ( $("#addChoice").css('display') == 'none') {
        $("#addChoice").show()
    }
    else {
        $("#addChoice").hide()
    }
}

// Coded with help from: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/search
// Used when creating a new post, when a user chooses to add a music block
function addMusic() {
    $("#addChoice").hide()
    var musicId = "music" + musicNum
    $("<div class='musicDiv' id=\"" + musicId + "\"><search><form id=\"songSearchForm\"><input id=\"search-" + musicId + "\" name=\"songSearch\" type=\"search\" placeholder=\"Search...\"</form><input class=\"formSubmit\" type=\"button\" value=\"Search\" onclick=\"doSearch('" + musicId + "')\"></search></div><br/>").insertBefore("#addDiv")
    musicNum++
}

// Used when creating a new post, when a user chooses to add a text block
function addText() {
    $("#addChoice").hide()
    var textId = "text" + textNum
    textNum++
    $("<p id=\"" + textId + "\" contenteditable data-placeholder=\"Start Typing...\"></p><br/>").insertBefore("#addDiv")
}

// will probably be helpful https://stackoverflow.com/questions/18169933/submit-form-without-reloading-page
// Used when creating a new post, when a user searches for a song
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
        $("<div class='search-choice'><img id=\"image-" + key + "\" class='thumbnail'><p class='search-title'>" + item["snippet"]["title"] + "</p>" + "<button id=\"result-" + key + "\" class='addVideoButton' type='button'>Add</button></div>").appendTo("#search-results");
        $(("#result-" + key)).on("click", () => {
            if (musicNum == 1){
                thumbnailURL = item["snippet"]["thumbnails"]["default"]["url"];
            }
            addSong(item["id"]["videoId"], musicId)
            
        })
        $(("#image-" + key)).attr("src", item["snippet"]["thumbnails"]["default"]["url"])
    }
}


// Used when creating a new post, to finish adding a searched for song
function addSong(youtubeID, musicId) {    
    idNum = musicId.substring(5)
    // Help from: https://stackoverflow.com/questions/8488005/how-to-put-a-jpg-or-png-image-into-a-button-in-html
    exampleEmbed = "<div id=\"player-" + musicId + "\"></div><div class='commentsDiv'><img id='viewComments-" + musicId + "' src='..\\static\\images\\triangle.png' alt='a simple arrow'><p>View Comments</p><br/><div id='comments-"+musicId+"' class='comments-music'></div><input type='image' src='..\\static\\images\\addComment.png' alt='Add Comment' id='button-" + musicId + "' class='commentButton' onclick='addComment(" + idNum + ")'></button></div>"
    $("#search-results").remove()
    $(exampleEmbed).insertAfter("search")
    $("search").remove()
    $("#viewComments-" + musicId).on("click", (e) => viewComments(e))

    var player;
    player = new YT.Player('player-' + musicId, {
        height: '390',
        width: '640',
        videoId: youtubeID,
    });

    musicBlocks.push(new MusicBlock(youtubeID, musicId.substring(5)))
    players.push(player)
    playersTime.push(player.getCurrentTime())
}

function addComment(idNum) {
    // not sure why but it wont let me make the finish comment button an input.... (in or out of form!!!)
    // help from: https://ux.stackexchange.com/questions/112264/best-way-to-put-input-fields-that-take-minutes-and-seconds-mmss
    commentForm = "<form class='commentForm' id='commentForm" + idNum + "'><label>Start comment at: </label><input class='timeInputMin' type='number' min='0' max='59' placeholder='0' id='startMinute" + idNum + "' name='startMinute'><p class='timeDiv'>:</p><input class='timeInputSec' type='number' min='0' max='59' placeholder='0' id='startSecond" + idNum + "' name='startSecond'><button type='button' class='timestampButton'>Current timestamp</button><br/><textarea placeholder='Write a comment...' name='comment'></textarea><input type='submit' value='Finish Comment' class='formSubmit'></form>"
    $("#button-music" +idNum).hide()
    $(commentForm).insertBefore("#button-music"+idNum)
    $("#commentForm" + idNum).on("submit", (e) => finishComment(e, idNum))

    $(".timeInputMin").on("input", (e) => changeVidTime(e, idNum))
    $(".timeInputSec").on("input", (e) => changeVidTime(e, idNum))

    $(".timestampButton").on("click", (e) => setTimestamp(e, idNum))
}

function setTimestamp(e, idNum) {
    player = players[idNum]
    newTime = player.getCurrentTime()
    newSec = newTime % 60
    newMin = (newTime - newSec) / 60
    $("#startMinute" + idNum).val(newMin)
    $("#startSecond" + idNum).val(Math.floor(newSec))
}

function changeVidTime(e, idNum) {
    if (e.target.name == 'startMinute' || e.target.name == 'startSecond') {
        playerNum = e.target.parentNode.id.substring(11)
        // player = players[playerNum]
        newTime = ($("#startMinute" + idNum).val()*60) + ($("#startSecond" + idNum).val()*1)
        players[playerNum].seekTo(newTime, true)
    }
}

function finishComment(e, idNum) {
    e.preventDefault()

    myFormData = new FormData(e.target)
    musicComment = musicBlocks[idNum].addComment(myFormData)
    commentHTML = createCommentHTML(musicComment)
    $("#comments-music"+idNum).append(commentHTML)
    // $(commentHTML).insertBefore("#button-music" +idNum)

    player = players[idNum]
    $("#button-music" +idNum).show()
    $(".commentForm").remove()
}


function finishPost() {
    $("#finishDiv").show()
}

function closeFinishPost() {
    $("#finishDiv").hide()
}

function submitPost(e) {
    e.preventDefault()


    myFormData = new FormData(e.target)

    // Removes post edit functionality before saving HTML
    $(".commentButton").remove()
    $("#addDiv").remove()
    $("#finishButton").remove()
    $("p").attr("contenteditable", "False") 

    // This is probably not a very secure way to do it, but we are on a time limit here
    articleContents = $("article").html()

    var postInfo = {"title": myFormData.get("title"), "summary": myFormData.get("description"), "htmlContent": articleContents, "thumbnailURL": thumbnailURL}

    // Coded with help from: https://stackoverflow.com/questions/29987323/how-do-i-send-data-from-js-to-python-with-flask  
    $.post("/new/finish", postInfo, function() {
        location.href = "/post/" + myFormData.get("title");
    })
}

// ---------------------------------
// USED FOR BOTH CREATING AND VIEWING A POST
// ---------------------------------

// Need this function to make sure youtube players work, on both creating new posts and viewing posts
function onYouTubeIframeAPIReady() {
    console.log("youtube ready")
}

function createCommentHTML(musicComment) {
    var commentHTML = "<div class='comment' onclick='clickComment(" + musicComment.startTime + ", " + musicComment.duration + ", " + musicComment.playerId + ")'><p>" + musicComment.commentText + "</p></div>"
    return commentHTML
}

function clickComment(start, duration, playerId) {
    //  help from: https://stackoverflow.com/questions/19603618/how-do-i-get-the-reference-to-an-existing-youtube-player
    // player = new YT.Player('player-music'+playerId)
    // window.alert(start)
    // window.alert(player)
    // player.seekTo(start, true)


    callPlayer('player-music'+playerId, "seekTo", [start, true])
    // TODO: Either implement or get rid of end comment
}

// Found function at this URL: https://stackoverflow.com/questions/7443578/youtube-iframe-api-how-do-i-control-an-iframe-player-thats-already-in-the-html
/**
 * @author       Rob W <gwnRob@gmail.com>
 * @website      https://stackoverflow.com/a/7513356/938089
 * @version      20190409
 * @description  Executes function on a framed YouTube video (see website link)
 *               For a full list of possible functions, see:
 *               https://developers.google.com/youtube/js_api_reference
 * @param String frame_id The id of (the div containing) the frame
 * @param String func     Desired function to call, eg. "playVideo"
 *        (Function)      Function to call when the player is ready.
 * @param Array  args     (optional) List of arguments to pass to function func*/
function callPlayer(frame_id, func, args) {
    if (window.jQuery && frame_id instanceof jQuery) frame_id = frame_id.get(0).id;
    var iframe = document.getElementById(frame_id);
    if (iframe && iframe.tagName.toUpperCase() != 'IFRAME') {
        iframe = iframe.getElementsByTagName('iframe')[0];
    }

    // When the player is not ready yet, add the event to a queue
    // Each frame_id is associated with an own queue.
    // Each queue has three possible states:
    //  undefined = uninitialised / array = queue / .ready=true = ready
    if (!callPlayer.queue) callPlayer.queue = {};
    var queue = callPlayer.queue[frame_id],
        domReady = document.readyState == 'complete';

    if (domReady && !iframe) {
        // DOM is ready and iframe does not exist. Log a message
        window.console && console.log('callPlayer: Frame not found; id=' + frame_id);
        if (queue) clearInterval(queue.poller);
    } else if (func === 'listening') {
        // Sending the "listener" message to the frame, to request status updates
        if (iframe && iframe.contentWindow) {
            func = '{"event":"listening","id":' + JSON.stringify(''+frame_id) + '}';
            iframe.contentWindow.postMessage(func, '*');
        }
    } else if ((!queue || !queue.ready) && (
               !domReady ||
               iframe && !iframe.contentWindow ||
               typeof func === 'function')) {
        if (!queue) queue = callPlayer.queue[frame_id] = [];
        queue.push([func, args]);
        if (!('poller' in queue)) {
            // keep polling until the document and frame is ready
            queue.poller = setInterval(function() {
                callPlayer(frame_id, 'listening');
            }, 250);
            // Add a global "message" event listener, to catch status updates:
            messageEvent(1, function runOnceReady(e) {
                if (!iframe) {
                    iframe = document.getElementById(frame_id);
                    if (!iframe) return;
                    if (iframe.tagName.toUpperCase() != 'IFRAME') {
                        iframe = iframe.getElementsByTagName('iframe')[0];
                        if (!iframe) return;
                    }
                }
                if (e.source === iframe.contentWindow) {
                    // Assume that the player is ready if we receive a
                    // message from the iframe
                    clearInterval(queue.poller);
                    queue.ready = true;
                    messageEvent(0, runOnceReady);
                    // .. and release the queue:
                    while (tmp = queue.shift()) {
                        callPlayer(frame_id, tmp[0], tmp[1]);
                    }
                }
            }, false);
        }
    } else if (iframe && iframe.contentWindow) {
        // When a function is supplied, just call it (like "onYouTubePlayerReady")
        if (func.call) return func();
        // Frame exists, send message
        iframe.contentWindow.postMessage(JSON.stringify({
            "event": "command",
            "func": func,
            "args": args || [],
            "id": frame_id
        }), "*");
    }
    /* IE8 does not support addEventListener... */
    function messageEvent(add, listener) {
        var w3 = add ? window.addEventListener : window.removeEventListener;
        w3 ?
            w3('message', listener, !1)
        :
            (add ? window.attachEvent : window.detachEvent)('onmessage', listener);
    }
}


function viewComments(e) {
    idNum = e.target.id.substring(18)
    if ($("#comments-music"+idNum).css("display") == "none") {
        $("#comments-music"+idNum).show()
        $("#viewComments-music"+idNum).css("-webkit-transform", "rotate(270deg)")
        $("#viewComments-music"+idNum).css("-moz-transform", "rotate(270deg)")
        $("#viewComments-music"+idNum).css("-o-transform", "rotate(270deg)")
        $("#viewComments-music"+idNum).css("-ms-transform", "rotate(270deg)")
        $("#viewComments-music"+idNum).css("transform", "rotate(270deg)")
    }
    else {
        $("#comments-music"+idNum).hide()
        $("#viewComments-music"+idNum).css("-webkit-transform", "rotate(180deg)")
        $("#viewComments-music"+idNum).css("-moz-transform", "rotate(180deg)")
        $("#viewComments-music"+idNum).css("-o-transform", "rotate(180deg)")
        $("#viewComments-music"+idNum).css("-ms-transform", "rotate(180deg)")
        $("#viewComments-music"+idNum).css("transform", "rotate(180deg)")
    }
        
}

// ------------------------
// USED FOR VIEWING A POST
// ------------------------
function initViewPost() {
    var i = 0
    var viewTag = document.getElementById("viewComments-music0");
    while (viewTag != null) {
        $("#viewComments-music" + i).on("click", (e) => viewComments(e))
        i++
        viewTag = document.getElementById("viewComments-music" + i);
    }
}


// Wasn't working... not sure why
// $(document).ready(function() {
//     window.alert("DOC READY");
//     $("#finishForm").on("submit", (e) => submitPost(e));
// });