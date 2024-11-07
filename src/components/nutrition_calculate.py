import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")
BASE_URL = "https://api.nal.usda.gov/fdc/v1"

def search_foods(query, page_size=5):
    """Search for foods by name and return a list of potential FDC IDs."""
    url = f"{BASE_URL}/foods/search"
    params = {
        "api_key": API_KEY,
        "query": query,
        "pageSize": page_size,
        "dataType": ["Survey (FNDDS)", "Foundation", "SR Legacy"],
        "sortBy": "score",
        "sortOrder": "desc"
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        results = response.json()
        if results.get("foods"):
            # Filter foods to match query more closely
            matched_foods = [
                food for food in results["foods"]
                if query.lower() in food.get("description", "").lower()
            ]
            if matched_foods:
                print(f"Found {len(matched_foods)} matches for '{query}'")
                return [food["fdcId"] for food in matched_foods]
            print(f"No exact matches found for '{query}'")
            return None
        else:
            print("No food items found.")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")
        return None

def get_food_nutrients(fdc_id):
    """Retrieve nutrient information for a specific food by its FDC ID."""
    url = f"{BASE_URL}/food/{fdc_id}"
    params = {
        "api_key": API_KEY
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        food_data = response.json()
        nutrients = {
            "description": food_data.get("description", "No description available"),
            "nutrients": {}
        }
        
        # Extract essential nutrients
        for nutrient in food_data.get("foodNutrients", []):
            nutrient_name = nutrient.get("nutrient", {}).get("name")
            nutrient_value = nutrient.get("amount")
            
            if nutrient_name in [
                "Protein",
                "Total lipid (fat)",
                "Carbohydrate, by difference",
                "Fiber, total dietary"
            ]:
                nutrients["nutrients"][nutrient_name] = nutrient_value
        
        return nutrients
        
    except requests.exceptions.RequestException as e:
        print(f"Error retrieving nutrients: {e}")
        return None

def calculate_nutrition(query):
    """Calculate nutrition information for a food item."""
    try:
        if not query:
            print("No food query provided")
            return None

        print(f"\nSearching for: {query}")
        fdc_ids = search_foods(query)
        
        if fdc_ids:
            for fdc_id in fdc_ids:
                nutrients = get_food_nutrients(fdc_id)
                if nutrients and nutrients["nutrients"]:
                    if query.lower() in nutrients["description"].lower():
                        print(f"\nNutrients found for {query}:", nutrients)
                        return nutrients
                    else:
                        print(f"Skipping mismatched result: {nutrients['description']}")
                else:
                    print(f"No nutrients found for FDC ID: {fdc_id}")
        
        print(f"No matching nutrients found for {query}")
        return {
            "description": query,
            "nutrients": {
                "Protein": 0.0,
                "Total lipid (fat)": 0.0,
                "Carbohydrate, by difference": 0.0,
                "Fiber, total dietary": 0.0
            }
        }
        
    except Exception as e:
        print(f"Error in calculate_nutrition: {e}")
        return None

# Example usage
if __name__ == "__main__":
    food_query = input("Enter food item to search: ")
    result = calculate_nutrition(food_query)
    if result:
        print("\nFinal Results:")
        print(f"Food: {result['description']}")
        print("Nutrients per 100g:")
        for nutrient, value in result['nutrients'].items():
            print(f"{nutrient}: {value}g")