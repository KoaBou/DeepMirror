from flask import Flask, render_template
import os

app = Flask(__name__, template_folder='assets/templates', static_folder='assets')

@app.route('/')
def index():
    return render_template('index.html', title='Index')

if __name__ == "__main__":
    from waitress import serve
    serve(app, host="0.0.0.0", port=9000)
