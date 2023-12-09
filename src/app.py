from pprint import pprint
import requests
from base64 import b64encode 
from flask import Flask, jsonify, render_template, make_response, request, redirect, url_for
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user
from flask_mongoengine import MongoEngine
from mongoengine import *
from googleapiclient.discovery import build
import config
# # import names

# # need to fill in password
# # password = ""
# # connect(host="mongodb+srv://noteclipadmin:" + password + "@noteclip.s8vwzbm.mongodb.net/")


db = MongoEngine()

app = Flask(__name__)

app.config.update(SECRET_KEY = config.flask_key)

app.config["MONGODB_SETTINGS"] = [
    {
        # "db": "NoteClip",
        "host": config.mongoHost,
        # "port": 27017,
        # "alias": "default",
    }
]

db.init_app(app)

# Youtube API set up

youtube = build('youtube', 'v3', developerKey=config.youtube_key)

# login setup
login_manager = LoginManager()
login_manager.init_app(app)


class User(db.Document, UserMixin):
    username = db.StringField(required=True, primary_key=True)
    password = db.StringField(required=True)

@login_manager.user_loader
def load_user(id: str):
    try:
        user = User.objects(username=id).first()
        return user
    except:
        return 

@app.route("/login/<status>", methods=['GET', 'POST'])
def login(status):
    if request.method == 'GET':
        return render_template("login.html", status=status)
    if request.method == 'POST':
        username = request.form["username"]
        password = request.form["password"]
        attemptLogin = User.objects(username=username).first()
        if attemptLogin != None and password == attemptLogin.password:
            login_user(attemptLogin)
            # authorize()
            return redirect("/new")
        else:
            return redirect("/login/bad")
        
@app.route("/newAccount/<status>", methods=['GET', 'POST'])
def newAccount(status):
    if request.method == 'GET':
        return render_template("newAccount.html", status=status)
    if request.method == 'POST':
        username = request.form["username"]
        password = request.form["password"]
        attemptLogin = User.objects(username=username).first()
        if attemptLogin != None:
            return redirect("/newAccount/bad")
        else:
            User(username=username, password=password).save()
            return redirect("/login/success")
        
# class Element(db.EmbeddedDocument):
#     order = db.IntField(required=True, primary_key=True)

# class TextElement(Element):
#     text = db.StringField(required=True)

# class MusicComment(db.EmbeddedDocument):
#     start = db.IntField(required=True)
#     end = db.IntField(required=True)
#     text = db.StringField(required=True)

# class MusicElement(Element):
#     uri = db.StringField(required=True)
#     comments = db.ListField(db.ReferenceField(MusicComment), required=True)

# class BlogPost(db.Document):
#     # we probably actually want an id so that posts could theoretically have the same title, but i'm not thinking about how to figure that out yet
#     # blogId = db.StringField(required=True, primary_key=True)
#     title = db.StringField(required=True, primary_key=True)
#     authorId = db.ReferenceField(User, required=True)
#     elements = db.ListField(db.ReferenceField(Element), required=True)
#     summary = db.StringField(required=True)

@app.route("/")
def home():
    return render_template("index.html")

# Maybe we will want to pass in a post object with all info to put in Jinja?
# ohhh how are we gonna store all these formatting things like order of elements and such....
@app.route("/post/<postName>")
def viewPost(postName):
    # print(authorize())
    return render_template("post.html", postName=postName)

@app.route("/new", methods=['GET', 'POST'])
# @login_required
def createPost():
    if request.method == 'GET':
        return render_template("createPost.html")
    if request.method == 'POST':
        title = request.form["title"]
        summary = request.form["description"]
        # also need to get rest of post info - maybe just save the html and remove all the editing tags upon loading?


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect("/")

@app.route("/search/<query>", methods=['GET'])
def search(query):
    if request.method == "GET":
        search_request = youtube.search().list(part="snippet", maxResults=5, q=query, videoEmbeddable='true', type="video", videoCategoryId="10")
        result_dict = {}
        index = 0
        for result in search_request.execute()["items"]:
            result_dict[index] = result
            index+=1
        return result_dict
    
# todo: move to javascript!!!!
# @app.route("/authorize")
# def authorize():
#     url = 'https://accounts.spotify.com/api/token'
#     headers = {"Authorization": "Basic " + b64encode((client_id + ":" + client_secret).encode("ascii")).decode("ascii")}
#     data = {"grant_type":"client_credentials"}
#     r = requests.post(url, headers=headers, data=data)
#     return r.text

if __name__ == "__main__":
    pass
    # testUser = {
    #     "username": "Kien",
    #     "password": "admin"
    # }

    # User(**testUser).save()

    # print(User.objects(username="Kien").first().id)
    # User.objects(username="Kien").first_or_404().delete()
    # print(User.objects(username="hi").first())
