from flask import Flask, render_template, make_response

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

# Maybe we will want to pass in a post object with all info to put in Jinja?
# ohhh how are we gonna store all these formatting things like order of elements and such....
@app.route("/<postName>")
def viewPost(postName):
    return render_template("post.html", postName=postName)