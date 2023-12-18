from flask import Flask, render_template, request, redirect
from flask_login import LoginManager, UserMixin, current_user, login_user, login_required, logout_user
from flask_mongoengine import MongoEngine
from mongoengine import *
from googleapiclient.discovery import build
import config

# database setup with help from https://stackabuse.com/guide-to-flask-mongoengine-in-python/
db = MongoEngine()

app = Flask(__name__)

app.config.update(SECRET_KEY = config.flask_key)

app.config["MONGODB_SETTINGS"] = [
    {
        "host": config.mongoHost,
    }
]

db.init_app(app)

# Youtube API set up

youtube = build('youtube', 'v3', developerKey=config.youtube_key)

# with help from https://medium.com/@dmitryrastorguev/basic-user-authentication-login-for-flask-using-mongoengine-and-wtforms-922e64ef87fe
# login setup
login_manager = LoginManager()
login_manager.init_app(app)


class User(db.Document, UserMixin):
    '''Create a User instance with a unique username and a password that is authorized 
    to log in and saved in the database'''
    username = db.StringField(required=True, primary_key=True)
    password = db.StringField(required=True)

@login_manager.user_loader
def load_user(id: str):
    '''query users in the database by username'''
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
            return redirect("/")
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
        
# Abstract class for a music or text block
class Element(db.Document):
    type = db.StringField(required=True)
    meta = {'allow_inheritance': True}

class TextElement(Element):
    text = db.StringField(required=True)

class MusicComment(db.Document):
    start = db.IntField(required=True)
    text = db.StringField(required=True)

class MusicElement(Element):
    uri = db.StringField(required=True)
    comments = db.ListField(db.ReferenceField(MusicComment))

class BlogPost(db.Document):
    '''create an entry representing a blog post that can be saved to the database'''
    # we probably actually want an id so that posts could theoretically have the same title, but i'm not thinking about how to figure that out yet
    # currently will overwrite existing post if it has the same title! kinda a round about way to update a post (someone elses include)
    # reminds me of that old tumblr thing. lmao
    title = db.StringField(required=True, primary_key=True)
    authorId = db.ReferenceField(User, required=True)
    summary = db.StringField(required=True)
    thumbnailURL = db.StringField(required=True)
    blocks = db.ListField(db.ReferenceField(Element))

@app.route("/")
def home():
    posts = BlogPost.objects()
    posts = list(reversed(posts))
    if not current_user.is_authenticated:
        return render_template("index.html", login=False, posts=posts)
    else:
        return render_template("index.html", login=True, posts=posts)

# Maybe we will want to pass in a post object with all info to put in Jinja?
# ohhh how are we gonna store all these formatting things like order of elements and such....
@app.route("/post/<title>")
def viewPost(title):
    findPost = BlogPost.objects(title=title).first()
    if findPost == None:
        return redirect("/")
    else:
        author = findPost.authorId.username
        blocks = findPost.blocks
        return render_template("post.html", title=title, author=author, blocks=blocks)

@app.route("/new")
@login_required
def createPost():
    return render_template("createPost.html")

@app.route("/new/finish", methods=['POST'])
def finishPost():
    title = request.form["title"]
    summary = request.form["summary"]
    authorId = current_user
    thumbnailURL = request.form["thumbnailURL"]

    # Iterate through blocks and create appropriate sub-objects to be added to post object
    blockNum = request.form["blockNum"]
    blocks = []
    i = 0
    while (i < int(blockNum)):
        if (request.form["block-" + str(i)] == "music"):
            uri = request.form["uri-" + str(i)]

            # Iterate through comments and create appropriate sub-objects to be added to music block object
            commentNum = request.form["commentCount-" + str(i)]
            comments = []
            j = 0
            while (j < int(commentNum)):
                start = request.form["comment-" + str(j) + "-start-" + str(i)]
                text = request.form["comment-" + str(j) + "-text-" + str(i)]
                newComment = MusicComment(start=start,text=text).save()
                comments.append(newComment)
                j += 1
                
            newElement = MusicElement(type="music",uri=uri,comments=comments).save()
            blocks.append(newElement)
        else:
            text = request.form["text-" + str(i)]
            newElement = TextElement(type="text",text=text).save()
            blocks.append(newElement)
        i += 1

    BlogPost(title=title, authorId=authorId, summary=summary, thumbnailURL=thumbnailURL, blocks=blocks).save()
    return redirect("/post/" + title)   

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
