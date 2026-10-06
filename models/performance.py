from dataclasses import dataclass

@dataclass
class Performance:
    performance_id: str
    user_id: str
    subject_id: str
    exam_name: str
    marks: float
    maximum_marks: float
    attendance: float
    assignment_marks: float
    internal_marks: float
    exam_date: str

    @property
    def percentage(self) -> float:
        return (self.marks / self.maximum_marks * 100.0) if self.maximum_marks > 0 else 0.0
