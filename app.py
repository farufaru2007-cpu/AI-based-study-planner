import streamlit as st
import pandas as pd
import numpy as np
import os
from database.db import init_db
from utils.auth import register_user, login_user, get_user_by_id
from services.data_service import (
    get_user_subjects, add_subject, delete_subject,
    get_user_tasks, add_study_task, toggle_task_status, delete_task,
    get_user_performance, add_performance_record, delete_performance_record,
    update_user_profile
)
from ai.analyzer import analyze_performance
from ai.recommender import generate_recommendations
from utils.charts import create_marks_trend_figure, create_subject_bar_figure

# Initialize SQLite database
init_db()

# Streamlit Page Configuration
st.set_page_config(
    page_title="AI-Based Study Planner and Performance Analyzer",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Pastel CSS
st.markdown("""
<style>
    .reportview-container {
        background: #FAFAFC;
    }
    .metric-card {
        background: #FFFFFF;
        border-radius: 12px;
        padding: 16px;
        border: 1px solid #E2E8F0;
        box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .pastel-purple { background-color: #F3E8FF; border-color: #DDD6FE; color: #581C87; }
    .pastel-blue { background-color: #EFF6FF; border-color: #BFDBFE; color: #1E3A8A; }
    .pastel-pink { background-color: #FDF2F8; border-color: #FBCFE8; color: #831843; }
    .pastel-green { background-color: #F0FDF4; border-color: #BBF7D0; color: #064E3B; }
    .pastel-yellow { background-color: #FEFCE8; border-color: #FEF08A; color: #713F12; }
</style>
""", unsafe_allow_html=True)

# Session State Initialization
if "user" not in st.session_state:
    st.session_state["user"] = None

def main():
    if not st.session_state["user"]:
        render_auth_page()
    else:
        render_app_interface()

def render_auth_page():
    st.title("🎓 AI-Based Study Planner & Performance Analyzer")
    st.caption("Personalized study planning and statistical performance modeling for students.")

    auth_tab1, auth_tab2 = st.tabs(["Sign In", "Create New Account"])

    with auth_tab1:
        st.subheader("Sign In to Your Academic Account")
        with st.form("login_form"):
            email = st.text_input("Email Address", placeholder="student@university.edu")
            password = st.text_input("Password", type="password")
            submitted = st.form_submit_button("Log In")

            if submitted:
                success, res = login_user(email, password)
                if success:
                    st.session_state["user"] = res
                    st.rerun()
                else:
                    st.error(res)

    with auth_tab2:
        st.subheader("Register New Student Profile")
        with st.form("register_form"):
            name = st.text_input("Full Name", placeholder="Alex Turner")
            email_reg = st.text_input("Email Address", placeholder="alex@university.edu")
            password_reg = st.text_input("Password (min 6 chars)", type="password")
            confirm_pwd = st.text_input("Confirm Password", type="password")
            submitted_reg = st.form_submit_button("Register & Create Account")

            if submitted_reg:
                if password_reg != confirm_pwd:
                    st.error("Passwords do not match.")
                else:
                    success, res = register_user(name, email_reg, password_reg)
                    if success:
                        st.session_state["user"] = get_user_by_id(res)
                        st.success("Account successfully created!")
                        st.rerun()
                    else:
                        st.error(res)

def render_app_interface():
    user = st.session_state["user"]
    uid = user["user_id"]

    # Load fresh data for this logged-in user
    subjects = get_user_subjects(uid)
    tasks = get_user_tasks(uid)
    performance = get_user_performance(uid)
    analysis = analyze_performance(user, subjects, tasks, performance)

    # Sidebar Navigation
    st.sidebar.markdown(f"### 🎓 Study Planner AI")
    st.sidebar.markdown(f"**{user['name']}**  \n`{user['email']}`")

    menu_option = st.sidebar.radio(
        "Main Navigation",
        [
            "1. Dashboard",
            "2. My Profile",
            "3. Subjects",
            "4. Study Planner",
            "5. Performance Tracker",
            "6. AI Performance Analyzer",
            "7. AI Study Recommendations",
            "8. Progress Reports",
            "9. Settings",
            "10. Logout"
        ]
    )

    if menu_option == "10. Logout":
        st.session_state["user"] = None
        st.rerun()

    # 1. DASHBOARD
    elif menu_option == "1. Dashboard":
        st.title(f"Welcome back, {user['name']}! 👋")
        st.caption("Here is your current academic performance trajectory and study schedule.")

        if not subjects and not performance and not tasks:
            st.info("No study data available yet. Add your subjects and performance data to get started.")

        # Pastel KPI Metrics
        c1, c2, c3, c4 = st.columns(4)
        with c1:
            st.metric("Total Subjects", len(subjects))
        with c2:
            completed_tasks = [t for t in tasks if t["status"] == "completed"]
            st.metric("Completed Tasks", f"{len(completed_tasks)} / {len(tasks)}")
        with c3:
            avg_marks = np.mean([p["marks"] / p["maximum_marks"] * 100 for p in performance]) if performance else 0.0
            st.metric("Average Marks", f"{round(avg_marks, 1)}%", f"Target {user.get('target_marks', 80)}%")
        with c4:
            st.metric("AI Risk Status", analysis.get("risk_level", "Low"))

        # Charts Section
        st.markdown("---")
        ch1, ch2 = st.columns(2)
        with ch1:
            st.subheader("Marks Progression Trend")
            if performance:
                dates = [p["exam_date"] for p in performance]
                pcts = [(p["marks"] / p["maximum_marks"] * 100) for p in performance]
                fig = create_marks_trend_figure(dates, pcts, user.get("target_marks", 80))
                st.pyplot(fig)
            else:
                st.write("No exam marks recorded yet.")

        with ch2:
            st.subheader("Subject-Wise Performance")
            if subjects and performance:
                df_perf = pd.DataFrame(performance)
                df_perf["pct"] = df_perf["marks"] / df_perf["maximum_marks"] * 100
                avgs = df_perf.groupby("subject_id")["pct"].mean()
                s_names = [s["subject_name"] for s in subjects if s["subject_id"] in avgs.index]
                s_vals = [avgs[s["subject_id"]] for s in subjects if s["subject_id"] in avgs.index]
                if s_names:
                    fig2 = create_subject_bar_figure(s_names, s_vals)
                    st.pyplot(fig2)
                else:
                    st.write("No performance recorded for existing subjects.")
            else:
                st.write("Add subjects and marks to view breakdown.")

    # 2. MY PROFILE
    elif menu_option == "2. My Profile":
        st.title("My Student Profile")
        with st.form("profile_form"):
            c1, c2 = st.columns(2)
            with c1:
                name = st.text_input("Full Name", value=user.get("name", ""))
                course = st.text_input("Degree / Course", value=user.get("course", ""))
                branch = st.text_input("Branch / Major", value=user.get("branch", ""))
                year = st.selectbox("Year", ["1st Year", "2nd Year", "3rd Year", "4th Year", "PG"], index=0)
            with c2:
                semester = st.text_input("Semester", value=user.get("semester", ""))
                college = st.text_input("College / University", value=user.get("college", ""))
                target_marks = st.number_input("Target Marks (%)", min_value=40.0, max_value=100.0, value=float(user.get("target_marks", 80.0)))
                daily_target = st.number_input("Daily Target Study Hours", min_value=1.0, max_value=14.0, value=float(user.get("daily_target_hours", 4.0)))

            goals = st.text_area("Academic Goals", value=user.get("academic_goals", ""))
            submitted = st.form_submit_button("Save Profile")

            if submitted:
                update_user_profile(uid, {
                    "name": name, "course": course, "branch": branch, "year": year,
                    "semester": semester, "college": college, "target_marks": target_marks,
                    "daily_target_hours": daily_target, "academic_goals": goals
                })
                st.session_state["user"] = get_user_by_id(uid)
                st.success("Profile saved!")
                st.rerun()

    # 3. SUBJECTS
    elif menu_option == "3. Subjects":
        st.title("Subject Management")
        with st.expun_form := st.expander("+ Add New Subject", expanded=len(subjects) == 0):
            with st.form("new_subject_form"):
                sub_name = st.text_input("Subject Name *")
                c1, c2, c3 = st.columns(3)
                with c1:
                    diff = st.selectbox("Difficulty", ["Easy", "Medium", "Difficult"], index=1)
                with c2:
                    pri = st.selectbox("Priority", ["Low", "Medium", "High"], index=1)
                with c3:
                    tgt = st.number_input("Target Marks (%)", 1, 100, 80)
                exam_date = st.date_input("Scheduled Exam Date (optional)")
                submitted = st.form_submit_button("Register Subject")

                if submitted and sub_name:
                    add_subject(uid, sub_name, diff, tgt, pri, str(exam_date))
                    st.success(f"Subject '{sub_name}' added!")
                    st.rerun()

        st.subheader("Registered Subjects")
        for s in subjects:
            with st.container():
                cols = st.columns([4, 2, 2, 2])
                cols[0].markdown(f"**{s['subject_name']}** ({s['difficulty']})")
                cols[1].write(f"Target: {s['target_marks']}%")
                cols[2].write(f"Exam: {s.get('exam_date', 'N/A')}")
                if cols[3].button("Delete", key=f"del_sub_{s['subject_id']}"):
                    delete_subject(uid, s["subject_id"])
                    st.rerun()

    # 4. STUDY PLANNER
    elif menu_option == "4. Study Planner":
        st.title("Personalized Study Planner")
        with st.expander("+ Plan Study Task"):
            if not subjects:
                st.warning("Please register a subject first.")
            else:
                with st.form("new_task_form"):
                    sub_choice = st.selectbox("Subject", [s["subject_name"] for s in subjects])
                    sub_id = next(s["subject_id"] for s in subjects if s["subject_name"] == sub_choice)
                    topic = st.text_input("Topic / Chapter *")
                    c1, c2, c3 = st.columns(3)
                    with c1:
                        task_date = st.date_input("Date")
                    with c2:
                        s_time = st.text_input("Start Time (HH:MM)", "09:00")
                    with c3:
                        e_time = st.text_input("End Time (HH:MM)", "11:00")
                    t_pri = st.selectbox("Priority", ["Low", "Medium", "High"], index=1)
                    submitted = st.form_submit_button("Save Task")

                    if submitted and topic:
                        add_study_task(uid, sub_id, topic, str(task_date), s_time, e_time, t_pri, "Medium")
                        st.success("Study task scheduled!")
                        st.rerun()

        st.subheader("Your Study Schedule")
        for t in tasks:
            col1, col2, col3 = st.columns([6, 2, 2])
            is_done = t["status"] == "completed"
            col1.write(f"{'✅' if is_done else '⏳'} **{t['topic']}** ({t['date']} {t['start_time']}-{t['end_time']})")
            if col2.button("Toggle Status", key=f"t_tog_{t['task_id']}"):
                toggle_task_status(uid, t["task_id"])
                st.rerun()
            if col3.button("Delete", key=f"t_del_{t['task_id']}"):
                delete_task(uid, t["task_id"])
                st.rerun()

    # 5. PERFORMANCE TRACKER
    elif menu_option == "5. Performance Tracker":
        st.title("Performance Tracker")
        with st.expander("+ Log Assessment Record"):
            if not subjects:
                st.warning("Add subjects first.")
            else:
                with st.form("new_perf_form"):
                    sub_choice = st.selectbox("Subject", [s["subject_name"] for s in subjects])
                    sub_id = next(s["subject_id"] for s in subjects if s["subject_name"] == sub_choice)
                    exam_name = st.text_input("Test / Exam Name *", "Midterm Assessment")
                    c1, c2 = st.columns(2)
                    with c1:
                        marks = st.number_input("Marks Obtained", min_value=0.0, value=75.0)
                        attendance = st.number_input("Attendance (%)", 0.0, 100.0, 85.0)
                    with c2:
                        max_marks = st.number_input("Maximum Marks", min_value=1.0, value=100.0)
                        exam_date = st.date_input("Date Evaluated")
                    submitted = st.form_submit_button("Save Evaluation")

                    if submitted and exam_name:
                        add_performance_record(uid, sub_id, exam_name, marks, max_marks, attendance, 0.0, 0.0, str(exam_date))
                        st.success("Exam record saved!")
                        st.rerun()

        st.subheader("Historical Assessment Records")
        if performance:
            st.dataframe(pd.DataFrame(performance)[["exam_name", "marks", "maximum_marks", "attendance", "exam_date"]])
        else:
            st.write("No evaluated assessments logged yet.")

    # 6. AI PERFORMANCE ANALYZER
    elif menu_option == "6. AI Performance Analyzer":
        st.title("AI Machine Learning Performance Analyzer")
        st.caption("Statistical regression models trained on your personal historical data.")

        st.info("⚠️ AI/ML Estimate Notice: Predictions are statistical approximations based on recorded trends, not guaranteed scores.")

        if not analysis.get("has_sufficient_data"):
            st.warning("More academic records required: at least 2 evaluated examination scores are needed to train the AI model.")
        else:
            c1, c2, c3 = st.columns(3)
            with c1:
                st.metric("Expected Performance", f"{analysis['expected_performance']}%")
            with c2:
                st.metric("Trajectory Trend", analysis["trend"].capitalize(), f"{analysis['trend_slope']} pts/test")
            with c3:
                st.metric("Risk Classification", analysis["risk_level"])

            st.subheader("Identified Risk Factors")
            for rf in analysis.get("risk_factors", []):
                st.write(f"• {rf}")

            st.subheader("Prescribed Study Dedication")
            st.write(f"Model suggests dedicating **{analysis.get('suggested_weekly_hours', 20.0)} hours** per week across high-yield subjects.")

    # 7. RECOMMENDATIONS
    elif menu_option == "7. AI Study Recommendations":
        st.title("AI Study Recommendations")
        recs = generate_recommendations(user, subjects, tasks, performance, analysis)
        if not recs:
            st.write("Register subjects and performance data to receive personalized study recommendations.")
        for r in recs:
            with st.container():
                st.markdown(f"#### 💡 {r['title']} ({r['urgency']} Urgency)")
                st.write(r["description"])
                st.markdown("---")

    # 8. REPORTS
    elif menu_option == "8. Progress Reports":
        st.title("Comprehensive Academic Progress Report")
        st.write(f"**Student:** {user['name']} | **College:** {user.get('college', 'N/A')}")
        st.write(f"**Average Marks:** {round(np.mean([p['marks'] / p['maximum_marks'] * 100 for p in performance]), 1) if performance else 0.0}%")
        st.write(f"**AI Expected Projection:** {analysis.get('expected_performance', 'N/A')}%")

        if performance:
            st.download_button(
                "Export Performance CSV",
                pd.DataFrame(performance).to_csv(index=False),
                "academic_report.csv",
                "text/csv"
            )

    # 9. SETTINGS
    elif menu_option == "9. Settings":
        st.title("Application Settings & Information")
        st.write(f"**Account ID:** `{uid}`")
        st.write(f"**Email:** {user['email']}")
        st.write("Data is saved persistently in the local SQLite database for this specific user account.")

if __name__ == "__main__":
    main()
