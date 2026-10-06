import hashlib
import uuid
from database.db import get_db_connection

def hash_password(password: str) -> str:
    salt = "study_salt_sec_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def register_user(name: str, email: str, password: str):
    email = email.strip().lower()
    name = name.strip()
    if not name or not email or "@" not in email:
        return False, "Please enter a valid name and email address."
    if len(password) < 6:
        return False, "Password must be at least 6 characters long."

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT user_id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return False, "An account with this email already exists."

    user_id = "usr_" + uuid.uuid4().hex[:12]
    pwd_hash = hash_password(password)

    cursor.execute(
        "INSERT INTO users (user_id, name, email, password_hash) VALUES (?, ?, ?, ?)",
        (user_id, name, email, pwd_hash)
    )
    conn.commit()
    conn.close()
    return True, user_id

def login_user(email: str, password: str):
    email = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return False, "No account found with this email."

    pwd_hash = hash_password(password)
    if pwd_hash != row["password_hash"]:
        return False, "Invalid credentials. Please verify your password."

    return True, dict(row)

def get_user_by_id(user_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None
