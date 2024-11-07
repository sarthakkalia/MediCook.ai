from src.components.nutrition_calculate import search_foods, get_food_nutrients
# Search for foods matching the query "palak paneer"
fdc_ids = search_foods("palak paneer")
if fdc_ids:
    # Try to retrieve nutrients for each FDC ID until we find one with nutrient data
    for fdc_id in fdc_ids:
        nutrients = get_food_nutrients(fdc_id)
        if nutrients and nutrients["nutrients"]:
            print("\nNutrients found:", nutrients)
            break
        else:
            print(f"No nutrients found for FDC ID: {fdc_id}")