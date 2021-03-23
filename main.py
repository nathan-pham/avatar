from flask import Flask, render_template
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("APP_SECRET")

@app.route('/')
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)