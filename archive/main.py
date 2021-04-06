from flask_socketio import SocketIO as socket
from flask import Flask, render_template
from dotenv import load_dotenv as env
# from draw import display
# from pygame.locals import * 
# import pygame, json, sys, os
import os

env()
app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("APP_SECRET")
io = socket(app)

@app.route('/')
def index():
    return render_template("index.html")

# @io.on("detections")
# def handle_detections(data):
#     for event in pygame.event.get():
#         # Close window
#         if event.type == QUIT:
#             pygame.quit()
#             sys.exit()

#     positions = data[0]["landmarks"]["_positions"]
#     for p in positions:
#         pygame.draw.circle(display, (255, 255, 255), (p["_x"], p["_y"]), 4, 0)

#     pygame.display.update()
    
if __name__ == "__main__":
    io.run(app, host="127.0.0.1", port=8080, debug=True)