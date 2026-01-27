from sqlmodel import SQLModel, create_engine, Session
from typing import Annotated
from fastapi import Depends
import os

# Fichier SQLite local (sera créé automatiquement à la racine)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/readlater"
)

# ⚙️ connect_args requis pour SQLite (thread unique)
engine = create_engine(
    DATABASE_URL, echo=os.getenv("NODE_ENV") != "production"
)

# Création de la BDD (tables)
def init_db():
    SQLModel.metadata.create_all(engine)

# Dépendance FastAPI pour ouvrir / fermer une session proprement
def get_session():
    with Session(engine) as session:
        yield session
        
SessionDep = Annotated[Session, Depends(get_session)]