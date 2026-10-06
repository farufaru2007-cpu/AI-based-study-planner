from datetime import datetime

def generate_recommendations(user_profile: dict, subjects: list, tasks: list, performance_records: list, analysis: dict):
    recommendations = []

    if not subjects:
        return recommendations

    # 1. Subject to Study First
    scored_subjects = []
    weak_names = {w["subject_name"] for w in analysis.get("weak_subjects", [])}

    for s in subjects:
        score = 0
        if s["subject_name"] in weak_names:
            score += 35
        if s.get("difficulty") == "Difficult":
            score += 25
        elif s.get("difficulty") == "Medium":
            score += 15

        if s.get("priority") == "High":
            score += 20

        if s.get("exam_date"):
            try:
                days = (datetime.strptime(s["exam_date"], "%Y-%m-%d") - datetime.now()).days
                if 0 <= days <= 7:
                    score += 50
                elif 7 < days <= 14:
                    score += 30
            except Exception:
                pass

        scored_subjects.append((s, score))

    scored_subjects.sort(key=lambda x: x[1], reverse=True)
    top_subject = scored_subjects[0][0]

    recommendations.append({
        "category": "Priority Focus",
        "title": f"Top Priority Study Session: {top_subject['subject_name']}",
        "description": f"Classified as your highest urgency course due to difficulty rating ({top_subject.get('difficulty')}) and academic benchmarks.",
        "urgency": "High"
    })

    # 2. Recommended Study Hours
    weekly_hours = analysis.get("suggested_weekly_hours", 20.0)
    recommendations.append({
        "category": "Time Allocation",
        "title": f"Prescribed Target: {weekly_hours} Hours This Week",
        "description": f"Allocate approximately {round(weekly_hours / 7.0, 1)} hours each day to bridge the gap toward your {user_profile.get('target_marks', 80)}% objective.",
        "urgency": "Medium" if analysis.get("risk_level") != "High" else "High"
    })

    # 3. Weak Topics & Revision
    if analysis.get("weak_subjects"):
        names_str = ", ".join(w["subject_name"] for w in analysis["weak_subjects"])
        recommendations.append({
            "category": "Targeted Revision",
            "title": "Remedial Problem Drill for Weak Subjects",
            "description": f"Prioritize active problem solving in {names_str}. Shift from passive slides to previous test question revisions.",
            "urgency": "High"
        })

    # 4. Approaching Exams
    for s in subjects:
        if s.get("exam_date"):
            try:
                days = (datetime.strptime(s["exam_date"], "%Y-%m-%d") - datetime.now()).days
                if 0 <= days <= 14:
                    recommendations.append({
                        "category": "Exam Readiness",
                        "title": f"Milestone Alert: {s['subject_name']} Exam in {days} Days",
                        "description": f"Conclude all syllabus chapters within {max(1, days - 3)} days, preserving the last 72 hours for full-length timed mock tests.",
                        "urgency": "High" if days <= 7 else "Medium"
                    })
                    break
            except Exception:
                pass

    return recommendations
