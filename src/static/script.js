let textNum = 0

function addElement() {
    $("#addChoice").show()
}

// Coded with help from: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/search
function addMusic() {
    $("#addChoice").hide()
    $("<search><form id=\"songSearchForm\" onsubmit=\"findSong()\"><input name=\"songSearch\" type=\"search\" placeholder=\"Search...\"</form><input type=\"button\" value=\"Search\" onclick=\"doSearch()\"></search>").insertBefore("#addDiv")
}

function addText() {
    $("#addChoice").hide()
    var textId = "text" + textNum
    textNum++
    $("<p id=\"" + textId + "\" contenteditable data-placeholder=\"Start Typing...\"></p><br/>").insertBefore("#addDiv")
}

// will probably be helpful https://stackoverflow.com/questions/18169933/submit-form-without-reloading-page
function doSearch() {
    alert("You submitted the search")

    // put in code here to do the API request, should return a "tracks" object that contains an array of tracks
    // temporary tracks array below
    tracks = ["track1", "track2"]

    // useful for embeds: https://developer.spotify.com/documentation/embeds/references/iframe-api
    // has a seek function to seek certain point in song!!!
    spotifyID = "5omLfecV0S68gitZpQpMjQ"
    // only able to play 30 seconds right now.... is this what we really want? (if so yikes) https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started
    exampleEmbed = "<iframe style=\"border-radius:12px\" src=\"https://open.spotify.com/embed/track/"+spotifyID+"?utm_source=generator\" width=\"100%\" height=\"352\" frameBorder=\"0\" allowfullscreen=\"\" allow=\"autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture\" loading=\"lazy\"></iframe>"
    $(exampleEmbed).insertBefore("#addDiv")
}

function finishPost() {
    $("#finishForm").show()
}