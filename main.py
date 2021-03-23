from flask_socketio import SocketIO as socket
from flask import Flask, render_template
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("APP_SECRET")
io = socket(app)

@app.route('/')
def index():
    return render_template("index.html")

@io.on("detections")
def handle_detections(data):
    print(data)

if __name__ == "__main__":
    io.run(app, host="127.0.0.1", port=8080, debug=True)