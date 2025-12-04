import hashlib
import secrets


def hash_password(plain_password: str) -> str:
    """Hash a plain text password using SHA-256 with salt."""
    # Generate a random salt
    salt = secrets.token_hex(16)
    # Create hash
    password_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()
    # Return salt + hash for storage
    return f"{salt}:{password_hash}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a hashed password."""
    try:
        # Split stored hash to get salt and hash
        salt, stored_hash = hashed_password.split(":", 1)
        # Hash the provided password with the same salt
        password_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()
        # Compare hashes
        return password_hash == stored_hash
    except ValueError:
        return False
