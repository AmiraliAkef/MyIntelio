from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.models.schemas import ChatRequest, ChatResponse
from app.controllers.chat import chat_with_amirali

app = FastAPI()


@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    answer =  await  chat_with_amirali(request.question)
    return answer


app.mount("/", StaticFiles(directory="app/static", html=True), name="static")