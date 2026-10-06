from dataclasses import dataclass
from typing import Optional

@dataclass
class StudyTask:
    task_id: str
    user_id: str
    subject_id: str
    topic: str
    date: str
    start_time: str
    end_time: str
    priority: str
    difficulty: str
    status: str = "pending"  # pending, completed
    notes: Optional[str] = ""
