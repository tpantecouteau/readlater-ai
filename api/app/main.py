from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.routers import posts, users, auth
from app.database import init_db
from starlette.middleware.cors import CORSMiddleware
import os 

CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:3000")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 App starting... creating DB if needed.")
    init_db()
    yield
    print("👋 App shutting down...")


app = FastAPI(title="Cenmark", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)


@app.get("/")
async def root():
    return {"message": "Welcome to cenmark!"}
