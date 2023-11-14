from flask import Flask, render_template, make_response

app = Flask(__name__)

@app.route("/")
def hello_world():
    return render_template("index.html")