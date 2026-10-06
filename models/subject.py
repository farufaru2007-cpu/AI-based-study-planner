from dataclasses import dataclass
from typing import Optional

@dataclass
class Subject:
    subject_id: str
    user_id: str
    subject_name: str
    difficulty: str  # Easy, Medium, Difficult
    target_marks: float
    priority: str    # Low, Medium, High
    exam_date: Optional[str] = None
