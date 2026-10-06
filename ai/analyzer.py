import numpy as np
import pandas as pd
from datetime import datetime

def analyze_performance(user_profile: dict, subjects: list, tasks: list, performance_records: list):
    """
    ML and statistical analyzer based strictly on the user's personal historical academic data.
    """
    record_count = len(performance_records)

    if record_count < 2:
        return {
            "has_sufficient_data": False,
            "record_count": record_count,
            "expected_performance": 0.0,
            "trend": "stable",
            "trend_slope": 0.0,
            "weak_subjects": [],
            "strong_subjects": [],
            "risk_level": "Moderate",
            "risk_factors": ["Insufficient historical assessment records (< 2) to train regression models."],
            "suggested_weekly_hours": user_profile.get("daily_target_hours", 4.0) * 7.0,
            "consistency_score": 50,
            "message": "At least 2 historical exam records are required to train the AI prediction model."
        }

    # Prepare DataFrame
    df = pd.DataFrame(performance_records)
    df["percentage"] = (df["marks"] / df["maximum_marks"] * 100.0).clip(0, 100)
    df["exam_date"] = pd.to_datetime(df["exam_date"])
    df = df.sort_values("exam_date").reset_index(drop=True)

    # 1. Trend Analysis via OLS Linear Regression
    n = len(df)
    x = np.arange(1, n + 1)
    y = df["percentage"].values

    x_mean = np.mean(x)
    y_mean = np.mean(y)
    numerator = np.sum((x - x_mean) * (y - y_mean))
    denominator = np.sum((x - x_mean) ** 2)
    slope = float(numerator / denominator) if denominator != 0 else 0.0

    trend = "stable"
    if slope > 0.8:
        trend = "improving"
    elif slope < -0.8:
        trend = "declining"

    # 2. Multi-feature Regularized Projection
    weights = np.array([1.2 ** i for i in range(n)])
    weighted_mean = np.sum(y * weights) / np.sum(weights)

    mean_attendance = float(df["attendance"].mean()) if "attendance" in df else 80.0
    attendance_factor = 1.02 if mean_attendance >= 85 else (1.0 if mean_attendance >= 75 else 0.92)

    predicted_percentage = float(np.clip((weighted_mean * 0.75 + (y_mean + slope) * 0.25) * attendance_factor, 15.0, 99.0))
    predicted_percentage = round(predicted_percentage, 1)

    # 3. Subject-wise Analysis
    subj_map = {s["subject_id"]: s for s in subjects}
    subj_group = df.groupby("subject_id")["percentage"].mean().to_dict()

    weak_subjects = []
    strong_subjects = []

    for sid, s in subj_map.items():
        target = float(s.get("target_marks", 80.0))
        avg = float(subj_group.get(sid, 0.0))
        if sid in subj_group:
            if avg < 65.0 or avg < (target - 10.0):
                weak_subjects.append({
                    "subject_name": s["subject_name"],
                    "average": round(avg, 1),
                    "target": target,
                    "reason": f"Current average ({round(avg, 1)}%) lags target by {round(target - avg, 1)}%."
                })
            elif avg >= 75.0:
                strong_subjects.append({
                    "subject_name": s["subject_name"],
                    "average": round(avg, 1)
                })

    # 4. Risk Matrix
    risk_factors = []
    risk_score = 0
    if mean_attendance < 75.0:
        risk_score += 2
        risk_factors.append(f"Institutional attendance rate ({round(mean_attendance, 1)}%) falls below 75% standard.")
    if trend == "declining":
        risk_score += 2
        risk_factors.append("Assessment percentage trajectory shows a downward linear regression slope.")
    if len(weak_subjects) >= 2:
        risk_score += 2
        risk_factors.append(f"{len(weak_subjects)} enrolled subjects require academic intervention.")

    target_overall = float(user_profile.get("target_marks", 80.0))
    if predicted_percentage < (target_overall - 8.0):
        risk_score += 1
        risk_factors.append(f"Model projection ({predicted_percentage}%) trails your set benchmark ({target_overall}%).")

    risk_level = "High" if risk_score >= 4 else ("Moderate" if risk_score >= 2 else "Low")

    # 5. Suggested Weekly Hours
    diff_count = sum(1 for s in subjects if s.get("difficulty") == "Difficult")
    med_count = sum(1 for s in subjects if s.get("difficulty") == "Medium")
    easy_count = sum(1 for s in subjects if s.get("difficulty") == "Easy")

    weekly_hours = max(12.0, diff_count * 5.0 + med_count * 3.5 + easy_count * 2.0)
    if risk_level == "High":
        weekly_hours *= 1.25
    weekly_hours = round(min(45.0, weekly_hours), 1)

    return {
        "has_sufficient_data": True,
        "record_count": record_count,
        "expected_performance": predicted_percentage,
        "trend": trend,
        "trend_slope": round(slope, 2),
        "weak_subjects": weak_subjects,
        "strong_subjects": strong_subjects,
        "risk_level": risk_level,
        "risk_factors": risk_factors if risk_factors else ["Consistent academic progress aligned with target expectations."],
        "suggested_weekly_hours": weekly_hours,
        "consistency_score": int(np.clip(mean_attendance * 0.5 + 40, 20, 100))
    }
