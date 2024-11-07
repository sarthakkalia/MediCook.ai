import os
from flask import Flask, request, render_template, jsonify
from openai import OpenAI
from src.components.nutrition_calculate import calculate_nutrition
from src.components.recipe_generate import generate_recipe  # Import from recipe_generate.py
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

if __name__ == '__main__':
    app.run(debug=True)
