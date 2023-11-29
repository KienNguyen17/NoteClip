import requests
from base64 import b64encode 
from flask import Flask, render_template, make_response, request, redirect, url_for
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user
from mongoengine import *
import names

# need to fill in password
password = ""
connect(host="mongodb+srv://noteclipadmin:" + password + "@noteclip.s8vwzbm.mongodb.net/")

app = Flask(__name__)

app.config.update(SECRET_KEY = "adminview")
client_id = "b7bc1b3b25c64838b631dcd8fbda3894"
client_secret = "3ca65cbb7c374c0da726c9cca1e9da57"

# login setup
login_manager = LoginManager()
login_manager.init_app(app)

key = {"noteclipadmin":"admin"}

class User(UserMixin):
    def __init__(self, user_id):
        self.id = user_id

@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template("login.html")
    if request.method == 'POST':
        if checkPassword(request.form["username"], request.form["password"]):
            login_user(User("admin"))
            authorize()
            return redirect("/new")
        else:
            return "<p>Bad Login</p>"
        
        
def checkPassword(username, password):
    if username in key and password == key[username]:
        return True
    else:
        return False

@app.route("/")
def home():
    return render_template("index.html")

# Maybe we will want to pass in a post object with all info to put in Jinja?
# ohhh how are we gonna store all these formatting things like order of elements and such....
@app.route("/<postName>")
def viewPost(postName):
    print(authorize())
    return render_template("post.html", postName=postName)

@app.route("/new")
@login_required
def createPost():
    return render_template("createPost.html")

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect("/")

def authorize():
    url = 'https://accounts.spotify.com/api/token'
    headers = {"Authorization": "Basic " + b64encode((client_id + ":" + client_secret).encode("ascii")).decode("ascii")}
    data = {"grant_type":"client_credentials"}
    r = requests.post(url, headers=headers, data=data)
    return r.text

if __name__ == "__main__":
    print(authorize())