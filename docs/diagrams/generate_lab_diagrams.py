
import os
os.environ['MPLCONFIGDIR'] = '/tmp/mplconfig'
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

OUT_DIR = "/Users/mayankheda/Desktop/asd mpr/fixmyhostel/docs/diagrams"
os.makedirs(OUT_DIR, exist_ok=True)

# Common styling constants matching Lab Manual Figure 3.1 & Figure 5.1
FONT_FAMILY = 'DejaVu Sans'

# -------------------------------------------------------------------------
# Figure 3.1: System and delivery architecture (Exactly matching Lab Manual pg 122)
# -------------------------------------------------------------------------
def make_lab_manual_fig_3_1():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')

    # Top pipeline: Developer -> GitHub -> Jenkins
    # Developer box
    ax.add_patch(patches.FancyBboxPatch((0.6, 5.7), 1.5, 0.65, boxstyle="round,pad=0.08", facecolor='white', edgecolor='#3B82F6', linewidth=1.2))
    ax.text(1.35, 6.12, "Developer", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#1E293B', fontfamily=FONT_FAMILY)
    ax.text(1.35, 5.9, "branch per backlog issue", ha='center', va='center', fontsize=6.5, color='#64748B', fontfamily=FONT_FAMILY)

    # GitHub box
    ax.add_patch(patches.FancyBboxPatch((3.0, 5.7), 1.7, 0.65, boxstyle="round,pad=0.08", facecolor='white', edgecolor='#3B82F6', linewidth=1.2))
    ax.text(3.85, 6.12, "GitHub", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#1E293B', fontfamily=FONT_FAMILY)
    ax.text(3.85, 5.9, "<username>/fixmyhostel · PRs", ha='center', va='center', fontsize=6.2, color='#64748B', fontfamily=FONT_FAMILY)

    # Jenkins box
    ax.add_patch(patches.FancyBboxPatch((5.6, 5.7), 1.8, 0.65, boxstyle="round,pad=0.08", facecolor='white', edgecolor='#3B82F6', linewidth=1.2))
    ax.text(6.5, 6.12, "Jenkins :8080", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#1E293B', fontfamily=FONT_FAMILY)
    ax.text(6.5, 5.9, "multibranch CI/CD (Jenkinsfile)", ha='center', va='center', fontsize=6.2, color='#64748B', fontfamily=FONT_FAMILY)

    # Connectors for top pipeline
    ak = dict(arrowstyle="->,head_width=0.2,head_length=0.3", lw=1.0, color="#1E293B")
    ax.annotate("", xy=(3.0, 6.02), xytext=(2.1, 6.02), arrowprops=ak)
    ax.text(2.55, 6.15, "push / PR", ha='center', fontsize=6.5, color='#475569')

    ax.annotate("", xy=(5.6, 6.02), xytext=(4.7, 6.02), arrowprops=ak)
    ax.text(5.15, 6.15, "poll 1 min", ha='center', fontsize=6.5, color='#475569')

    # Jenkins to Compose stack deployment arrow
    ax.annotate("", xy=(6.5, 4.8), xytext=(6.5, 5.7),
                arrowprops=dict(arrowstyle="->,head_width=0.25,head_length=0.35", lw=1.2, color="#059669"))
    ax.text(6.55, 5.25, "main: docker compose up -d + smoke test", ha='left', va='center', fontsize=6.5, color='#047857', fontweight='bold')

    # Main Compose Border (dashed round rectangle)
    ax.add_patch(patches.FancyBboxPatch((2.2, 1.2), 6.6, 3.6), boxstyle="round,pad=0.15", facecolor='#F8FAFC', edgecolor='#94A3B8', linestyle='--', linewidth=1.2)
    ax.text(2.35, 4.62, "docker compose · project \"fixmyhostel\" · one bridge network (fmh-network)", fontsize=7.0, color='#64748B', fontfamily=FONT_FAMILY)

    # Browser box (left of stack)
    ax.add_patch(patches.FancyBboxPatch((0.6, 3.8), 1.3, 0.75, boxstyle="round,pad=0.08", facecolor='white', edgecolor='#3B82F6', linewidth=1.2))
    ax.text(1.25, 4.25, "Browser", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#1E293B')
    ax.text(1.25, 3.98, "student · staff · warden", ha='center', va='center', fontsize=6.2, color='#64748B')

    # Inside Stack: frontend box
    ax.add_patch(patches.FancyBboxPatch((2.4, 3.8), 1.8, 0.75, boxstyle="round,pad=0.08", facecolor='white', edgecolor='#EF4444', linewidth=1.2))
    ax.text(3.3, 4.3, "frontend :3000", ha='center', va='center', fontsize=8.0, fontweight='bold', color='#1E293B')
    ax.text(3.3, 4.08, "React build served by Nginx", ha='center', va='center', fontsize=6.0, color='#64748B')
    ax.text(3.3, 3.9, "/api proxied to backend", ha='center', va='center', fontsize=6.0, color='#64748B')

    # Browser -> Frontend arrow
    ax.annotate("", xy=(2.4, 4.18), xytext=(1.9, 4.18), arrowprops=ak)

    # Inside Stack: backend box
    ax.add_patch(patches.FancyBboxPatch((4.7, 3.8), 1.8, 0.75, boxstyle="round,pad=0.08", facecolor='white', edgecolor='#EF4444', linewidth=1.2))
    ax.text(5.6, 4.3, "backend :5001", ha='center', va='center', fontsize=8.0, fontweight='bold', color='#1E293B')
    ax.text(5.6, 4.08, "Node.js 20 · Express · JWT", ha='center', va='center', fontsize=6.0, color='#64748B')
    ax.text(5.6, 3.9, "/api/health · /metrics", ha='center', va='center', fontsize=6.0, color='#64748B')

    # Frontend -> Backend arrow
    ax.annotate("", xy=(4.7, 4.18), xytext=(4.2, 4.18), arrowprops=ak)
    ax.text(4.45, 4.3, "/api", ha='center', fontsize=6.5, color='#475569')

    # Inside Stack: MySQL box
    ax.add_patch(patches.FancyBboxPatch((7.0, 4.0), 1.65, 0.65, boxstyle="round,pad=0.08", facecolor='white', edgecolor='#0284C7', linewidth=1.2))
    ax.text(7.82, 4.4, "MySQL 8 :3307", ha='center', va='center', fontsize=8.0, fontweight='bold', color='#1E293B')
    ax.text(7.82, 4.18, "users · complaints (named volume)", ha='center', va='center', fontsize=5.8, color='#64748B')

    # Inside Stack: Redis box
    ax.add_patch(patches.FancyBboxPatch((7.0, 3.15), 1.65, 0.65, boxstyle="round,pad=0.08", facecolor='white', edgecolor='#0284C7', linewidth=1.2))
    ax.text(7.82, 3.55, "Redis 7 :6379", ha='center', va='center', fontsize=8.0, fontweight='bold', color='#1E293B')
    ax.text(7.82, 3.32, "complaint count cache · token seq", ha='center', va='center', fontsize=5.8, color='#64748B')

    # Backend -> MySQL & Redis arrows
    ax.annotate("", xy=(7.0, 4.32), xytext=(6.5, 4.32), arrowprops=ak)
    ax.annotate("", xy=(7.0, 3.48), xytext=(6.5, 3.9), arrowprops=ak)

    # Observability Row: Grafana, Prometheus, Nagios
    # Grafana box
    ax.add_patch(patches.FancyBboxPatch((2.4, 2.15), 1.8, 0.65, boxstyle="round,pad=0.08", facecolor='#F0FDF4', edgecolor='#22C55E', linewidth=1.2))
    ax.text(3.3, 2.55, "Grafana :3001", ha='center', va='center', fontsize=8.0, fontweight='bold', color='#1E293B')
    ax.text(3.3, 2.32, "Live Operations dashboard", ha='center', va='center', fontsize=6.0, color='#64748B')

    # Prometheus box
    ax.add_patch(patches.FancyBboxPatch((4.7, 2.15), 1.8, 0.65, boxstyle="round,pad=0.08", facecolor='#F0FDF4', edgecolor='#22C55E', linewidth=1.2))
    ax.text(5.6, 2.55, "Prometheus :9090", ha='center', va='center', fontsize=8.0, fontweight='bold', color='#1E293B')
    ax.text(5.6, 2.32, "time series · 4 alert rules", ha='center', va='center', fontsize=6.0, color='#64748B')

    # Nagios box
    ax.add_patch(patches.FancyBboxPatch((7.0, 2.15), 1.65, 0.65, boxstyle="round,pad=0.08", facecolor='#F0FDF4', edgecolor='#22C55E', linewidth=1.2))
    ax.text(7.82, 2.55, "Nagios :8080", ha='center', va='center', fontsize=8.0, fontweight='bold', color='#1E293B')
    ax.text(7.82, 2.32, "HTTP / TCP checks per container", ha='center', va='center', fontsize=5.8, color='#64748B')

    # Observability connections
    # Backend -> Prometheus
    ax.annotate("", xy=(5.6, 2.8), xytext=(5.6, 3.8), arrowprops=ak)
    ax.text(5.65, 3.3, "scrape /metrics every 15 s", ha='left', va='center', fontsize=6.2, color='#475569')

    # Prometheus -> Grafana
    ax.annotate("", xy=(4.2, 2.48), xytext=(4.7, 2.48), arrowprops=ak)
    ax.text(4.45, 2.6, "PromQL", ha='center', fontsize=6.5, color='#475569')

    # Nagios checks to services
    ax.annotate("", xy=(7.82, 3.15), xytext=(7.82, 2.8), arrowprops=dict(arrowstyle="->", lw=0.9, ls="--", color="#64748B"))
    ax.text(7.88, 2.98, "HTTP/TCP checks", ha='left', fontsize=5.5, color='#64748B')

    # Host machine at bottom
    ax.add_patch(patches.FancyBboxPatch((7.0, 0.35), 1.65, 0.6, boxstyle="round,pad=0.08", facecolor='white', edgecolor='#64748B', linewidth=1.0))
    ax.text(7.82, 0.72, "macOS host", ha='center', va='center', fontsize=8.0, fontweight='bold', color='#1E293B')
    ax.text(7.82, 0.52, "NRPE agent :5666 (Exp 7)", ha='center', va='center', fontsize=6.0, color='#64748B')

    # Nagios -> Host NRPE
    ax.annotate("", xy=(7.82, 0.95), xytext=(7.82, 2.15), arrowprops=dict(arrowstyle="->", lw=0.9, ls="--", color="#64748B"))
    ax.text(7.88, 1.15, "check_nrpe", ha='left', fontsize=5.8, color='#64748B')

    # Caption
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "fig_3_1_architecture.png"), dpi=300, bbox_inches='tight')
    plt.close()

# -------------------------------------------------------------------------
# Figure 3.2: Entity-relationship diagram (Exactly matching Lab Manual pg 123)
# -------------------------------------------------------------------------
def make_lab_manual_fig_3_2():
    fig, ax = plt.subplots(figsize=(10, 5.8), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    # users table (left)
    ax.add_patch(patches.FancyBboxPatch((0.6, 2.2), 2.2, 3.0, boxstyle="round,pad=0.08", facecolor='white', edgecolor='#3B82F6', linewidth=1.5))
    ax.add_patch(patches.FancyBboxPatch((0.6, 4.75), 2.2, 0.45, boxstyle="round,pad=0.08", facecolor='#3B82F6', edgecolor='#3B82F6', linewidth=1.5))
    ax.text(1.7, 4.97, "users", ha='center', va='center', color='white', fontweight='bold', fontsize=9.0)
    u_fields = [
        "id INT PK",
        "name VARCHAR",
        "email UNIQUE",
        "password_hash VARCHAR",
        "role ENUM(student,",
        "  staff, warden)",
        "room_number VARCHAR"
    ]
    for idx, f in enumerate(u_fields):
        ax.text(0.75, 4.45 - idx*0.32, f, fontsize=7.2, color='#1E293B', fontfamily='monospace')

    # complaints table (center)
    ax.add_patch(patches.FancyBboxPatch((3.8, 1.0), 2.7, 4.2), boxstyle="round,pad=0.08", facecolor='white', edgecolor='#3B82F6', linewidth=1.5)
    ax.add_patch(patches.FancyBboxPatch((3.8, 4.75), 2.7, 0.45, boxstyle="round,pad=0.08", facecolor='#3B82F6', edgecolor='#3B82F6', linewidth=1.5))
    ax.text(5.15, 4.97, "complaints", ha='center', va='center', color='white', fontweight='bold', fontsize=9.0)
    c_fields = [
        "id INT PK",
        "student_id FK -> users",
        "assigned_to FK -> users",
        "token_number INT (daily)",
        "status ENUM(RAISED,",
        "  ACCEPTED, IN_PROGRESS,",
        "  RESOLVED, CANCELLED)",
        "category ENUM",
        "severity ENUM",
        "title VARCHAR",
        "raised_at DATETIME",
        "resolved_at DATETIME",
        "indexes: status, raised_at"
    ]
    for idx, f in enumerate(c_fields):
        ax.text(3.95, 4.48 - idx*0.27, f, fontsize=6.8, color='#1E293B', fontfamily='monospace')

    # feedback table (right)
    ax.add_patch(patches.FancyBboxPatch((7.5, 2.5), 2.0, 2.7), boxstyle="round,pad=0.08", facecolor='white', edgecolor='#3B82F6', linewidth=1.5)
    ax.add_patch(patches.FancyBboxPatch((7.5, 4.75), 2.0, 0.45, boxstyle="round,pad=0.08", facecolor='#3B82F6', edgecolor='#3B82F6', linewidth=1.5))
    ax.text(8.5, 4.97, "feedback", ha='center', va='center', color='white', fontweight='bold', fontsize=9.0)
    fb_fields = [
        "id INT PK",
        "complaint_id FK (UNIQUE)",
        "student_id FK -> users",
        "rating TINYINT",
        "comment TEXT",
        "created_at DATETIME"
    ]
    for idx, f in enumerate(fb_fields):
        ax.text(7.65, 4.45 - idx*0.32, f, fontsize=7.2, color='#1E293B', fontfamily='monospace')

    # ER connectors with 1, N labels
    # users -> complaints
    ax.plot([2.8, 3.8], [4.1, 4.1], color='#3B82F6', lw=1.2)
    ax.text(2.95, 4.22, "1", fontsize=8.0, fontweight='bold', color='#1E293B')
    ax.text(3.6, 4.22, "N", fontsize=8.0, fontweight='bold', color='#1E293B')

    # complaints -> feedback
    ax.plot([6.5, 7.5], [4.1, 4.1], color='#3B82F6', lw=1.2)
    ax.text(6.65, 4.22, "1", fontsize=8.0, fontweight='bold', color='#1E293B')
    ax.text(7.35, 4.22, "1", fontsize=8.0, fontweight='bold', color='#1E293B')

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "fig_3_2_er_diagram.png"), dpi=300, bbox_inches='tight')
    plt.close()

# -------------------------------------------------------------------------
# Figure 3.3: Order / Ticket state machine (Exactly matching Lab Manual pg 124)
# -------------------------------------------------------------------------
def make_lab_manual_fig_3_3():
    fig, ax = plt.subplots(figsize=(10, 3.6), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 3.6)
    ax.axis('off')

    # Initial bullet / dot
    circle_init = patches.Circle((0.5, 2.5), 0.08, facecolor='#1E293B', edgecolor='black')
    ax.add_patch(circle_init)
    ax.text(0.5, 2.15, "student\nfiles ticket", ha='center', va='top', fontsize=6.8, color='#475569')

    # Oval / Pill States
    # State boxes with rounded pill geometry
    pill_kw = dict(boxstyle="round,pad=0.15", facecolor='white', edgecolor='#3B82F6', linewidth=1.4)
    
    # RAISED
    ax.add_patch(patches.FancyBboxPatch((1.4, 2.2), 1.2, 0.6, **pill_kw))
    ax.text(2.0, 2.5, "RAISED", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#1E293B')

    # ACCEPTED
    ax.add_patch(patches.FancyBboxPatch((3.6, 2.2), 1.3, 0.6, **pill_kw))
    ax.text(4.25, 2.5, "ACCEPTED", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#1E293B')

    # IN_PROGRESS
    ax.add_patch(patches.FancyBboxPatch((5.9, 2.2), 1.4, 0.6, boxstyle="round,pad=0.15", facecolor='white', edgecolor='#22C55E', linewidth=1.4))
    ax.text(6.6, 2.5, "IN_PROGRESS", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#1E293B')

    # RESOLVED
    ax.add_patch(patches.FancyBboxPatch((8.2, 2.2), 1.3, 0.6, boxstyle="round,pad=0.15", facecolor='white', edgecolor='#1E293B', linewidth=1.4))
    ax.text(8.85, 2.5, "RESOLVED", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#1E293B')

    # CANCELLED (bottom)
    ax.add_patch(patches.FancyBboxPatch((3.6, 0.6), 1.3, 0.55, boxstyle="round,pad=0.15", facecolor='white', edgecolor='#EF4444', linewidth=1.4))
    ax.text(4.25, 0.87, "CANCELLED", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#1E293B')

    # Arrows between states
    ak = dict(arrowstyle="->,head_width=0.22,head_length=0.3", lw=1.1, color="#1E293B")
    
    # Init -> RAISED
    ax.annotate("", xy=(1.4, 2.5), xytext=(0.6, 2.5), arrowprops=ak)

    # RAISED -> ACCEPTED
    ax.annotate("", xy=(3.6, 2.5), xytext=(2.6, 2.5), arrowprops=ak)
    ax.text(3.1, 2.7, "staff: accept", ha='center', fontsize=6.8, color='#475569')

    # ACCEPTED -> IN_PROGRESS
    ax.annotate("", xy=(5.9, 2.5), xytext=(4.9, 2.5), arrowprops=ak)
    ax.text(5.4, 2.7, "staff: start", ha='center', fontsize=6.8, color='#475569')

    # IN_PROGRESS -> RESOLVED
    ax.annotate("", xy=(8.2, 2.5), xytext=(7.3, 2.5), arrowprops=ak)
    ax.text(7.75, 2.7, "staff: resolve", ha='center', fontsize=6.8, color='#475569')

    # RAISED -> CANCELLED
    ax.annotate("", xy=(3.8, 1.15), xytext=(2.3, 2.2),
                arrowprops=dict(arrowstyle="->,head_width=0.22,head_length=0.3", lw=1.1, color="#1E293B"))
    ax.text(2.6, 1.5, "student cancel", ha='center', fontsize=6.8, color='#475569')

    # Bottom notes matching Lab Manual Figure 3.3
    ax.text(6.0, 0.95, "Any other transition is rejected by the API with 400 Bad Request.", fontsize=6.5, color='#64748B')
    ax.text(6.0, 0.75, "Each move records accepted_at / started_at / resolved_at timestamps.", fontsize=6.5, color='#64748B')
    ax.text(6.0, 0.55, "RESOLVED feeds the SLA turnaround metrics on the Warden dashboard.", fontsize=6.5, color='#64748B')

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "fig_3_3_statemachine.png"), dpi=300, bbox_inches='tight')
    plt.close()

# -------------------------------------------------------------------------
# Figure 5.1: Delivery pipeline from push to monitoring (Exactly matching Lab Manual pg 131)
# -------------------------------------------------------------------------
def make_lab_manual_fig_5_1():
    fig, ax = plt.subplots(figsize=(10.5, 4.0), dpi=300)
    ax.set_xlim(0, 10.5)
    ax.set_ylim(0, 4.0)
    ax.axis('off')

    # Header label top
    ax.text(0.5, 3.65, "EVERY BRANCH AND PULL REQUEST", fontsize=7.0, fontweight='bold', color='#1E293B')

    # Row 1 boxes (7 stages)
    # git push, Branch scan, Checkout, Install, Lint, Test, Build images
    row1 = [
        ("git push\nfeature/FMH-n", 0.5, 1.1),
        ("Branch scan\nJenkins polls 1 min", 1.8, 1.2),
        ("Checkout\nissue key + build label", 3.2, 1.3),
        ("Install\nnpm ci x2 in parallel", 4.7, 1.2),
        ("Lint\neslint (backend+ui)", 6.1, 1.1),
        ("Test\nJest + Vitest + JUnit", 7.4, 1.2),
        ("Build images\ntag 1.0.n / 0.0.n-branch", 8.8, 1.4)
    ]

    box_kw = dict(boxstyle="round,pad=0.1", facecolor='white', edgecolor='#3B82F6', linewidth=1.1)
    ak = dict(arrowstyle="->,head_width=0.2,head_length=0.25", lw=1.0, color="#1E293B")

    for i, (text, x, w) in enumerate(row1):
        ax.add_patch(patches.FancyBboxPatch((x, 2.75), w, 0.65, **box_kw))
        ax.text(x + w/2, 3.07, text, ha='center', va='center', fontsize=6.5, color='#1E293B', fontfamily=FONT_FAMILY)
        if i < len(row1) - 1:
            next_x = row1[i+1][1]
            ax.annotate("", xy=(next_x, 3.07), xytext=(x + w, 3.07), arrowprops=ak)

    # Header label row 2
    ax.text(0.5, 2.15, "MAIN ONLY (after a pull request is merged)", fontsize=7.0, fontweight='bold', color='#1E293B')

    # Row 2 boxes (4 stages)
    # Deploy, Smoke test, Record last good, Monitor
    row2 = [
        ("Deploy\ndocker compose up -d", 2.2, 1.3),
        ("Smoke test\n/api/health == new version", 3.8, 1.4),
        ("Record last good\n~/.fmh-last-good-version", 5.5, 1.4),
        ("Monitor\nPrometheus · Grafana · Nagios", 7.2, 1.6)
    ]

    for i, (text, x, w) in enumerate(row2):
        ax.add_patch(patches.FancyBboxPatch((x, 1.25), w, 0.65, **box_kw))
        ax.text(x + w/2, 1.57, text, ha='center', va='center', fontsize=6.5, color='#1E293B', fontfamily=FONT_FAMILY)
        if i < len(row2) - 1:
            next_x = row2[i+1][1]
            ax.annotate("", xy=(next_x, 1.57), xytext=(x + w, 1.57), arrowprops=ak)

    # Rollback sub-box below Smoke test
    ax.annotate("", xy=(4.5, 0.7), xytext=(4.5, 1.25), arrowprops=ak)
    ax.text(4.5, 0.95, "on failure", ha='center', va='center', fontsize=5.8, color='#DC2626')

    ax.add_patch(patches.FancyBboxPatch((3.8, 0.15), 1.4, 0.5, boxstyle="round,pad=0.08", facecolor='white', edgecolor='#EF4444', linewidth=1.1))
    ax.text(4.5, 0.45, "Rollback\nredeploy last good version", ha='center', va='center', fontsize=6.2, color='#DC2626', fontfamily=FONT_FAMILY)

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "fig_5_1_devops_pipeline.png"), dpi=300, bbox_inches='tight')
    plt.close()

if __name__ == "__main__":
    make_lab_manual_fig_3_1()
    make_lab_manual_fig_3_2()
    make_lab_manual_fig_3_3()
    make_lab_manual_fig_5_1()
    print("Lab-manual style diagrams generated successfully!")
