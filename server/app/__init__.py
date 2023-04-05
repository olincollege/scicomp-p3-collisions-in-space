from flask import Flask
from flask_cors import CORS
from flask_compress import Compress

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": ["*", "null"]}})

app.config["COMPRESS_REGISTER"] = False
compress = Compress()
compress.init_app(app)

from .routes import *
