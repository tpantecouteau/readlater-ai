from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from enum import Enum
from typing import Optional


class StatusEnum(str, Enum):
    pending = "pending"
    scraped = "scraped"
    done = "done"
    error = "error"


class Post(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    url: str = Field(nullable=False, index=True, unique=True)
    title: str | None = Field(default=None)
    content: str | None = Field(default=None)
    summary: str | None = Field(default=None)
    analysis: str | None = Field(default=None, nullable=True)
    tags: str | None = Field(default=None)
    status: StatusEnum = Field(default="pending", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    source: str | None = Field(default=None, index=True)
    owner_id: int | None = Field(default=None, foreign_key="user.id")
    owner: Optional["User"] = Relationship(back_populates="posts")


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, nullable=False)
    email: str | None = Field(default=None, index=True, unique=True)
    hashed_password: str = Field(nullable=False)
    is_active: bool = Field(default=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    posts: list["Post"] = Relationship(back_populates="owner")
