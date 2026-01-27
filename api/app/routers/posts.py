from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlmodel import select
from typing import List

from app.models import Post, User
from ..core.task import develop_post
from ..database import SessionDep
from ..schemas import PostCreate, ReadPost
from ..utils import detect_source
from .auth import get_current_user

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.post("/", response_model=ReadPost, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_in: PostCreate,
    background_tasks: BackgroundTasks,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    existing = session.exec(select(Post).where(Post.url == str(post_in.url))).first()
    if existing:
        raise HTTPException(status_code=400, detail="Post already exists")
    
    post = Post(**post_in.model_dump())
    post.url = str(post_in.url)
    post.source = detect_source(post.url)
    post.status = "pending"
    post.owner_id = current_user.id
    
    session.add(post)
    session.commit()
    session.refresh(post)
    
    background_tasks.add_task(develop_post, post.id)
    return post


@router.get("/", response_model=List[ReadPost])
async def list_posts(session: SessionDep, current_user: User = Depends(get_current_user)):
    posts = session.exec(
        select(Post).where(Post.owner_id == current_user.id).order_by(Post.created_at)
    ).all()
    for post in posts:
        if post.tags:
            post.tags = [t.strip() for t in post.tags.split(",") if t.strip()]
    return posts


@router.get("/{post_id}", response_model=ReadPost)
async def get_post(
    post_id: int, session: SessionDep, current_user: User = Depends(get_current_user)
):
    post = session.get(Post, post_id)
    if not post or post.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.tags:
        post.tags = [t.strip() for t in post.tags.split(",") if t.strip()]
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int, session: SessionDep, current_user: User = Depends(get_current_user)
):
    post = session.get(Post, post_id)
    if not post or post.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Post not found")
    session.delete(post)
    session.commit()
    return None
