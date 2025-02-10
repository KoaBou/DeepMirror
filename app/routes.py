from flask import render_template, request, json
from app import app
from app.models import DeepfakeDetector
import base64
import re

detect_model = DeepfakeDetector()

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

def convertImage(imgData):
    imgstr = re.search(r'base64,(.*)', imgData).group(1)
    with open('camera.png', 'wb') as output:
        output.write(base64.b64decode(imgstr))

import numpy as np

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    image = data['image']
    params = data['params']

    convertImage(image)
    print(image[:100])
    # results = detect_model.predict('camera.png')
    results = np.random.rand(1).tolist()[0]
    
    return json.dumps({'results': results})

    