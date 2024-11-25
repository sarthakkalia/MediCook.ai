import os
import requests
from flask import Flask, request, render_template, jsonify
from openai import OpenAI
from src.components.nutrition_calculate import calculate_nutrition
from src.components.recipe_generate import generate_recipe  # Import from recipe_generate.py
from src.components.gemmod import gem_modify_recipe  # Import from gemmod.py
from src.components.text_to_speech import text_to_speech
from src.logger import logger
from src.exception import CustomException

app = Flask(__name__)

# Home route
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_recipe', methods=['POST'])
def generate_recipe_endpoint():
    try:
        # Get form data
        item = request.form.get('item')  # Recipe name
        condition = request.form.get('condition')  # Medical condition
        ingredients = request.form.get('ingredients')  # Optional ingredients

        if not item:
            return jsonify({"error": "Recipe name is required"}), 400

        # Generate recipe
        recipe_text = generate_recipe(condition, item, ingredients)

        # Get nutrition information
        nutrients = calculate_nutrition(item)

        # Structure the response data
        response_data = {
            "recipe": recipe_text,
            "nutrients": nutrients["nutrients"] if nutrients else {},
            "description": nutrients.get("description", "") if nutrients else ""
        }
        
        logger.info(f"Generated recipe and nutrition info for item: {item}")
        
        return jsonify(response_data), 200

    except CustomException as ce:
        logger.error(f"Custom Exception: {ce}")
        return jsonify({"error": "An internal error occurred.", "details": str(ce)}), 500

    except Exception as e:
        logger.error(f"Unhandled Exception: {e}")
        return jsonify({"error": "Failed to generate recipe. Please try again."}), 500

# Add a new route for handling chatbot queries
@app.route('/modify_recipe', methods=['POST'])
def modify_recipe():
    try:
        # Get the data from the request
        data = request.get_json()
        original_recipe = data.get("recipe")
        modification_query = data.get("query")
        
        if not original_recipe or not modification_query:
            return jsonify({"error": "Original recipe and query are required"}), 400
        
        # Call the gem_modify_recipe function
        return gem_modify_recipe(original_recipe, modification_query)

    except Exception as e:
        logger.error(f"Unhandled Exception: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500

@app.route("/text-to-speech", methods=["POST"])
def speech_generate():
    # Get the text input from the request
    print("#56")
    text = request.form.get("text")
    if not text:
        return "No text provided", 400
    
    # Directly return the response from text_to_speech
    return text_to_speech(text)

def print_server_info():
    print("Starting the Flask application...")
    print("Running on http://127.0.0.1:5000")

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))  # Use 5000 as default if PORT is not set
    print_server_info()
    app.run(host="0.0.0.0", port=port)
