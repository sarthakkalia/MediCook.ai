# src\components\gemmod.py
import google.generativeai as genai
import requests  # Add this for Gemini API requests
import os
from flask import jsonify
from src.logger import logger
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

def gem_modify_recipe(original_recipe,modification_query):
    try:
        if not original_recipe or not modification_query:
            return jsonify({"error": "Original recipe and query are required"}), 400
        print("#3")
        prompt = (
            f"The recipe has been generated based on the user's request:\n{original_recipe}\n\n"
            f"User's Query:\n{modification_query}\n\n"
            "If the query is not clear or is just a greeting like 'Hi', ask the user to provide a more specific question about the recipe or the ingredients. "
            "Otherwise, answer the user's query or provide additional information about the recipe."
        )
        response = model.generate_content(prompt)
        return jsonify({"modified_recipe": response.text}), 200

    except requests.exceptions.RequestException as e:
        logger.error(f"Gemini API Error: {e}")
        return jsonify({"error": "Failed to modify recipe with Gemini API."}), 500

    except Exception as e:
        logger.error(f"Unhandled Exception: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500
