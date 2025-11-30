from uuid import UUID

from pydantic import BaseModel

from app.schemas.user import UserRead


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenWithUser(Token):
    user: UserRead


class TokenData(BaseModel):
    user_id: UUID | None = None
