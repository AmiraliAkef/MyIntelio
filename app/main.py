from fastapi import FastAPI
from fastapi.params import Security
from fastapi.security import APIKeyHeader
from fastapi.staticfiles import StaticFiles
from app.models.schemas import ChatRequest, ChatResponse
from app.controllers.chat import chat_with_amirali
from fastapi import Header, HTTPException

app = FastAPI()

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, x_api_key: str = Security(api_key_header)):
    if x_api_key != "0927405768":
        raise HTTPException(status_code=403, detail="Unauthorized")

    answer =  await  chat_with_amirali(request.question)
    return answer


app.mount("/", StaticFiles(directory="app/static", html=True), name="static")