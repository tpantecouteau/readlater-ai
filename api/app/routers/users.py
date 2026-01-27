from fastapi import APIRouter, Depends
from sqlmodel import select
from typing import Annotated

from app.database import SessionDep
from app.models import Post, User
from app.routers.auth import get_current_user
from app.schemas import ReadPost, UserRead

router = APIRouter(prefix="/users", tags=["Users"])
UserDep: Annotated[User, Depends(get_current_user)] = Depends(get_current_user)


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = UserDep):
    return current_user


@router.get("/me/posts", response_model=list[ReadPost])
async def get_my_posts(session: SessionDep, current_user: User = UserDep):
    posts = session.exec(
        select(Post)
        .where(Post.owner_id == current_user.id)
        .order_by(Post.created_at.desc())  # type: ignore
    ).all()
    for post in posts:
        if post.tags:
            post.tags = [t.strip() for t in post.tags.split(",") if t.strip()]
    return posts
