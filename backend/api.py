import uuid
from fastapi import FastAPI, HTTPException, Depends, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from contextlib import asynccontextmanager
from typing import Optional

from src.chatbot import Chatbot
from database.db import (
    init_db, create_session, save_message,
    get_session_messages, delete_session, save_feedback,
    create_user, authenticate_user, get_user_sessions, get_user_by_id,
    update_user, delete_user
)


sessions: dict[str, Chatbot] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
    sessions.clear()

app = FastAPI(title="Kumaoni Chatbot API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SignUpRequest(BaseModel):
    email: str
    password: str
    name: str

class SignInRequest(BaseModel):
    email: str
    password: str

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None

class ChatResponse(BaseModel):
    reply: str
    english_meaning: str
    retrieved_examples: list[dict]
    session_id: str
    message_id: int

class FeedbackRequest(BaseModel):
    message_id: int
    rating: int
    comment: str | None = None

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/auth/signup")
def signup(request: SignUpRequest):
    user = create_user(request.email, request.password, request.name)
    if not user:
        raise HTTPException(status_code=400, detail="Email already exists")
    response = JSONResponse(content={"user": user})
    response.set_cookie(key="user_id", value=str(user["id"]), httponly=True, max_age=86400*30)
    return response

@app.post("/api/auth/signin")
def signin(request: SignInRequest):
    user = authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    response = JSONResponse(content={"user": user})
    response.set_cookie(key="user_id", value=str(user["id"]), httponly=True, max_age=86400*30)
    return response

@app.post("/api/auth/signout")
def signout():
    response = JSONResponse(content={"status": "ok"})
    response.delete_cookie(key="user_id")
    return response

@app.get("/api/auth/me")
def get_current_user(user_id: Optional[str] = Cookie(None)):
    if not user_id:
        return {"user": None}
    user = get_user_by_id(int(user_id))
    return {"user": user}

class UpdateUserRequest(BaseModel):
    name: str | None = None
    password: str | None = None

@app.put("/api/auth/update")
def update_user_endpoint(request: UpdateUserRequest, user_id: Optional[str] = Cookie(None)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = update_user(int(user_id), request.name, request.password)
    return {"user": user}

@app.delete("/api/auth/delete")
def delete_user_endpoint(user_id: Optional[str] = Cookie(None)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    delete_user(int(user_id))
    response = JSONResponse(content={"status": "deleted"})
    response.delete_cookie(key="user_id")
    return response

@app.delete("/api/sessions/{session_id}")
def delete_session_endpoint(session_id: str, user_id: Optional[str] = Cookie(None)):
    if session_id in sessions:
        del sessions[session_id]
    delete_session(session_id)
    return {"status": "deleted"}

@app.get("/api/sessions")
def list_sessions(user_id: Optional[str] = Cookie(None)):
    if not user_id:
        return {"sessions": []}
    user_sessions = get_user_sessions(int(user_id))

    return {"sessions": user_sessions}

@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest, user_id: Optional[str] = Cookie(None)):
    session_id = request.session_id or str(uuid.uuid4())
    
    if session_id not in sessions:
        sessions[session_id] = Chatbot()
        create_session(session_id, int(user_id) if user_id else None)
        
        existing = get_session_messages(session_id)
        for msg in existing:
            sessions[session_id].context_manager.add_message(msg["role"], msg["content"])
    
    chatbot = sessions[session_id]
    result = chatbot.chat(request.message)
    
    save_message(session_id, "user", request.message, result["english_meaning"])
    message_id = save_message(session_id, "assistant", result["reply"])
    
    return ChatResponse(
        reply=result["reply"],
        english_meaning=result["english_meaning"],
        retrieved_examples=result["retrieved_examples"],
        session_id=session_id,
        message_id=message_id
    )

@app.get("/api/history/{session_id}")
def get_history(session_id: str):
    messages = get_session_messages(session_id)
    return {"messages": messages}

@app.post("/api/reset/{session_id}")
def reset_session(session_id: str):
    if session_id in sessions:
        sessions[session_id].reset()
    delete_session(session_id)
    return {"status": "reset"}

@app.post("/api/feedback")
def submit_feedback(request: FeedbackRequest):
    save_feedback(request.message_id, request.rating, request.comment)
    return {"status": "saved"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
