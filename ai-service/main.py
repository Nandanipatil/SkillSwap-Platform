from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from typing import List

app = FastAPI(title="SkillSwap AI Engine")

# Lightweight Model for AI Match Scoring
model = SentenceTransformer('all-MiniLM-L6-v2')

class MatchRequest(BaseModel):
    user_skills: List[str]
    target_skills: List[str]

@app.get("/")
def home():
    return {"message": "SkillSwap AI Service Running Successfully!"}

@app.post("/api/calculate-match")
def calculate_match(data: MatchRequest):
    if not data.user_skills or not data.target_skills:
        return {"match_score": 0}

    user_text = ", ".join(data.user_skills)
    target_text = ", ".join(data.target_skills)

    embedding1 = model.encode(user_text, convert_to_tensor=True)
    embedding2 = model.encode(target_text, convert_to_tensor=True)

    similarity = util.cos_sim(embedding1, embedding2).item()
    match_percentage = round(max(0, similarity) * 100, 2)

    return {
        "match_score": match_percentage
    }