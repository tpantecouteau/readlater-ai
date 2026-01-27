from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import select
from datetime import timedelta
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..database import SessionDep
from ..models import User
from ..schemas import UserCreate, UserRead, Token
from ..security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(request: Request, user_in: UserCreate, session: SessionDep):
    existing = session.exec(
        select(User).where(User.username == user_in.username)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hash_password(str(user_in.password)),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(request: Request, session: SessionDep, form_data: OAuth2PasswordRequestForm = Depends()):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh = create_refresh_token(data={"sub": user.username})

    return {
        "access_token": access_token,
        "refresh_token": refresh,
        "token_type": "bearer",
    }


@router.post("/refresh")
@limiter.limit("10/minute")
def refresh_token(request: Request, Authorization: str = Header(...)):
    try:
        scheme, token = Authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError()
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    username = decode_refresh_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    new_access = create_access_token(data={"sub": username})
    new_refresh = create_refresh_token(data={"sub": username})

    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
    }


def get_current_user(session: SessionDep, token: str = Depends(oauth2_scheme)) -> User:
    username = decode_access_token(token)
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
