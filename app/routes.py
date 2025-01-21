from flask import render_template
from app import app

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html', title='Index')

@app.route('/detect')
def detect():
    return render_template('df-detect/detect.html', title='Detect')

@app.route('/generate')
def generate():
    return render_template('df-generate/generate.html', title='Generate')