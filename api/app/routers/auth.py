# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import select
from datetime import timedelta
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

router = APIRouter(prefix="/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ---------- REGISTER ----------
@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, session: SessionDep):
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


# ---------- LOGIN (renvoie access + refresh) ----------
@router.post("/login", response_model=Token)
def login(session: SessionDep, form_data: OAuth2PasswordRequestForm = Depends()):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_refresh_token(data={"sub": user.username})

    # 🔑 IMPORTANT: mets bien refresh_token dans la réponse pour que le front le stocke en cookie httpOnly
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


# ---------- REFRESH (Bearer <refresh_token>) ----------
@router.post("/refresh")
def refresh_token(Authorization: str = Header(...)):
    # Authorization: Bearer <refresh_token>
    print(f"Authorization header: {Authorization}")
    print("Splitting Authorization header...")
    print(Authorization.split())
    try:
        scheme, token = Authorization.split()
        print(f"Scheme: {scheme}, Token: {token}")
        if scheme.lower() != "bearer":
            raise ValueError("Invalid scheme")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    username = decode_refresh_token(token)
    print(f"Decoded username from refresh token: {username}")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    new_access = create_access_token(data={"sub": username})
    refresh_token = create_refresh_token(data={"sub": username})

    # rotation du refresh token: optionnel. Ici on garde le même (stateless)
    return {
        "access_token": new_access,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


# ---------- CURRENT USER ----------
def get_current_user(session: SessionDep, token: str = Depends(oauth2_scheme)) -> User:
    username = decode_access_token(token)
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
