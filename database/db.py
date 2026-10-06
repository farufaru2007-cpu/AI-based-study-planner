import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'study_planner.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        course TEXT,
        branch TEXT,
        year TEXT,
        semester TEXT,
        college TEXT,
        academic_goals TEXT,
        target_marks REAL DEFAULT 80.0,
        target_cgpa REAL DEFAULT 8.5,
        daily_target_hours REAL DEFAULT 4.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Subjects Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS subjects (
        subject_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject_name TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        target_marks REAL NOT NULL,
        exam_date TEXT,
        priority TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
    )
    ''')

    # StudyTasks Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS study_tasks (
        task_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        priority TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects (subject_id) ON DELETE CASCADE
    )
    ''')

    # Performance Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS performance (
        performance_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        exam_name TEXT NOT NULL,
        marks REAL NOT NULL,
        maximum_marks REAL NOT NULL,
        attendance REAL DEFAULT 80.0,
        assignment_marks REAL DEFAULT 0.0,
        internal_marks REAL DEFAULT 0.0,
        exam_date TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects (subject_id) ON DELETE CASCADE
    )
    ''')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database schema successfully initialized.")
