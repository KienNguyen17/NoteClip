let textNum = 0

function addElement() {
    $("#addChoice").show()
}

function addMusic() {
    $("#addChoice").hide()
    $("<form onsubmit=\"findSong()\"><input name=\"songSearch\" type=\"text\"><input type=\"submit\" value=\"Search\"></form>").insertBefore("#addDiv")
}

function addText() {
    $("#addChoice").hide()
    var textId = "text" + textNum
    textNum++
    $("<p id=\"" + textId + "\" contenteditable data-placeholder=\"Start Typing...\"></p><br/>").insertBefore("#addDiv")
}

// Submitting form currently clears entire page!!!!!
function findSong() {
    alert("You submitted the search");
}