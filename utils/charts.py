import matplotlib.pyplot as plt
import seaborn as sns
import io

# Set Pastel Style
PASTEL_COLORS = {
    "lavender": "#E8E1F8",
    "blue": "#DCEBFC",
    "pink": "#FCE7F3",
    "green": "#DCFCE7",
    "yellow": "#FEF9C3",
    "purple_accent": "#8B5CF6",
    "blue_accent": "#3B82F6",
    "text_dark": "#1E293B"
}

def create_marks_trend_figure(dates, percentages, target=80.0):
    fig, ax = plt.subplots(figsize=(8, 3.5), facecolor="#FFFFFF")
    ax.set_facecolor("#FAFAFC")

    if len(dates) > 0:
        ax.plot(dates, percentages, marker='o', color="#8B5CF6", linewidth=2.5, markersize=6, label="Score (%)")
        ax.axhline(y=target, color="#F59E0B", linestyle='--', linewidth=1.5, label=f"Target ({target}%)")
        ax.fill_between(range(len(dates)), percentages, color="#DDD6FE", alpha=0.3)

    ax.set_ylabel("Marks (%)", color="#475569", fontsize=10)
    ax.set_ylim(0, 105)
    ax.tick_params(colors="#475569", labelsize=9)
    ax.grid(color="#E2E8F0", linestyle="--", alpha=0.7)
    for spine in ax.spines.values():
        spine.set_color("#CBD5E1")

    ax.legend(frameon=True, facecolor="#FFFFFF", edgecolor="#E2E8F0", fontsize=9)
    plt.tight_layout()
    return fig

def create_subject_bar_figure(subject_names, averages):
    fig, ax = plt.subplots(figsize=(8, 3.5), facecolor="#FFFFFF")
    ax.set_facecolor("#FAFAFC")

    colors = ["#BFDBFE", "#DDD6FE", "#BBF7D0", "#FBCFE8", "#FEF08A"]
    bar_colors = [colors[i % len(colors)] for i in range(len(subject_names))]

    ax.barh(subject_names, averages, color=bar_colors, edgecolor="#CBD5E1", height=0.55)
    ax.set_xlabel("Average Percentage (%)", color="#475569", fontsize=10)
    ax.set_xlim(0, 100)
    ax.tick_params(colors="#475569", labelsize=9)
    ax.grid(axis='x', color="#E2E8F0", linestyle="--", alpha=0.7)
    for spine in ax.spines.values():
        spine.set_color("#CBD5E1")

    plt.tight_layout()
    return fig
