import os
from flask import Flask, request, render_template, jsonify
from openai import OpenAI
from src.components.nutrition_calculate import calculate_nutrition

# import openai
# OPENAI_API_KEY="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"
app = Flask(__name__)
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    # api_key=OPENAI_API_KEY,
    base_url="https://api.perplexity.ai"
)
# Home route
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_recipe', methods=['POST'])
def generate_recipe():
    try:
        # Get form data
        item = request.form.get('item')  # Recipe name
        condition = request.form.get('condition')  # Medical condition
        ingredients = request.form.get('ingredients')  # Optional ingredients

        if not item:
            return jsonify({"error": "Recipe name is required"})

        # Generate recipe using OpenAI
        messages = [
            {"role": "system", "content": "You are a helpful assistant that generates recipes based on health conditions."},
            {"role": "user", "content": f"Generate a recipe for {item} suitable for someone with {condition}."}
        ]

        if ingredients:
            messages[1]["content"] += f" Please use these ingredients if possible: {ingredients}"

        # Generate recipe
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.1-sonar-small-128k-online",
            max_tokens=5000,
            temperature=0.7
        )

        recipe = chat_completion.choices[0].message.content.strip()
        
        # Get nutrition information
        nutrients = calculate_nutrition(item)
        
        return jsonify({
            "recipe": recipe,
            "nutrients": nutrients["nutrients"] if nutrients else {},
            "description": nutrients.get("description", "") if nutrients else ""
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to generate recipe. Please try again."})

if __name__ == '__main__':
    app.run(debug=True)