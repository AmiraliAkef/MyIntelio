from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.models.schemas import ChatRequest, ChatResponse
from app.controllers.chat import chat_with_amirali

app = FastAPI()

# THE ENDPOINT: This is the bridge between Front and Back
@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    answer =  await  chat_with_amirali(request.question)
    return answer

# THE VIEW: This serves your HTML/CSS/JS files
# 'html=True' means it will automatically show index.html at http://localhost:8000
app.mount("/", StaticFiles(directory="app/static", html=True), name="static")