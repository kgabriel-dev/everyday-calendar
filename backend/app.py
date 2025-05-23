from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os


app = Flask(__name__)
CORS(app, origins='*')  # Allow all origins for CORS
DATA_FILE = 'data.json'

def read_data():
    if not os.path.exists(DATA_FILE):
        return {}
    
    with open(DATA_FILE, 'r') as file:
        return json.load(file)


def write_data(data):
    with open(DATA_FILE, 'w') as file:
        json.dump(data, file, indent=2)


@app.route('/data', methods=['GET'])
def get_data():
    data = read_data()
    return jsonify(data)


@app.route('/data', methods=['POST'])
def set_data():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    if not isinstance(data, dict):
        return jsonify({"error": "Data must be a JSON object"}), 400
    
    write_data(data)
    return jsonify({"message": "Data saved successfully"}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)