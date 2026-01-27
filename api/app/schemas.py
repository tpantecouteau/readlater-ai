from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, HttpUrl

Status = Literal["pending", "scraped", "done", "error"]


class PostCreate(BaseModel):
    url: HttpUrl
    content: str
    title: str
    owner_id: int | None = None


class ReadPost(BaseModel):
    id: int
    url: str
    title: str | None = None
    content: str | None = None
    summary: str | None = None
    analysis: str | None = None
    source: str | None = None
    tags: list[str] | None = None
    status: Status = "pending"
    created_at: datetime
    owner_id: int | None = None

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr | None = None


class UserRead(BaseModel):
    id: int
    username: str
    email: EmailStr | None = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class LoginInput(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"


class TokenData(BaseModel):
    sub: str | None = None
