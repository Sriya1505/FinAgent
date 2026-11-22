"""
FinAgent Authentication & Security Service
Implements standard PBKDF2 password hashing with salt,
cryptographically signed JWT access tokens, and verification code generation.
Zero external C-binary dependencies for reliable cross-platform execution.
"""

import os
import time
import json
import base64
import hmac
import hashlib
import secrets
from typing import Optional, Dict, Any

SECRET_KEY = os.getenv("JWT_SECRET", "finagent_secure_hmac_sha256_secret_key_2026_capstone")
TOKEN_EXPIRY_SECONDS = 7 * 24 * 3600 # 7 days
RESET_CODE_EXPIRY_SECONDS = 15 * 60 # 15 minutes

def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256 with a unique random salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verifies a plain password against stored salt$hash."""
    if not stored_hash or not plain_password:
        return False
    if "$" not in stored_hash:
        return False
    try:
        salt, expected_key = stored_hash.split("$", 1)
        key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return hmac.compare_digest(key.hex(), expected_key)
    except Exception:
        return False

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")

def _b64url_decode(s: str) -> bytes:
    padding = 4 - (len(s) % 4)
    if padding and padding != 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s.encode("utf-8"))

def create_access_token(data: Dict[str, Any], expires_delta: Optional[int] = None) -> str:
    """Creates a signed JWT-compatible HS256 token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    exp_time = time.time() + (expires_delta or TOKEN_EXPIRY_SECONDS)
    payload["exp"] = int(exp_time)
    payload["iat"] = int(time.time())

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates an access token. Returns payload dict or None if invalid/expired."""
    if not token or "." not in token:
        return None
    parts = token.split(".")
    if len(parts) != 3:
        return None
    header_b64, payload_b64, sig_b64 = parts
    try:
        signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
        provided_sig = _b64url_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, provided_sig):
            return None
        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
        if payload.get("exp", 0) < time.time():
            return None # Expired
        return payload
    except Exception:
        return None

def generate_reset_code() -> str:
    """Generates a secure 6-digit verification code for password reset."""
    return f"{secrets.randbelow(900000) + 100000}"
