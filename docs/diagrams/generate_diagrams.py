import os
os.environ['MPLCONFIGDIR'] = '/tmp/mplconfig'
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

OUT_DIR = "/Users/mayankheda/Desktop/asd mpr/fixmyhostel/docs/diagrams"
os.makedirs(OUT_DIR, exist_ok=True)

# -------------------------------------------------------------------------
# Figure 3.1: High-Level Architecture Diagram
# -------------------------------------------------------------------------
def make_fig_3_1():
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 8)
    ax.axis('off')

    # Background canvas card
    ax.add_patch(patches.Rectangle((0.1, 0.1), 10.8, 7.8, facecolor='#F8FAFC', edgecolor='#CBD5E1', linewidth=1.5, zorder=0))

    # Client Tier Container
    ax.add_patch(patches.FancyBboxPatch((0.5, 6.2), 10.0, 1.3, boxstyle="round,pad=0.2", facecolor='#EEF2FF', edgecolor='#6366F1', linewidth=2, zorder=1))
    ax.text(0.7, 7.2, "CLIENT TIER", fontsize=11, fontweight='bold', color='#3730A3', zorder=2)
    
    # Browser Node
    ax.add_patch(patches.FancyBboxPatch((3.2, 6.4), 4.6, 0.8, boxstyle="round,pad=0.15", facecolor='#4F46E5', edgecolor='#312E81', linewidth=1.5, zorder=2))
    ax.text(5.5, 6.8, "User Web Browser (Desktop / Mobile)\nReact 18 SPA (Tailwind CSS, Port 3000)", ha='center', va='center', color='white', fontsize=10, fontweight='bold', zorder=3)

    # Orchestration Tier Container
    ax.add_patch(patches.FancyBboxPatch((0.5, 0.4), 10.0, 5.5, boxstyle="round,pad=0.2", facecolor='#F1F5F9', edgecolor='#64748B', linewidth=2, zorder=1))
    ax.text(0.7, 5.6, "CONTAINER ORCHESTRATION CLUSTER (Docker Compose - fmh-network)", fontsize=11, fontweight='bold', color='#1E293B', zorder=2)

    # Nginx Proxy
    ax.add_patch(patches.FancyBboxPatch((3.5, 4.4), 4.0, 0.85, boxstyle="round,pad=0.15", facecolor='#0284C7', edgecolor='#0369A1', linewidth=1.5, zorder=2))
    ax.text(5.5, 4.82, "fmh-frontend (Nginx Alpine)\nPort 3000:80 | SPA Hosting & Reverse Proxy", ha='center', va='center', color='white', fontsize=9.5, fontweight='bold', zorder=3)

    # Express API
    ax.add_patch(patches.FancyBboxPatch((3.5, 2.9), 4.0, 0.9, boxstyle="round,pad=0.15", facecolor='#059669', edgecolor='#047857', linewidth=1.5, zorder=2))
    ax.text(5.5, 3.35, "fmh-api (Node.js 20 Express)\nPort 5001:5000 | REST API & prom-client", ha='center', va='center', color='white', fontsize=9.5, fontweight='bold', zorder=3)

    # MySQL
    ax.add_patch(patches.FancyBboxPatch((1.0, 1.2), 2.8, 1.0, boxstyle="round,pad=0.15", facecolor='#D97706', edgecolor='#B45309', linewidth=1.5, zorder=2))
    ax.text(2.4, 1.7, "fmh-mysql (MySQL 8.0)\nPort 3307:3306\nACID Relational Store", ha='center', va='center', color='white', fontsize=9, fontweight='bold', zorder=3)

    # Redis
    ax.add_patch(patches.FancyBboxPatch((4.2, 1.2), 2.6, 1.0, boxstyle="round,pad=0.15", facecolor='#DC2626', edgecolor='#B91C1C', linewidth=1.5, zorder=2))
    ax.text(5.5, 1.7, "fmh-redis (Redis 7)\nPort 6379:6379\nIn-Memory Cache", ha='center', va='center', color='white', fontsize=9, fontweight='bold', zorder=3)

    # Observability Box
    ax.add_patch(patches.FancyBboxPatch((7.2, 0.8), 3.0, 3.2, boxstyle="round,pad=0.15", facecolor='#FAF5FF', edgecolor='#A855F7', linewidth=1.5, zorder=2))
    ax.text(8.7, 3.7, "OBSERVABILITY TIER", ha='center', fontsize=9.5, fontweight='bold', color='#6B21A8', zorder=3)

    # Prometheus
    ax.add_patch(patches.FancyBboxPatch((7.4, 2.6), 2.6, 0.7, boxstyle="round,pad=0.1", facecolor='#EA580C', edgecolor='#C2410C', zorder=3))
    ax.text(8.7, 2.95, "fmh-prometheus (:9090)\nMetrics Scraping (15s)", ha='center', va='center', color='white', fontsize=8, fontweight='bold', zorder=4)

    # Grafana
    ax.add_patch(patches.FancyBboxPatch((7.4, 1.75), 2.6, 0.7, boxstyle="round,pad=0.1", facecolor='#F59E0B', edgecolor='#D97706', zorder=3))
    ax.text(8.7, 2.1, "fmh-grafana (:3001)\n12-Panel Dashboards", ha='center', va='center', color='white', fontsize=8, fontweight='bold', zorder=4)

    # Nagios
    ax.add_patch(patches.FancyBboxPatch((7.4, 0.95), 2.6, 0.7, boxstyle="round,pad=0.1", facecolor='#16A34A', edgecolor='#15803D', zorder=3))
    ax.text(8.7, 1.3, "fmh-nagios (:8080)\nCore 4 Uptime Checks", ha='center', va='center', color='white', fontsize=8, fontweight='bold', zorder=4)

    # Arrows
    arrow_kw = dict(arrowstyle="->,head_width=0.3,head_length=0.4", lw=1.8, color="#334155")
    
    # Browser -> Nginx
    ax.annotate("", xy=(5.5, 5.25), xytext=(5.5, 6.4), arrowprops=arrow_kw)
    ax.text(5.8, 5.8, "HTTP:3000", fontsize=8.5, fontweight='bold', color='#1E293B')

    # Nginx -> API
    ax.annotate("", xy=(5.5, 3.8), xytext=(5.5, 4.4), arrowprops=arrow_kw)
    ax.text(5.8, 4.1, "Reverse Proxy /api/*", fontsize=8.5, fontweight='bold', color='#1E293B')

    # API -> MySQL
    ax.annotate("", xy=(2.4, 2.2), xytext=(4.0, 2.9), arrowprops=arrow_kw)
    ax.text(2.6, 2.6, "SQL Pool", fontsize=8, fontweight='bold', color='#B45309')

    # API -> Redis
    ax.annotate("", xy=(5.5, 2.2), xytext=(5.5, 2.9), arrowprops=arrow_kw)
    ax.text(5.6, 2.55, "Cache I/O", fontsize=8, fontweight='bold', color='#B91C1C')

    # API -> Prometheus
    ax.annotate("", xy=(7.4, 2.95), xytext=(6.5, 3.35), arrowprops=arrow_kw)
    ax.text(6.65, 3.25, "/ops/metrics", fontsize=8, fontweight='bold', color='#C2410C')

    # Prometheus -> Grafana
    ax.annotate("", xy=(8.7, 2.45), xytext=(8.7, 2.6), arrowprops=arrow_kw)

    # Nagios checks
    ax.annotate("", xy=(4.0, 1.7), xytext=(7.4, 1.3), arrowprops=dict(arrowstyle="->", lw=1.2, ls="--", color="#16A34A"))
    ax.text(5.2, 1.05, "Health & TCP Probes", fontsize=7.5, color='#15803D', fontweight='bold')

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "fig_3_1_architecture.png"), dpi=300, bbox_inches='tight')
    plt.close()

# -------------------------------------------------------------------------
# Figure 3.2: Sequence Diagram (Complaint Lifecycle)
# -------------------------------------------------------------------------
def make_fig_3_2():
    fig, ax = plt.subplots(figsize=(11, 8.5), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 12)
    ax.axis('off')

    # Lifelines
    actors = [
        ("Student", 1.0, '#4F46E5'),
        ("Frontend\n(Nginx)", 2.8, '#0284C7'),
        ("Express\nAPI", 4.8, '#059669'),
        ("MySQL\nDB", 6.8, '#D97706'),
        ("Redis\nCache", 8.4, '#DC2626'),
        ("Staff / Warden", 10.0, '#7C3AED')
    ]

    for name, x, col in actors:
        # Header box
        ax.add_patch(patches.FancyBboxPatch((x-0.7, 10.8), 1.4, 0.8, boxstyle="round,pad=0.1", facecolor=col, edgecolor='black', linewidth=1.2))
        ax.text(x, 11.2, name, ha='center', va='center', color='white', fontsize=8.5, fontweight='bold')
        # Vertical dotted line
        ax.plot([x, x], [0.8, 10.8], ls='--', color='#94A3B8', lw=1.2, zorder=0)

    # Sequence steps (y position, from_x, to_x, label, color, return_flag)
    steps = [
        (10.2, 1.0, 2.8, "1. POST /api/complaints (Form submit)", '#1E293B', False),
        (9.6, 2.8, 4.8, "2. Forward request + Bearer JWT", '#1E293B', False),
        (9.0, 4.8, 6.8, "3. SELECT COUNT(*) today (IST offset)", '#B45309', False),
        (8.5, 6.8, 4.8, "4. Return count (e.g. 43) -> Token #44", '#B45309', True),
        (7.9, 4.8, 6.8, "5. INSERT complaint (Token #44, RAISED)", '#047857', False),
        (7.4, 4.8, 8.4, "6. DEL student cache key", '#DC2626', False),
        (6.8, 4.8, 2.8, "7. HTTP 201 Created (Token #44)", '#047857', True),
        (6.3, 2.8, 1.0, "8. Render Success Modal & Ticket Card", '#3730A3', True),
        (5.5, 10.0, 4.8, "9. GET /api/staff/queue (Staff loads board)", '#7C3AED', False),
        (4.9, 4.8, 6.8, "10. SELECT non-resolved ORDER BY severity", '#B45309', False),
        (4.4, 4.8, 10.0, "11. Return Priority Queue (Critical first)", '#7C3AED', True),
        (3.6, 10.0, 4.8, "12. PATCH /api/staff/:id/accept -> ACCEPTED", '#7C3AED', False),
        (3.0, 10.0, 4.8, "13. PATCH /api/staff/:id/resolve (Notes) -> RESOLVED", '#059669', False),
        (2.4, 4.8, 6.8, "14. UPDATE resolved_at = NOW() in DB", '#B45309', False),
        (1.6, 10.0, 4.8, "15. Warden loads /api/admin/dashboard", '#4338CA', False),
        (1.0, 4.8, 10.0, "16. Return SLA & Hotspot Analytics", '#4338CA', True)
    ]

    for y, x1, x2, text, col, is_ret in steps:
        style = "<|-,head_width=0.25,head_length=0.35" if is_ret else "->,head_width=0.25,head_length=0.35"
        ls = ":" if is_ret else "-"
        ax.annotate("", xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle=style, lw=1.4, ls=ls, color=col))
        mid_x = (x1 + x2) / 2
        ax.text(mid_x, y + 0.12, text, ha='center', va='bottom', fontsize=7.5, fontweight='bold', color=col,
                bbox=dict(boxstyle="square,pad=0.1", fc='#FFFFFF', ec='none', alpha=0.9))

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "fig_3_2_sequence.png"), dpi=300, bbox_inches='tight')
    plt.close()

# -------------------------------------------------------------------------
# Figure 3.3: Complaint State Machine
# -------------------------------------------------------------------------
def make_fig_3_3():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    # Initial state circle
    circle_init = patches.Circle((0.8, 4.0), 0.25, facecolor='#1E293B', edgecolor='black', zorder=2)
    ax.add_patch(circle_init)

    # State boxes
    states = [
        ("RAISED", 2.2, 4.0, '#3B82F6', "Student submits form\nToken assigned"),
        ("ACCEPTED", 4.7, 4.0, '#8B5CF6', "Technician claims ticket\nassigned_to set"),
        ("IN_PROGRESS", 7.2, 4.0, '#F59E0B', "Repair work commences\nstarted_at recorded"),
        ("RESOLVED", 7.2, 1.8, '#10B981', "Technician provides notes\nresolved_at recorded"),
        ("CANCELLED", 2.2, 1.8, '#6B7280', "Student cancels ticket\n(Only allowed in RAISED)")
    ]

    for name, x, y, col, sub in states:
        ax.add_patch(patches.FancyBboxPatch((x-0.9, y-0.45), 1.8, 0.9, boxstyle="round,pad=0.12", facecolor=col, edgecolor='#1E293B', linewidth=1.5, zorder=2))
        ax.text(x, y+0.12, name, ha='center', va='center', color='white', fontsize=10, fontweight='bold', zorder=3)
        ax.text(x, y-0.2, sub, ha='center', va='center', color='#F1F5F9', fontsize=6.5, zorder=3)

    # End State circle
    circle_end_outer = patches.Circle((9.2, 1.8), 0.32, facecolor='none', edgecolor='#059669', linewidth=2, zorder=2)
    circle_end_inner = patches.Circle((9.2, 1.8), 0.22, facecolor='#059669', edgecolor='none', zorder=2)
    ax.add_patch(circle_end_outer)
    ax.add_patch(circle_end_inner)
    ax.text(9.2, 1.25, "Feedback Left\n(1-5 Stars)", ha='center', fontsize=7.5, fontweight='bold', color='#047857')

    # Transitions
    ak = dict(arrowstyle="->,head_width=0.3,head_length=0.4", lw=1.8, color="#334155")
    
    # Init -> RAISED
    ax.annotate("", xy=(1.3, 4.0), xytext=(1.05, 4.0), arrowprops=ak)
    
    # RAISED -> ACCEPTED
    ax.annotate("", xy=(3.8, 4.0), xytext=(3.1, 4.0), arrowprops=ak)
    ax.text(3.45, 4.25, "Staff Accepts", ha='center', fontsize=7.5, fontweight='bold', color='#4F46E5')

    # ACCEPTED -> IN_PROGRESS
    ax.annotate("", xy=(6.3, 4.0), xytext=(5.6, 4.0), arrowprops=ak)
    ax.text(5.95, 4.25, "Staff Starts", ha='center', fontsize=7.5, fontweight='bold', color='#7C3AED')

    # IN_PROGRESS -> RESOLVED
    ax.annotate("", xy=(7.2, 2.25), xytext=(7.2, 3.55), arrowprops=ak)
    ax.text(7.7, 2.9, "Resolve + Notes", ha='left', fontsize=7.5, fontweight='bold', color='#047857')

    # RAISED -> CANCELLED
    ax.annotate("", xy=(2.2, 2.25), xytext=(2.2, 3.55), arrowprops=ak)
    ax.text(2.65, 2.9, "Cancel by Student", ha='left', fontsize=7.5, fontweight='bold', color='#DC2626')

    # RESOLVED -> End
    ax.annotate("", xy=(8.85, 1.8), xytext=(8.1, 1.8), arrowprops=ak)

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "fig_3_3_statemachine.png"), dpi=300, bbox_inches='tight')
    plt.close()

# -------------------------------------------------------------------------
# Figure 3.4: ER Diagram (Database Schema)
# -------------------------------------------------------------------------
def make_fig_3_4():
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 8)
    ax.axis('off')

    # USERS table card
    ax.add_patch(patches.FancyBboxPatch((0.5, 3.6), 3.0, 3.6, boxstyle="round,pad=0.1", facecolor='#FFFFFF', edgecolor='#3B82F6', linewidth=2))
    ax.add_patch(patches.Rectangle((0.5, 6.7), 3.0, 0.5, facecolor='#3B82F6'))
    ax.text(2.0, 6.95, "USERS TABLE", ha='center', va='center', color='white', fontweight='bold', fontsize=10)
    users_fields = [
        "id: INT (PK, Auto)",
        "name: VARCHAR(100)",
        "email: VARCHAR(100) (UK)",
        "password_hash: VARCHAR(255)",
        "role: ENUM (student/staff/warden)",
        "room_number: VARCHAR(20)",
        "created_at: TIMESTAMP",
        "updated_at: TIMESTAMP"
    ]
    for i, f in enumerate(users_fields):
        ax.text(0.65, 6.4 - i*0.35, f, fontsize=8, color='#1E293B', fontfamily='monospace')

    # COMPLAINTS table card
    ax.add_patch(patches.FancyBboxPatch((4.3, 0.8), 3.4, 6.4, boxstyle="round,pad=0.1", facecolor='#FFFFFF', edgecolor='#059669', linewidth=2))
    ax.add_patch(patches.Rectangle((4.3, 6.7), 3.4, 0.5, facecolor='#059669'))
    ax.text(6.0, 6.95, "COMPLAINTS TABLE", ha='center', va='center', color='white', fontweight='bold', fontsize=10)
    complaints_fields = [
        "id: INT (PK, Auto)",
        "token_number: INT (Daily seq)",
        "student_id: INT (FK -> users.id)",
        "category: ENUM (plumbing/elec...)",
        "severity: ENUM (low/med/hi/crit)",
        "title: VARCHAR(200)",
        "description: TEXT",
        "photo_url: VARCHAR(500)",
        "location: VARCHAR(200)",
        "status: ENUM (RAISED/ACCEPTED...)",
        "assigned_to: INT (FK -> users.id)",
        "resolution_notes: TEXT",
        "raised_at: TIMESTAMP (Indexed)",
        "accepted_at: TIMESTAMP NULL",
        "started_at: TIMESTAMP NULL",
        "resolved_at: TIMESTAMP NULL"
    ]
    for i, f in enumerate(complaints_fields):
        ax.text(4.45, 6.4 - i*0.35, f, fontsize=7.8, color='#1E293B', fontfamily='monospace')

    # FEEDBACK table card
    ax.add_patch(patches.FancyBboxPatch((8.3, 3.6), 2.4, 3.0, boxstyle="round,pad=0.1", facecolor='#FFFFFF', edgecolor='#D97706', linewidth=2))
    ax.add_patch(patches.Rectangle((8.3, 6.1), 2.4, 0.5, facecolor='#D97706'))
    ax.text(9.5, 6.35, "FEEDBACK TABLE", ha='center', va='center', color='white', fontweight='bold', fontsize=10)
    feedback_fields = [
        "id: INT (PK, Auto)",
        "complaint_id: INT (FK, UK)",
        "student_id: INT (FK)",
        "rating: TINYINT (1-5)",
        "comment: TEXT",
        "created_at: TIMESTAMP"
    ]
    for i, f in enumerate(feedback_fields):
        ax.text(8.45, 5.8 - i*0.35, f, fontsize=8, color='#1E293B', fontfamily='monospace')

    # Relationship connectors
    # USERS -> COMPLAINTS (1 to Many: student_id)
    ax.annotate("", xy=(4.3, 5.7), xytext=(3.5, 5.7),
                arrowprops=dict(arrowstyle="->,head_width=0.3", lw=1.8, color='#3B82F6'))
    ax.text(3.9, 5.85, "1 : N (files)", ha='center', fontsize=7.5, fontweight='bold', color='#3B82F6')

    # USERS -> COMPLAINTS (1 to Many: assigned_to)
    ax.annotate("", xy=(4.3, 3.2), xytext=(3.5, 4.0),
                arrowprops=dict(arrowstyle="->,head_width=0.3", lw=1.8, color='#6366F1', ls='--'))
    ax.text(3.9, 3.4, "1 : N (assigned)", ha='center', fontsize=7.5, fontweight='bold', color='#6366F1')

    # COMPLAINTS -> FEEDBACK (1 to 1)
    ax.annotate("", xy=(8.3, 5.0), xytext=(7.7, 5.0),
                arrowprops=dict(arrowstyle="->,head_width=0.3", lw=1.8, color='#D97706'))
    ax.text(8.0, 5.2, "1 : 1", ha='center', fontsize=8, fontweight='bold', color='#D97706')

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "fig_3_4_er_diagram.png"), dpi=300, bbox_inches='tight')
    plt.close()

# -------------------------------------------------------------------------
# Figure 5.1: End-to-End DevOps Delivery Pipeline Flowchart
# -------------------------------------------------------------------------
def make_fig_5_1():
    fig, ax = plt.subplots(figsize=(11, 4.2), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 4)
    ax.axis('off')

    stages = [
        ("Jira Backlog\n(Exp 6: FMH-*)", 0.9, 2.0, '#3B82F6'),
        ("Git Branch\n(Exp 1: feature/*)", 2.3, 2.0, '#06B6D4'),
        ("Jenkins CI\n(Exp 4: Lint+Test)", 3.7, 2.0, '#8B5CF6'),
        ("PR Review\n(Exp 1: Merge)", 5.1, 2.0, '#EC4899'),
        ("Docker Build\n(Exp 2: Multi-stage)", 6.5, 2.0, '#F59E0B'),
        ("Compose Deploy\n(Exp 3 & 5: Auto)", 7.9, 2.0, '#10B981'),
        ("Smoke Check\n(Exp 5: curl UP)", 9.3, 2.0, '#0284C7'),
        ("Observability\n(Exp 7: Monitored)", 10.4, 2.0, '#64748B')
    ]

    for i, (name, x, y, col) in enumerate(stages):
        ax.add_patch(patches.FancyBboxPatch((x-0.6, y-0.65), 1.2, 1.3, boxstyle="round,pad=0.08", facecolor=col, edgecolor='#1E293B', linewidth=1.4))
        ax.text(x, y, name, ha='center', va='center', color='white', fontsize=7.2, fontweight='bold')
        
        if i < len(stages) - 1:
            next_x = stages[i+1][1]
            ax.annotate("", xy=(next_x-0.65, y), xytext=(x+0.65, y),
                        arrowprops=dict(arrowstyle="->,head_width=0.25,head_length=0.3", lw=1.5, color='#334155'))

    ax.text(5.5, 0.4, "Automated Continuous Integration, Deployment & Feedback Loop Across 7 Lab Experiments",
            ha='center', fontsize=9, fontweight='bold', color='#1E293B', style='italic')

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "fig_5_1_devops_pipeline.png"), dpi=300, bbox_inches='tight')
    plt.close()

if __name__ == "__main__":
    make_fig_3_1()
    make_fig_3_2()
    make_fig_3_3()
    make_fig_3_4()
    make_fig_5_1()
    print("All 5 diagrams successfully generated at:", OUT_DIR)

