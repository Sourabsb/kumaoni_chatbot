import sqlite3
import hashlib
import secrets
from datetime import datetime
from pathlib import Path
from src.config import DATABASE_PATH

def get_connection():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            title TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            english_meaning TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id INTEGER NOT NULL,
            rating INTEGER,
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (message_id) REFERENCES messages(id)
        )
    """)
    
    conn.commit()
    conn.close()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_user(email: str, password: str, name: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
            (email.lower(), hash_password(password), name)
        )
        conn.commit()
        user_id = cursor.lastrowid
        return {"id": user_id, "email": email, "name": name}
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def authenticate_user(email: str, password: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, email, name FROM users WHERE email = ? AND password_hash = ?",
        (email.lower(), hash_password(password))
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"id": row["id"], "email": row["email"], "name": row["name"]}
    return None

def get_user_by_id(user_id: int) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, name FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"id": row["id"], "email": row["email"], "name": row["name"]}
    return None

def update_user(user_id: int, name: str = None, password: str = None) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    if name:
        cursor.execute("UPDATE users SET name = ? WHERE id = ?", (name, user_id))
    if password:
        cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (hash_password(password), user_id))
    conn.commit()
    cursor.execute("SELECT id, email, name FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"id": row["id"], "email": row["email"], "name": row["name"]}
    return None

def delete_user(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM sessions WHERE user_id = ?", (user_id,))
    sessions = cursor.fetchall()
    for session in sessions:
        cursor.execute("DELETE FROM messages WHERE session_id = ?", (session["id"],))
    cursor.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()

def create_session(session_id: str, user_id: int = None, title: str = None):

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR IGNORE INTO sessions (id, user_id, title) VALUES (?, ?, ?)",
        (session_id, user_id, title)
    )
    conn.commit()
    conn.close()

def update_session_title(session_id: str, title: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE sessions SET title = ? WHERE id = ?", (title, session_id))
    conn.commit()
    conn.close()

def get_user_sessions(user_id: int) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT s.id, s.title, s.created_at, s.updated_at,
           (SELECT content FROM messages WHERE session_id = s.id ORDER BY created_at LIMIT 1) as first_message
           FROM sessions s WHERE s.user_id = ? ORDER BY s.updated_at DESC""",
        (user_id,)
    )
    sessions = []
    for row in cursor.fetchall():
        sessions.append({
            "id": row["id"],
            "title": row["title"] or row["first_message"][:50] if row["first_message"] else "New Chat",
            "created_at": row["created_at"],
            "updated_at": row["updated_at"]
        })
    conn.close()
    return sessions

def save_message(session_id: str, role: str, content: str, english_meaning: str = None) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO messages (session_id, role, content, english_meaning) VALUES (?, ?, ?, ?)",
        (session_id, role, content, english_meaning)
    )
    
    cursor.execute(
        "UPDATE sessions SET updated_at = ? WHERE id = ?",
        (datetime.now(), session_id)
    )
    
    message_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return message_id

def get_session_messages(session_id: str) -> list[dict]:
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT role, content, english_meaning FROM messages WHERE session_id = ? ORDER BY created_at",
        (session_id,)
    )
    
    messages = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return messages

def delete_session(session_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
    cursor.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    conn.commit()
    conn.close()

def save_feedback(message_id: int, rating: int, comment: str = None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO feedback (message_id, rating, comment) VALUES (?, ?, ?)",
        (message_id, rating, comment)
    )
    conn.commit()
    conn.close()
