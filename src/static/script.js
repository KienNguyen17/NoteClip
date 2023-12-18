/** A comment on a music video */
class MusicComment {
    constructor(startTime, commentText, playerId) {
        this.startTime = startTime;
        this.commentText = commentText
        this.playerId = playerId
    }
}

/** A single music video in a post */
class MusicBlock {
    constructor(youtubeID, playerId) {
        this.youtubeID = youtubeID
        this.playerId = playerId
        this.comments = []
    }

    addComment(myFormData) {
        var startTime = (myFormData.get("startMinute")*60)
        startTime += Number(myFormData.get("startSecond"))

        var commentText = myFormData.get("comment")
        var musicComment = new MusicComment(startTime, commentText, this.playerId)
        this.comments.push(musicComment) 

        return musicComment
    }
}

// -------------------------
// USED FOR CREATING A POST
// -------------------------

let musicNum = 0
let blockNum = 0
let thumbnailURL = "../static/images/blank_thumbnail.png"

let players = []
let blocks = []

/** 
 * Called when a createPost.html page is finished loading, initializes variables and prepares finish button 
 */
function initCreatePost() {
    musicNum = 0
    blockNum = 0

    players = []
    blocks = []

    thumbnailURL = "../static/images/blank_thumbnail.png"

    $("#finishForm").on("submit", (e) => submitPost(e));
}

/** 
 * Used for routing buttons on different pages
 * Coded with help from: https://stackoverflow.com/questions/52229901/navigate-to-route-on-button-click 
 */
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

/** 
 * Used when a user clicks the add button, hides or shows the block choices as appropriate
 * Coded with help from: https://stackoverflow.com/questions/178325/how-do-i-check-if-an-element-is-hidden-in-jquery 
 */
function clickAdd() {
    if ( $("#addChoice").css('display') == 'none') {
        $("#addChoice").show()
    }
    else {
        $("#addChoice").hide()
    }
}

/** 
 * Used when adding a music block, brings up a search bar
 * Coded with help from: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/search 
 */
function addMusic() {
    $("#addChoice").hide()
    var musicId = "block-" + blockNum
    $("<div class='musicDiv' id=\"" + musicId + "\"><search><form id=\"songSearchForm\"><input id=\"search-" + musicId + "\" name=\"songSearch\" type=\"search\" placeholder=\"Search...\"</form><input id='search-button' class=\"formSubmit\" type=\"button\" value=\"Search\" onclick=\"doSearch('" + musicId + "')\"></search></div><br/>").insertBefore("#addDiv")
    $("#deleteButtons").append("<div id='delete-" + blockNum + "' class='deleteDiv'><button class='deleteButton' type='button' onClick='deleteBlock(" + blockNum + ", true)'>Delete Block</button></div><br>")

    // got help from https://www.tutorialrepublic.com/faq/how-to-detect-enter-key-press-on-keyboard-using-jquery.php
    $("search").on("keypress", (e) => {
        if (e.which == 13) {
            $("#search-button").click();
        }
    })

    musicNum++
    blockNum++
}

/** 
 * Adds an editable text block 
 */
function addText() {
    $("#addChoice").hide()
    var textId = "block-" + blockNum
    $("<p id=\"" + textId + "\" contenteditable='true' data-placeholder=\"Start Typing...\"></p><br/>").insertBefore("#addDiv")
    $("#deleteButtons").append("<div id='delete-" + blockNum + "' class='deleteDiv'><button class='deleteButton' type='button' onClick='deleteBlock(" + blockNum + ", false)'>Delete Block</button></div><br>")

    // Help from: https://stackoverflow.com/questions/1391278/contenteditable-change-events
    $("#"+textId).on("input", (e) => changeDeleteHeight(e));

    $("#delete-"+blockNum).height($("#block-"+blockNum).height())

    blockNum++
}

/**
 * Used when clicking a delete button, removes appropriate block and updates all other blocks' ids accordingly
 */
function deleteBlock(idNum, isMusic) {
    if (isMusic) {
        blocks[idNum] = null
        players[idNum] = null    
    }
    $("#block-"+idNum).remove()
    // Help from: https://stackoverflow.com/questions/5848762/finding-an-element-after-a-specific-element-using-jquery
    $("#delete-"+idNum).nextAll('.start:first').remove()
    $("#delete-"+idNum).remove()

    for (i = idNum + 1; i < blockNum; i++) {
        if ($("#block-"+i).hasClass("musicDiv")) {
            blocks[i-1] = blocks[i]
            blocks[i] = null
            players[i-1] = players[i]
            players[i] = null
        }
        newNum = i - 1
        document.getElementById("block-"+i).id = "block-" + newNum
    }

    blockNum--
}

/**
 * Used to dynamically change the height of the div containing a delete button so subsequent divs are at the same height as their blocks
 */
function changeDeleteHeight(e) {
    idNum = e.target.id.substring(6)
    $("#delete-"+idNum).height($("#block-"+idNum).height())
}

/** 
 * Used when searching for a song, performs the search and brings up a list of results 
 */
async function doSearch(musicId) {
    query = $("#search-" + musicId).val();

    let previousSearch = $(".results");
    let previousError = $(".loading");
    if (previousSearch.length) {
        previousSearch.remove();
    }
    if (previousError.length) {
        previousError.remove();
    }

    try {
        $("<p class='loading'>Searching...</p>").insertAfter("search");
        const response = await fetch("/search/" + query);
        $(".loading").remove();
        const search_results = await response.json() // this returns a list of the top 5 search (as youtube id)
        
        if (Object.keys(search_results).length === 0) {
            $("<p class='loading'>No Search Results</p>").insertAfter("search");
        } else {
            $("<div id='search-results' class='results'></div>").insertAfter("search");
            for (key of Object.keys(search_results)) {
                let item = search_results[key];
                $("<div class='search-choice'><img id=\"image-" + key + "\" class='thumbnail'><p class='search-title'>" + item["snippet"]["title"] + "</p>" + "<button id=\"result-" + key + "\" class='addVideoButton' type='button'>Add</button></div>").appendTo("#search-results");
                $(("#result-" + key)).on("click", () => {
                    if (musicNum == 1){
                        thumbnailURL = item["snippet"]["thumbnails"]["high"]["url"];
                    }
                    addSong(item["id"]["videoId"], musicId);
                })
                $(("#image-" + key)).attr("src", item["snippet"]["thumbnails"]["high"]["url"]);
                $(("#image-" + key)).attr("alt", "thumbnail of " + item["snippet"]["title"] + " video");
            }
        }
    } catch {
        $("<p class='loading'>No Search Results</p>").insertAfter("search");
    }

    idNum = musicId.substring(6)
    $("#delete-"+idNum).height($("#block-"+idNum).height())
}


/** 
 * Used when a song is chosen, to finish adding a searched for song 
 */
function addSong(youtubeID, blockId) {    
    idNum = blockId.substring(6)
    musicId = "music" + idNum
    // Help from: https://stackoverflow.com/questions/8488005/how-to-put-a-jpg-or-png-image-into-a-button-in-html
    exampleEmbed = "<div id=\"player-" + musicId + "\"></div><div class='commentsDiv'><img onclick='viewComments(" + idNum + ")' id='viewComments-" + musicId + "' role='button' src='../static/images/triangle.png' alt='a simple arrow'><p>View Comments</p><br/><div id='comments-"+musicId+"' class='comments-music'></div><input type='image' role='button' src='../static/images/addComment.png' alt='Add Comment' id='button-" + musicId + "' class='commentButton' onclick='addComment(" + idNum + ")'></button></div>"
    $(".results").remove()
    $(exampleEmbed).insertAfter("search")
    $("search").remove()

    // Players must be referenced to interact with music video
    var player = createPlayer(idNum, youtubeID);

    blocks[idNum] = new MusicBlock(youtubeID, idNum)
    players[idNum] = player
    
    $("#delete-"+idNum).height($("#block-"+idNum).height())
}

/** 
 * Used when clicking the add comment button, brings up an add comment form 
 */
function addComment(idNum) {
    // help from: https://ux.stackexchange.com/questions/112264/best-way-to-put-input-fields-that-take-minutes-and-seconds-mmss
    commentForm = "<form class='commentForm' id='commentForm" + idNum + "'><label>Start comment at: </label><input class='timeInputMin' type='number' min='0' max='59' placeholder='0' id='startMinute" + idNum + "' name='startMinute'><p class='timeDiv'>:</p><input class='timeInputSec' type='number' min='0' max='59' placeholder='0' id='startSecond" + idNum + "' name='startSecond'><button type='button' class='timestampButton'>Current timestamp</button><br/><textarea placeholder='Write a comment...' name='comment'></textarea><input type='submit' value='Finish Comment' class='formSubmit'></form>"
    $("#button-music" +idNum).hide()
    $(commentForm).insertBefore("#button-music"+idNum)
    
    $(".timeInputMin").on("input", () => changeVidTime(idNum))
    $(".timeInputSec").on("input", () => changeVidTime(idNum))
    $(".timestampButton").on("click", () => setTimestamp(idNum))

    $("#commentForm" + idNum).on("submit", (e) => finishComment(e, idNum))

    $("#delete-"+idNum).height($("#block-"+idNum).height())
}

/** 
 * Generates the HTML for a comment, given a MusicComment object 
 */
function createCommentHTML(musicComment) {
    var commentHTML = "<div class='comment' onclick='clickComment(" + musicComment.startTime + ", " + musicComment.playerId + ")'><p>" + musicComment.commentText + "</p></div>"
    return commentHTML
}

/** 
 * Used when clicking the Current Timestamp button, sets the time of the comment to the video's current time 
 */
function setTimestamp(idNum) {
    player = players[idNum]
    newTime = player.getCurrentTime()
    newSec = newTime % 60
    newMin = (newTime - newSec) / 60
    $("#startMinute" + idNum).val(newMin)
    $("#startSecond" + idNum).val(Math.floor(newSec))
}

/** 
 * Used when entering time in an add comment, automatically moves to timestamp in video 
 */
function changeVidTime(idNum) {
    newTime = ($("#startMinute" + idNum).val()*60) + ($("#startSecond" + idNum).val()*1)
    players[idNum].seekTo(newTime, true)
}

/** 
 * Used when finishing a comment, creates a new comment object and adds to the page 
 */
function finishComment(e, idNum) {
    e.preventDefault()

    myFormData = new FormData(e.target)
    musicComment = blocks[idNum].addComment(myFormData)
    commentHTML = createCommentHTML(musicComment)
    $("#comments-music"+idNum).append(commentHTML)

    player = players[idNum]
    $("#button-music" +idNum).show()
    $(".commentForm").remove()

    $("#delete-"+idNum).height($("#block-"+idNum).height())
}

/** 
 * Opens the finish post menu 
 */
function finishPost() {
    $("#finishDiv").show()
}

/** 
 * Closes the finish post menu 
 */
function closeFinishPost() {
    $("#finishDiv").hide()
}

/** 
 * Used when finishing a post, sends a POST request to send the post to the database and redirects to the new page 
 */
function submitPost(e) {
    e.preventDefault()

    myFormData = new FormData(e.target)

    var postInfo = {
        "title": myFormData.get("title"),
        "summary": myFormData.get("description"),
        "thumbnailURL": thumbnailURL,
        "blockNum": blockNum
    }

    addToPostInfo(postInfo)

    // Coded with help from: https://stackoverflow.com/questions/29987323/how-do-i-send-data-from-js-to-python-with-flask  
    $.post("/new/finish", postInfo, function() {
        location.href = "/post/" + myFormData.get("title");
    })
}

/**
 * Used to populate Plain Object for POST request, formats all data that needs to be stored in the database 
 */
function addToPostInfo(postInfo) {
    var i = 0
    while (i < blockNum) {
        if ($("#block-" + i).hasClass("musicDiv")) {
            postInfo["block-" + i] = "music"
            postInfo["uri-" + i] = blocks[i].youtubeID
            comments = blocks[i].comments
            postInfo["commentCount-" + i] = comments.length

            var j = 0
            while (j < comments.length) {
                postInfo["comment-" + j + "-start-" + i] = comments[j].startTime
                postInfo["comment-" + j + "-text-" + i] = comments[j].commentText
                j++
            }
        }
        // Text Block
        else {
            postInfo["block-" + i] = "text"
            postInfo["text-" + i] = $("#block-" + i).text()
        }
        i++
    }
}

// ---------------------------------
// USED FOR BOTH CREATING AND VIEWING A POST
// ---------------------------------

// Need this function to make sure youtube players work, on both creating new posts and viewing posts
function onYouTubeIframeAPIReady() {
    console.log("youtube ready")
}

/**
 * Creates a player object for a given div and YouTube video
 */
function createPlayer(idNum, uri) {
    var player;
    player = new YT.Player("player-music" + idNum, {
        height: '390',
        width: '640',
        videoId: uri,
    });

    return player
}

/** 
 * Jumps to point in video when a comment is clicked on 
 */
function clickComment(start, playerId) {
    callPlayer('player-music'+playerId, "seekTo", [start, true])
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

/** 
 * Used when opening the View Comments dropdown, shows comments and rotates dropdown arrow 
 */
function viewComments(idNum) {
    if ($("#comments-music"+idNum).css("display") == "none") {
        $("#comments-music"+idNum).show()
        
        // rotate arrow
        $("#viewComments-music"+idNum).css("-webkit-transform", "rotate(270deg)")
        $("#viewComments-music"+idNum).css("-moz-transform", "rotate(270deg)")
        $("#viewComments-music"+idNum).css("-o-transform", "rotate(270deg)")
        $("#viewComments-music"+idNum).css("-ms-transform", "rotate(270deg)")
        $("#viewComments-music"+idNum).css("transform", "rotate(270deg)")

        if ($(body).hasClass("createPost")) {
            $("#delete-"+idNum).height($("#block-"+idNum).height())
        }
    }
    else {
        $("#comments-music"+idNum).hide()

        // rotate arrow
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

/** 
 * Called when a post.html page is finished loading, prepares videos 
 */
function initViewPost() {
    var i = 0
    var viewTag = document.getElementById("viewComments-music0");
    while (viewTag != null) {
        uri = $("#player-music"+i).text()
        createPlayer(i, uri)

        i++
        // Since each music video should have a view tag, this tracks how many are left
        viewTag = document.getElementById("viewComments-music" + i);
    }    
}

// ------------------------
// USED FOR LOADING ALL POSTS
// ------------------------

/**
 * Called when user clicks "see all post", make all posts visible
 */
function loadAllPosts() {
    $(".hidden").css("display", "block");
    $("#allPostsButton").css("display", "none");
    $("#lessPostsButton").css("display", "block");   
}

/**
 * Called when user clicks "see less", hide posts except for the top 6 results
 */
function removePosts() {
    $(".hidden").css("display", "none");
    $("#allPostsButton").css("display", "block");
    $("#lessPostsButton").css("display", "none");    
}