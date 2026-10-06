import uuid
from database.db import get_db_connection

def update_user_profile(user_id: str, updates: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    UPDATE users SET
        name = ?, course = ?, branch = ?, year = ?, semester = ?,
        college = ?, academic_goals = ?, target_marks = ?, target_cgpa = ?, daily_target_hours = ?
    WHERE user_id = ?
    ''', (
        updates.get('name'), updates.get('course'), updates.get('branch'),
        updates.get('year'), updates.get('semester'), updates.get('college'),
        updates.get('academic_goals'), updates.get('target_marks', 80.0),
        updates.get('target_cgpa', 8.5), updates.get('daily_target_hours', 4.0),
        user_id
    ))
    conn.commit()
    conn.close()

# Subjects
def get_user_subjects(user_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM subjects WHERE user_id = ? ORDER BY subject_name", (user_id,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def add_subject(user_id: str, subject_name: str, difficulty: str, target_marks: float, priority: str, exam_date: str = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    subject_id = "sub_" + uuid.uuid4().hex[:10]
    cursor.execute('''
    INSERT INTO subjects (subject_id, user_id, subject_name, difficulty, target_marks, priority, exam_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (subject_id, user_id, subject_name, difficulty, target_marks, priority, exam_date))
    conn.commit()
    conn.close()
    return subject_id

def delete_subject(user_id: str, subject_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM subjects WHERE subject_id = ? AND user_id = ?", (subject_id, user_id))
    cursor.execute("DELETE FROM study_tasks WHERE subject_id = ? AND user_id = ?", (subject_id, user_id))
    cursor.execute("DELETE FROM performance WHERE subject_id = ? AND user_id = ?", (subject_id, user_id))
    conn.commit()
    conn.close()

# Tasks
def get_user_tasks(user_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM study_tasks WHERE user_id = ? ORDER BY date, start_time", (user_id,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def add_study_task(user_id: str, subject_id: str, topic: str, date: str, start_time: str, end_time: str, priority: str, difficulty: str, notes: str = ""):
    conn = get_db_connection()
    cursor = conn.cursor()
    task_id = "tsk_" + uuid.uuid4().hex[:10]
    cursor.execute('''
    INSERT INTO study_tasks (task_id, user_id, subject_id, topic, date, start_time, end_time, priority, difficulty, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    ''', (task_id, user_id, subject_id, topic, date, start_time, end_time, priority, difficulty, notes))
    conn.commit()
    conn.close()
    return task_id

def toggle_task_status(user_id: str, task_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT status FROM study_tasks WHERE task_id = ? AND user_id = ?", (task_id, user_id))
    row = cursor.fetchone()
    if row:
        new_status = 'pending' if row['status'] == 'completed' else 'completed'
        cursor.execute("UPDATE study_tasks SET status = ? WHERE task_id = ? AND user_id = ?", (new_status, task_id, user_id))
        conn.commit()
    conn.close()

def delete_task(user_id: str, task_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM study_tasks WHERE task_id = ? AND user_id = ?", (task_id, user_id))
    conn.commit()
    conn.close()

# Performance
def get_user_performance(user_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM performance WHERE user_id = ? ORDER BY exam_date ASC", (user_id,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def add_performance_record(user_id: str, subject_id: str, exam_name: str, marks: float, maximum_marks: float, attendance: float, assignment_marks: float, internal_marks: float, exam_date: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    perf_id = "perf_" + uuid.uuid4().hex[:10]
    cursor.execute('''
    INSERT INTO performance (performance_id, user_id, subject_id, exam_name, marks, maximum_marks, attendance, assignment_marks, internal_marks, exam_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (perf_id, user_id, subject_id, exam_name, marks, maximum_marks, attendance, assignment_marks, internal_marks, exam_date))
    conn.commit()
    conn.close()
    return perf_id

def delete_performance_record(user_id: str, performance_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM performance WHERE performance_id = ? AND user_id = ?", (performance_id, user_id))
    conn.commit()
    conn.close()
