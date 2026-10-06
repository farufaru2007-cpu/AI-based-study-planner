from dataclasses import dataclass
from typing import Optional

@dataclass
class User:
    user_id: str
    name: str
    email: str
    password_hash: str
    course: Optional[str] = ""
    branch: Optional[str] = ""
    year: Optional[str] = ""
    semester: Optional[str] = ""
    college: Optional[str] = ""
    academic_goals: Optional[str] = ""
    target_marks: float = 80.0
    target_cgpa: float = 8.5
    daily_target_hours: float = 4.0
    created_at: Optional[str] = ""
