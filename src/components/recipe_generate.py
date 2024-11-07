# src/components/recipe_generate.py
import sys
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add the src directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from src.logger import logger
from src.exception import CustomException
from openai import OpenAI

logger.info('Importing OPENAI_API_KEY')
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),  # Use os.getenv instead of os.environ.get
    base_url="https://api.perplexity.ai"
)
logger.info('OPENAI_API_KEY imported')

def generate_recipe(condition, item, ingredients=None):
    logger.info('Preparing messages for OpenAI chat completion')
    messages = [
        {"role": "system", "content": "You are a helpful assistant that generates recipes based on health conditions."},
        {"role": "user", "content": f"Generate a recipe for {item} suitable for someone with {condition}."}
    ]
    if ingredients:
        messages.append({"role": "user", "content": f"Use these ingredients if possible: {ingredients}."})

    logger.info('Generating recipe using OpenAI Chat API')
    try:
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.1-sonar-small-128k-online",
            max_tokens=5000,
            temperature=0.7
        )
        
        logger.info('Extracting recipe text from OpenAI response')
        return chat_completion.choices[0].message.content.strip()
    
    except Exception as e:
        logger.error('Failed to generate recipe.')
        print(f"Error : Failed to generate recipe. Please try again.: {e}")
        raise CustomException(e, sys)
