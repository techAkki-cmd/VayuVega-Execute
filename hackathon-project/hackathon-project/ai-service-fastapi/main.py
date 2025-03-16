from transformers import pipeline
from fastapi import FastAPI
from pymongo import MongoClient
from pydantic import BaseModel
import nest_asyncio
from pyngrok import ngrok
import uvicorn
import spacy
import uuid

nlp = spacy.load("en_core_web_sm")
sentiment_analyzer = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")
summarizer = pipeline("summarization", model="google/pegasus-cnn_dailymail")

from pymongo import MongoClient
from collections import defaultdict
import requests

API_KEY = ""
def fetch_shopping_results(product_name):
    url = "https://serpapi.com/search.json"
    params = {
        "engine": "google_shopping",
        "q": product_name,
        "gl": "us",
        "hl": "en",
        "api_key": API_KEY
    }
    
    response = requests.get(url, params=params)
    print(response.json().get("shopping_results", [])[:5])  # Get first 5 results
    return response.json().get("shopping_results",[])[:5]

def fetch_product_details(product_id):
    url = "https://serpapi.com/search.json"
    params = {
        "engine": "google_product",
        "product_id": product_id,
        "gl": "us",
        "hl": "en",
        "api_key": API_KEY,
        "reviews":1
    }
    
    response = requests.get(url, params=params)
    return response.json()

def extract_review_data(product_details):
    review_results = product_details.get("reviews_results", {})
    
    ratings = review_results.get("ratings", [])
    filters = review_results.get("filters", [])
    
    return {
        "ratings": ratings,
        "filters": filters
    }
def build_competitor_analysis(product_id):
    product_doc = collection.find_one({"_id": product_id})
    if not product_doc:
        return []
    
    shopping_results = fetch_shopping_results(product_name=product_doc["product_name"])
    competitor_analysis = []
    existing_competitors = {comp["product_name"] for comp in product_doc.get("competitor_analysis", [])}
    
    for product in shopping_results:
        if product["title"] in existing_competitors:
            continue
        
        product_details = fetch_product_details(product["product_id"])
        print(product_details)
        review_data = extract_review_data(product_details)
        print(review_data)
        competitor_analysis.append({
            "product_name": product["title"],
            "ratings": review_data["ratings"],
            "filters": review_data["filters"]
        })
    
    return competitor_analysis
client = MongoClient("")
db = client["Execute_4"]
collection = db["features_analysis"]
FEATURE_CATEGORIES = {
    # Electronics & Gadgets
    "battery": ["battery", "charging", "power", "long battery", "fast charging", "battery life", "wireless charging"],
    "camera": ["camera", "photo", "picture", "image", "lens", "megapixel", "night mode", "video recording", "zoom", "autofocus"],
    "display": ["screen", "display", "resolution", "brightness", "refresh rate", "OLED", "LCD", "touchscreen", "HDR", "contrast"],
    "performance": ["speed", "lag", "performance", "processor", "RAM", "smooth", "slow", "fast", "benchmark", "overheating"],
    "design": ["design", "build", "appearance", "aesthetic", "color", "thin", "bezel", "premium", "materials", "lightweight"],
    "durability": ["durability", "sturdy", "rugged", "scratch-resistant", "drop-proof", "waterproof", "shockproof", "shock absorption"],
    "software": ["software", "OS", "update", "bug", "UI", "user experience", "Android", "iOS", "app support", "compatibility"],
    "security": ["security", "fingerprint", "face recognition", "encryption", "password", "biometric", "privacy", "anti-theft"],
    "sound": ["sound", "audio", "speaker", "microphone", "volume", "bass", "clarity", "stereo", "noise cancellation", "treble"],
    "connectivity": ["WiFi", "Bluetooth", "5G", "network", "signal", "cellular", "hotspot", "NFC", "USB", "wireless", "infrared"],
    "storage": ["storage", "capacity", "GB", "expandable", "memory", "internal storage", "microSD", "cloud storage"],
    "gaming": ["gaming", "frame rate", "FPS", "graphics", "cooling", "thermals", "response time", "controller", "RGB lighting"],
    "accessories": ["charger", "headphones", "case", "cover", "screen protector", "stylus", "keyboard", "mouse", "tripod"],
    "calls": ["call quality", "voice clarity", "network reception", "signal strength", "noise cancellation", "hands-free"],
    
    # Home Appliances
    "energy efficiency": ["energy-efficient", "low power", "eco-friendly", "star rating", "consumption", "wattage"],
    "capacity": ["capacity", "size", "storage", "load", "volume", "liters", "kg", "cubic feet"],
    "ease of use": ["easy to use", "user-friendly", "intuitive", "simple", "convenient"],
    "cleaning": ["cleaning", "maintenance", "self-cleaning", "hygienic", "dishwasher safe"],
    "safety": ["safety", "child lock", "auto shutoff", "overheat protection", "fireproof"],
    "temperature control": ["temperature", "cooling", "heating", "adjustable", "thermostat", "auto mode"],
    
    # Vehicles & Automotive
    "fuel efficiency": ["mileage", "fuel efficiency", "mpg", "kilometers per liter", "economical"],
    "engine": ["engine", "horsepower", "torque", "cylinders", "turbo", "rpm"],
    "comfort": ["comfort", "ergonomic", "cushioning", "soft seats", "adjustable", "lumbar support"],
    "safety": ["airbags", "ABS", "traction control", "blind-spot detection", "collision warning"],
    "infotainment": ["infotainment", "touchscreen", "Bluetooth", "car play", "voice assistant"],
    
    # Fashion & Clothing
    "fabric": ["cotton", "wool", "silk", "polyester", "linen", "denim", "breathable", "stretchable"],
    "fit": ["fit", "size", "slim", "loose", "regular", "tight", "custom fit"],
    "durability": ["durability", "tear-resistant", "sturdy", "fades", "color retention"],
    "water resistance": ["waterproof", "water-resistant", "weatherproof", "moisture-wicking"],
    
    # Beauty & Skincare
    "skin type": ["sensitive", "oily", "dry", "combination", "all skin types"],
    "ingredients": ["organic", "natural", "paraben-free", "vegan", "hypoallergenic"],
    "fragrance": ["fragrance", "scent", "smell", "aroma", "long-lasting"],
    
    # Food & Beverages
    "taste": ["taste", "flavor", "sweet", "spicy", "bitter", "savory", "rich"],
    "nutrition": ["nutritious", "protein", "fiber", "sugar-free", "low-calorie", "organic"],
    "packaging": ["packaging", "sealed", "eco-friendly", "resealable", "leak-proof"],
    
    # Furniture & Home Decor
    "material": ["wood", "metal", "plastic", "glass", "leather", "fabric"],
    "assembly": ["easy to assemble", "pre-assembled", "DIY", "modular"],
    "aesthetic": ["modern", "classic", "vintage", "rustic", "minimalist"],
    
    # Fitness & Sports
    "performance": ["stamina", "boost", "lightweight", "grip", "breathability"],
    "durability": ["wear-resistant", "shock absorption", "tear-proof", "long-lasting"],
    
    # Books & Media
    "content": ["engaging", "informative", "entertaining", "boring", "plot", "character development"],
    "format": ["paperback", "hardcover", "ebook", "audiobook"],
    
    # Pricing & Value
    "price": ["price", "cost", "expensive", "cheap", "value for money", "affordable", "budget"],
    "brand": ["brand", "popular", "reputable", "well-known", "trusted", "premium", "luxury"]
}

BATCH_SIZE = 5

FEATURE_TRACKER = {
    "positive": {"features": [], "counts": []},
    "negative": {"features": [], "counts": []},
    "neutral": {"features": [], "counts": []}
}

SENTIMENT_MAPPING = {
    "5 stars": "positive",
    "4 stars": "positive",
    "3 stars": "neutral",
    "2 stars": "negative",
    "1 star": "negative",
}

review_count = 0
sentiment_counts = {}
competitor_data = {}

product_reviews = defaultdict(list)
product_summaries = defaultdict(list)


def find_product_name_by_id(product_id):
    """Fetch product name from MongoDB using product_id"""
    product = collection.find_one({"_id": product_id})
    print(product["product_name"])
    return product["product_name"] if product else "Unknown Product"


def categorize_feature(text):
    """Categorizes product features based on predefined keywords"""
    categories = []
    doc = nlp(text.lower())
    for token in doc:
        for category, keywords in FEATURE_CATEGORIES.items():
            if token.text in keywords:
                categories.append(category)
    return list(set(categories)) if categories else ["General"]


def update_mongodb(product_id):
    """Updates MongoDB using $inc for counts and maintaining previous data"""
    global FEATURE_TRACKER, review_count, sentiment_counts, product_reviews, product_summaries, competitor_data

    if review_count == 0:
        return

    product_name = find_product_name_by_id(product_id)
    
    if product_id not in sentiment_counts:
        sentiment_counts[product_id] = {"positive": 0, "negative": 0, "neutral": 0}

    update_data = {
        "$set": {"product_name": product_name},
        "$addToSet": {
            "reviews": {"$each": product_reviews[product_id]},
            "summaries": {"$each": product_summaries[product_id]}
        },
        "$inc": {
            "positive_count": sentiment_counts[product_id]["positive"],
            "negative_count": sentiment_counts[product_id]["negative"],
            "neutral_count": sentiment_counts[product_id]["neutral"]
        }
    }

    for sentiment in ["positive", "negative", "neutral"]:
        for feature in FEATURE_TRACKER[sentiment]["features"]:
            feature_doc = collection.find_one(
                {"_id": product_id, f"{sentiment}.features": feature},
                {f"{sentiment}.features": 1}
            )

            update_query = {"_id": product_id}
            if feature_doc and sentiment in feature_doc:
                features_list = feature_doc[sentiment]["features"]
                if feature in features_list:
                    idx = features_list.index(feature)  
                    update_data.setdefault("$inc", {})[f"{sentiment}.counts.{idx}"] = 1
                else:
                    update_data.setdefault("$push", {})[f"{sentiment}.features"] = feature
                    update_data.setdefault("$push", {})[f"{sentiment}.counts"] = 1
            else:
                update_data.setdefault("$push", {})[f"{sentiment}.features"] = feature
                update_data.setdefault("$push", {})[f"{sentiment}.counts"] = 1

    if product_id in competitor_data and competitor_data[product_id]:
        update_data.setdefault("$addToSet", {})["competitor_analysis"] = {"$each": competitor_data[product_id]}

    collection.update_one({"_id": product_id}, update_data, upsert=True)

    print(f"Updated MongoDB for Product ID {product_id} - {product_name} with {review_count} reviews.")

    FEATURE_TRACKER = {sentiment: {"features": [], "counts": []} for sentiment in ["positive", "negative", "neutral"]}
    sentiment_counts[product_id] = {"positive": 0, "negative": 0, "neutral": 0}
    review_count = 0
    product_reviews[product_id].clear()
    product_summaries[product_id].clear()
    competitor_data[product_id] = []


def analyze_feedback(review, product_id):
    """Processes and categorizes product feedback"""
    global review_count, sentiment_counts, competitor_data

    categories = categorize_feature(review)
    sentiment = sentiment_analyzer(review)[0]
    sentiment_label = sentiment['label']
    mapped_sentiment = SENTIMENT_MAPPING.get(sentiment_label, "neutral")
    if product_id not in sentiment_counts:
        sentiment_counts[product_id] = {"positive": 0, "negative": 0, "neutral": 0}
    for category in categories:
        if category in FEATURE_TRACKER[mapped_sentiment]["features"]:
            idx = FEATURE_TRACKER[mapped_sentiment]["features"].index(category)
            FEATURE_TRACKER[mapped_sentiment]["counts"][idx] += 1
        else:
            FEATURE_TRACKER[mapped_sentiment]["features"].append(category)
            FEATURE_TRACKER[mapped_sentiment]["counts"].append(1)

    sentiment_counts[product_id][mapped_sentiment] += 1
    review_count += 1

    product_reviews[product_id].append({
        "review": review,
        "sentiment": mapped_sentiment,
        "confidence": sentiment['score']
    })

    summary = summarizer(review, max_length=100, min_length=5, do_sample=False)[0]['summary_text'] if len(
        review.split()) > 20 else review
    product_summaries[product_id].append({
        "summary": summary,
        "sentiment": mapped_sentiment
    })

    if product_id not in competitor_data:
        competitor_data[product_id] = []
    competitor_data[product_id].extend(build_competitor_analysis(product_id))

    update_mongodb(product_id)

    return {
        "Original Feedback": review,
        "Feature Categories": categories,
        "Sentiment": sentiment_label,
        "Confidence": sentiment['score'],
        "Summarized Feedback": summary
    }

app = FastAPI()
class ReviewInput(BaseModel):
    product_id: str
    review: str

class ProductInput(BaseModel):
    product_name: str

@app.get("/all-product-sentiments")
def get_all_products():
    products = list(collection.find({}))
    for product in products:
        product["_id"] = str(product["_id"])  # Convert ObjectId to string
    return {"products": products}

@app.get("/product-sentiment/{product_id}")
def get_product(product_id: str):
    product = collection.find_one({"_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.post("/add-product")
def add_product(product_input: ProductInput):
    product_id = str(uuid.uuid4())
    new_product = {"_id": product_id, "product_name": product_input.product_name}
    collection.insert_one(new_product)
    return {"message": "Product added successfully", "product_id": product_id}

@app.post("/analyze-feedback")
def analyze_review(review_input: ReviewInput):
    response = analyze_feedback(review_input.review, review_input.product_id)
    return response

def start_ngrok():
    public_url = ngrok.connect(8000).public_url
    print(f"🚀 Public URL: {public_url}")
    return public_url

def start_server():
    nest_asyncio.apply()
    uvicorn.run(app, host="0.0.0.0", port=8000)

public_url = start_ngrok()
print(public_url)
start_server()