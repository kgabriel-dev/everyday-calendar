from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os


app = Flask(__name__)
# Allow all origins for CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Define the path to the data file
DATA_FILE = os.path.dirname(os.path.abspath(__file__)) + '/data.json'

# define the data name to be displayed
display_name = ""


def read_data():
    """
    Read all activities and their data from the JSON file.
    """

    if not os.path.exists(DATA_FILE):
        return {}
    
    with open(DATA_FILE, 'r') as file:
        return json.load(file)


def write_data(data):
    """
    Write all activities and their data to the JSON file.
    """

    with open(DATA_FILE, 'w') as file:
        json.dump(data, file, indent=2)


@app.route('/complete', methods=['GET'])
def get_data():
    """
    Return all activities and their data.
    """

    data = read_data()
    
    returned_data = [{
        "title": activity,
        "data": data[activity]
    } for activity in data]
    
    return jsonify(returned_data), 200


@app.route('/display', methods=['GET'])
def display_data():
    """
    Return the data for the activity currently set to be displayed.
    """

    data = read_data()
    if not data:
        return jsonify({"message": "No data available"}), 404

    # get the entry with the display name
    display_data = data.get(display_name, None)

    if display_data is None:
        return jsonify({"message": f"No data available for data name '{display_data}'"}), 404
    
    return_data = {
        "title": display_name,
        "data": display_data
    }

    return jsonify(return_data), 200


@app.route('/delete', methods=['POST'])
def delete_activity():
    """
    Delete an activity by its title.
    """

    activity = request.json.get('title')

    if not activity:
        return jsonify({"error": "No activity provided"}), 400

    data = read_data()

    if activity in data:
        del data[activity]
        write_data(data)

        global display_name
        if display_name == activity:
            display_name = next(iter(data), "")  # Set to the first activity or empty if none left

        return jsonify({"message": f"Activity '{activity}' deleted successfully"}), 200
    else:
        return jsonify({"error": f"Activity '{activity}' not found"}), 404


@app.route('/rename', methods=['POST'])
def edit_activity_title():
    """
    Rename an activity by providing old and new titles.
    """

    old_title = request.json.get('oldTitle')
    new_title = request.json.get('newTitle')

    if not old_title or not new_title:
        return jsonify({"error": "Both old and new titles must be provided"}), 400

    data = read_data()

    if new_title in data:
        return jsonify({"error": f"Activity '{new_title}' already exists"}), 400

    if old_title in data:
        data[new_title] = data.pop(old_title)
        write_data(data)

        global display_name
        if display_name == old_title:
            display_name = new_title

        return jsonify({"message": f"Activity title changed from '{old_title}' to '{new_title}'"}), 200
    else:
        return jsonify({"error": f"Activity '{old_title}' not found"}), 404
    

@app.route('/reset', methods=['POST'])
def reset_activity():
    """
    Reset the activity data to an empty list.
    """
    
    activity = request.json.get('title')

    if not activity:
        return jsonify({"error": "No activity provided"}), 400

    data = read_data()

    if activity in data:
        data[activity] = []
        write_data(data)
        return jsonify({"message": f"Activity '{activity}' reset successfully"}), 200
    else:
        return jsonify({"error": f"Activity '{activity}' not found"}), 404


@app.route('/update', methods=['POST'])
def update_activity():
    """
    Update the data for a specific activity by providing its title and a new data list.
    """

    activity = request.json.get('title')
    new_data = request.json.get('data')

    if not activity or new_data is None:
        return jsonify({"error": "Activity title and data must be provided"}), 400

    data = read_data()

    if activity in data:
        data[activity] = new_data
        write_data(data)
        return jsonify({"message": f"Activity '{activity}' updated successfully"}), 200
    else:
        return jsonify({"error": f"Activity '{activity}' not found"}), 404


@app.route('/change-display', methods=['POST'])
def change_display_name():
    """
    Change the activity to be displayed.
    """

    global display_name
    new_display_name = request.json.get('title')

    if not new_display_name:
        return jsonify({"error": "Display name must be provided"}), 400

    display_name = new_display_name
    return jsonify({"message": f"Display name changed to '{display_name}'"}), 200


@app.route('/add', methods=['POST'])
def add_activity():
    """
    Add a new activity with the given title.
    """

    activity = request.json.get('title')

    if not activity:
        return jsonify({"error": "Activity title must be provided"}), 400

    data = read_data()

    if activity in data:
        return jsonify({"error": f"Activity '{activity}' already exists"}), 400

    data[activity] = []
    write_data(data)

    return jsonify({"message": f"Activity '{activity}' added successfully"}), 201


if __name__ == '__main__':
    # set the display name to the first activity in the data file
    data = read_data()
    if data:
        display_name = next(iter(data))  # Get the first key from the data dictionary
    else:
        display_name = ""  # Set to empty if no data is available
    print(f"Display name set to: {display_name}")

    # Run the Flask app
    app.run(host='0.0.0.0', port=5000)