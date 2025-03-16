from transformers import pipeline
from fastapi import FastAPI
from pymongo import MongoClient
from pydantic import BaseModel
import nest_asyncio
from pyngrok import ngrok
import uvicorn
import spacy

nlp = spacy.load("en_core_web_sm")
sentiment_analyzer = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")
summarizer = pipeline("summarization", model="google/pegasus-cnn_dailymail")

from pymongo import MongoClient
from collections import defaultdict
import requests

API_KEY = "3ec3c31bbd662eb1f7bdf8ba9106398e7203428a78c455d83c05210abb9a2519"
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
client = MongoClient("mongodb+srv://ashmit05:Ashm2005@cluster0.fhe8ugd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["Execute_4"]
collection = db["features_analysis"]
FEATURE_CATEGORIES = {
    "battery": ["battery", "charging", "power"],
    "camera": ["camera", "photo", "picture", "image"],
    "display": ["screen", "display", "resolution"],
    "performance": ["speed", "lag", "performance", "processor"],
    "design": ["design", "build", "appearance"],
    "customer support": ["support", "warranty", "service"]
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