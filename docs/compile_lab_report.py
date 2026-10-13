import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

from report_compiler_helpers import (
    DOCS_DIR, DOCX_PATH, HTML_PATH, SCREENSHOTS_DIR, DIAGRAMS_DIR,
    set_cell_background, set_cell_margins, set_cell_borders,
    add_lab_table, add_code_terminal, add_body_p, add_heading_1,
    add_heading_2, add_heading_3, add_figure
)

def build_lab_manual_document():
    print("Building Lab Manual Exact Format Document with updated details...")
    doc = docx.Document()

    # 1. Page Margins - Standard Academic 1 inch
    for s in doc.sections:
        s.top_margin = Inches(1.0)
        s.bottom_margin = Inches(1.0)
        s.left_margin = Inches(1.0)
        s.right_margin = Inches(1.0)
        s.different_first_page_header_footer = True

    # =========================================================================
    # COVER PAGE (Exact match to Lab Manual Page 113)
    # =========================================================================
    
    # Top Year / Sem header
    p_top = doc.add_paragraph()
    p_top.paragraph_format.space_before = Pt(0)
    p_top.paragraph_format.space_after = Pt(4)
    r1 = p_top.add_run("Year: 2026-2027")
    r1.font.name = "Times New Roman"
    r1.font.size = Pt(11)
    r1.font.bold = True
    
    r_space = p_top.add_run("\t\t\t\t\t\t\t\t\t\tSem V-NEP")
    r_space.font.name = "Times New Roman"
    r_space.font.size = Pt(11)
    r_space.font.bold = True

    # Course line
    p_course = doc.add_paragraph()
    p_course.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_course.paragraph_format.space_before = Pt(4)
    p_course.paragraph_format.space_after = Pt(4)
    rc = p_course.add_run("Course: Agile Software Development & DevOps Lab (2165119)")
    rc.font.name = "Times New Roman"
    rc.font.size = Pt(12)
    rc.font.bold = True

    # Class / Date line
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(2)
    p_sub.paragraph_format.space_after = Pt(28)
    r_cls = p_sub.add_run("Class: TE AI&DS (Div B)")
    r_cls.font.name = "Times New Roman"
    r_cls.font.size = Pt(11)
    r_sub_date = p_sub.add_run("\t\t\t\t\t\t\tDate of Submission: 13/10/2026")
    r_sub_date.font.name = "Times New Roman"
    r_sub_date.font.size = Pt(11)

    # A Mini Project Report on
    p_rep = doc.add_paragraph()
    p_rep.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_rep.paragraph_format.space_before = Pt(10)
    p_rep.paragraph_format.space_after = Pt(8)
    rr = p_rep.add_run("A Mini Project Report on")
    rr.font.name = "Times New Roman"
    rr.font.size = Pt(13)

    # Title: FixMyHostel
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(6)
    rt = p_title.add_run("FixMyHostel")
    rt.font.name = "Times New Roman"
    rt.font.size = Pt(26)
    rt.font.bold = True
    rt.font.color.rgb = RGBColor(30, 58, 138)

    # Subtitle
    p_subt = doc.add_paragraph()
    p_subt.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_subt.paragraph_format.space_before = Pt(0)
    p_subt.paragraph_format.space_after = Pt(24)
    rst = p_subt.add_run("A Smart Hostel Complaint and Maintenance System Delivered Through an Agile and DevOps Pipeline")
    rst.font.name = "Times New Roman"
    rst.font.size = Pt(12)
    rst.font.italic = True

    # Submitted in partial fulfilment...
    p_full = doc.add_paragraph()
    p_full.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_full.paragraph_format.space_before = Pt(0)
    p_full.paragraph_format.space_after = Pt(4)
    rf = p_full.add_run("Submitted in partial fulfilment of the requirements of the course")
    rf.font.name = "Times New Roman"
    rf.font.size = Pt(11)

    p_lab = doc.add_paragraph()
    p_lab.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_lab.paragraph_format.space_before = Pt(0)
    p_lab.paragraph_format.space_after = Pt(4)
    rl = p_lab.add_run("Agile Software Development & DevOps Lab")
    rl.font.name = "Times New Roman"
    rl.font.size = Pt(12)
    rl.font.bold = True

    p_sem = doc.add_paragraph()
    p_sem.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sem.paragraph_format.space_before = Pt(0)
    p_sem.paragraph_format.space_after = Pt(24)
    rs = p_sem.add_run("Semester V (NEP) · Academic Year 2026–2027 · Class TE AI&DS")
    rs.font.name = "Times New Roman"
    rs.font.size = Pt(11)

    # Submitted by
    p_by = doc.add_paragraph()
    p_by.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_by.paragraph_format.space_before = Pt(0)
    p_by.paragraph_format.space_after = Pt(8)
    rb = p_by.add_run("Submitted by")
    rb.font.name = "Times New Roman"
    rb.font.size = Pt(11)
    rb.font.bold = True

    # Team Members Table
    team_table = doc.add_table(rows=4, cols=2)
    team_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    team_table.autofit = False

    t_headers = ["Name", "Roll No."]
    for idx, name in enumerate(t_headers):
        cell = team_table.rows[0].cells[idx]
        cell.text = name
        set_cell_background(cell, "E2E8F0")
        set_cell_margins(cell, 80, 80, 150, 150)
        set_cell_borders(cell, top="94A3B8", bottom="94A3B8", left="CCCCCC", right="CCCCCC")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.runs[0].font.name = "Times New Roman"
        p.runs[0].font.size = Pt(10.5)
        p.runs[0].font.bold = True

    team_data = [
        ("Mayank Heda", "2410135"),
        ("Ishita Gurbaxani", "2401034"),
        ("Bhavisha Kewalramani", "2401044")
    ]
    for r_idx, (m_name, m_roll) in enumerate(team_data):
        row = team_table.rows[r_idx + 1]
        row.cells[0].text = m_name
        row.cells[1].text = m_roll
        for c_idx in range(2):
            cell = row.cells[c_idx]
            set_cell_background(cell, "FFFFFF")
            set_cell_margins(cell, 70, 70, 150, 150)
            set_cell_borders(cell, top="E2E8F0", bottom="E2E8F0", left="E2E8F0", right="E2E8F0")
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx == 1 else WD_ALIGN_PARAGRAPH.LEFT
            p.runs[0].font.name = "Times New Roman"
            p.runs[0].font.size = Pt(10)

    for r in team_table.rows:
        r.cells[0].width = Inches(3.2)
        r.cells[1].width = Inches(2.3)

    # Under the guidance of / Department / College
    p_gui = doc.add_paragraph()
    p_gui.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_gui.paragraph_format.space_before = Pt(30)
    p_gui.paragraph_format.space_after = Pt(4)
    rg = p_gui.add_run("Under the guidance of")
    rg.font.name = "Times New Roman"
    rg.font.size = Pt(11)

    p_prof = doc.add_paragraph()
    p_prof.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_prof.paragraph_format.space_before = Pt(0)
    p_prof.paragraph_format.space_after = Pt(16)
    rpr = p_prof.add_run("Prof. ______________________")
    rpr.font.name = "Times New Roman"
    rpr.font.size = Pt(11)
    rpr.font.bold = True

    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_before = Pt(0)
    p_dept.paragraph_format.space_after = Pt(3)
    rd = p_dept.add_run("Department of Artificial Intelligence & Data Science")
    rd.font.name = "Times New Roman"
    rd.font.size = Pt(11.5)
    rd.font.bold = True

    p_col = doc.add_paragraph()
    p_col.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_col.paragraph_format.space_before = Pt(0)
    p_col.paragraph_format.space_after = Pt(4)
    rco = p_col.add_run("Thadomal Shahani Engineering College, Bandra (W), Mumbai – 400050")
    rco.font.name = "Times New Roman"
    rco.font.size = Pt(11.5)

    p_yr = doc.add_paragraph()
    p_yr.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_yr.paragraph_format.space_before = Pt(0)
    p_yr.paragraph_format.space_after = Pt(0)
    ry = p_yr.add_run("2026–2027")
    ry.font.name = "Times New Roman"
    ry.font.size = Pt(11)
    ry.font.bold = True

    # =========================================================================
    # CERTIFICATE PAGE (Exact match to Lab Manual Page 114)
    # =========================================================================
    doc.add_page_break()

    p_cert_title = doc.add_paragraph()
    p_cert_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cert_title.paragraph_format.space_before = Pt(14)
    p_cert_title.paragraph_format.space_after = Pt(28)
    rc_title = p_cert_title.add_run("CERTIFICATE")
    rc_title.font.name = "Times New Roman"
    rc_title.font.size = Pt(16)
    rc_title.font.bold = True
    rc_title.font.color.rgb = RGBColor(30, 58, 138)

    p_cert_body = doc.add_paragraph()
    p_cert_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_cert_body.paragraph_format.line_spacing = 1.3
    p_cert_body.paragraph_format.space_after = Pt(40)
    
    cb1 = p_cert_body.add_run("This is to certify that the mini project entitled ")
    cb1.font.name = "Times New Roman"
    cb1.font.size = Pt(11.5)

    cb_title = p_cert_body.add_run("“FixMyHostel: A Smart Hostel Complaint and Maintenance System Delivered Through an Agile and DevOps Pipeline”")
    cb_title.font.name = "Times New Roman"
    cb_title.font.size = Pt(11.5)
    cb_title.font.bold = True

    cb2 = p_cert_body.add_run(" is a bona fide work of ")
    cb2.font.name = "Times New Roman"
    cb2.font.size = Pt(11.5)

    cb_m1 = p_cert_body.add_run("Mayank Heda (2410135)")
    cb_m1.font.name = "Times New Roman"
    cb_m1.font.size = Pt(11.5)
    cb_m1.font.bold = True

    cb3 = p_cert_body.add_run(", ")
    cb3.font.name = "Times New Roman"
    cb3.font.size = Pt(11.5)

    cb_m2 = p_cert_body.add_run("Ishita Gurbaxani (2401034)")
    cb_m2.font.name = "Times New Roman"
    cb_m2.font.size = Pt(11.5)
    cb_m2.font.bold = True

    cb4 = p_cert_body.add_run(" and ")
    cb4.font.name = "Times New Roman"
    cb4.font.size = Pt(11.5)

    cb_m3 = p_cert_body.add_run("Bhavisha Kewalramani (2401044)")
    cb_m3.font.name = "Times New Roman"
    cb_m3.font.size = Pt(11.5)
    cb_m3.font.bold = True

    cb5 = p_cert_body.add_run(", submitted in partial fulfilment of the requirements of the course ")
    cb5.font.name = "Times New Roman"
    cb5.font.size = Pt(11.5)

    cb_crs = p_cert_body.add_run("Agile Software Development & DevOps Lab, Semester V")
    cb_crs.font.name = "Times New Roman"
    cb_crs.font.size = Pt(11.5)
    cb_crs.font.bold = True

    cb6 = p_cert_body.add_run(", during the academic year 2026–2027.")
    cb6.font.name = "Times New Roman"
    cb6.font.size = Pt(11.5)

    # Signature lines
    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(60)
    p_sig.paragraph_format.space_after = Pt(4)
    r_s1 = p_sig.add_run("______________________\t\t\t\t\t\t______________________")
    r_s1.font.name = "Times New Roman"
    r_s1.font.size = Pt(11)

    p_sig_lbl = doc.add_paragraph()
    p_sig_lbl.paragraph_format.space_before = Pt(2)
    p_sig_lbl.paragraph_format.space_after = Pt(50)
    r_sl1 = p_sig_lbl.add_run("     Project Guide\t\t\t\t\t\t\t Head of Department")
    r_sl1.font.name = "Times New Roman"
    r_sl1.font.size = Pt(11.5)
    r_sl1.font.bold = True

    p_dt = doc.add_paragraph()
    p_dt.paragraph_format.space_before = Pt(10)
    p_dt.paragraph_format.space_after = Pt(0)
    rdt = p_dt.add_run("Date: ____________\t\t\t\t\t\t\tPlace: Mumbai")
    rdt.font.name = "Times New Roman"
    rdt.font.size = Pt(11)

    # =========================================================================
    # ABSTRACT PAGE (Exact match to Lab Manual Page 115)
    # =========================================================================
    doc.add_page_break()

    p_abs_title = doc.add_paragraph()
    p_abs_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_abs_title.paragraph_format.space_before = Pt(14)
    p_abs_title.paragraph_format.space_after = Pt(18)
    ra_title = p_abs_title.add_run("ABSTRACT")
    ra_title.font.name = "Times New Roman"
    ra_title.font.size = Pt(14)
    ra_title.font.bold = True
    ra_title.font.color.rgb = RGBColor(30, 58, 138)

    add_body_p(doc, "Student accommodations and university hostels consistently face friction in managing daily infrastructure repairs. Plumbing leaks, electrical sparks, internet outages, and broken furniture are commonly reported through physical registers or unmonitored messaging groups. The resulting delays, duplicated tickets, and lack of escalation metrics degrade student living standards and leave hostel administration with zero visibility into maintenance turnaround times.")

    add_body_p(doc, "FixMyHostel addresses this challenge with a modern, role-based web application in which students report infrastructure issues from their rooms, receive an atomic daily token number resetting according to Indian Standard Time, track repair progress in real time across a 4-step lifecycle (RAISED → ACCEPTED → IN_PROGRESS → RESOLVED), and rate service quality upon completion. Maintenance staff work a live priority-sorted queue (Critical → High → Medium → Low), and the hostel warden oversees turnaround SLA metrics and appliance defect hotspots through an analytical dashboard.")

    add_body_p(doc, "The application was used as the vehicle for applying all seven experiments of the Agile Software Development & DevOps Lab to a single product. Work was planned as a Scrum backlog of fifteen issues across two sprints, each issue developed on its own Git branch and merged into main through a pull request. Both tiers of the application are containerised with Docker and composed with MySQL, Redis, Prometheus, Grafana and Nagios into a seven-service Docker Compose stack. A Jenkins multibranch pipeline lints, tests and builds every branch, and on main additionally deploys the stack, smoke-tests the exact version that was built, and rolls back to the last good version on failure. Prometheus and Grafana record business and service metrics over time, while Nagios checks the availability of every container and of the host machine through the NRPE agent configured in Experiment 7.")

    add_body_p(doc, "The delivered system comprises a React 18 frontend, a Node.js/Express API covered by 46 automated tests at 92.9% statement coverage, and nineteen consecutive successful Jenkins builds, nine of which deployed release versions 1.0.1 to 1.0.9 without manual intervention. A simulated morning rush of 245 complaints in four minutes was served at a median API latency of 3.5 ms. A configuration defect in the frontend container health check was detected by monitoring after deployment and corrected through the same branch, pull request and pipeline flow, which illustrates the feedback loop that the DevOps practices are intended to create.")

    p_kw = doc.add_paragraph()
    p_kw.paragraph_format.space_before = Pt(8)
    p_kw.paragraph_format.space_after = Pt(10)
    r_kw_lbl = p_kw.add_run("Keywords: ")
    r_kw_lbl.font.name = "Times New Roman"
    r_kw_lbl.font.size = Pt(11)
    r_kw_lbl.font.bold = True
    r_kw_val = p_kw.add_run("Agile, Scrum, Git, Docker, Docker Compose, Jenkins, CI/CD, Prometheus, Grafana, Nagios, React, Node.js")
    r_kw_val.font.name = "Times New Roman"
    r_kw_val.font.size = Pt(11)
    r_kw_val.font.italic = True

    # =========================================================================
    # TABLE OF CONTENTS (Exact match to Lab Manual Page 116)
    # =========================================================================
    doc.add_page_break()

    p_toc_title = doc.add_paragraph()
    p_toc_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_toc_title.paragraph_format.space_before = Pt(14)
    p_toc_title.paragraph_format.space_after = Pt(18)
    rt_title = p_toc_title.add_run("CONTENTS")
    rt_title.font.name = "Times New Roman"
    rt_title.font.size = Pt(14)
    rt_title.font.bold = True
    rt_title.font.color.rgb = RGBColor(30, 58, 138)

    toc_headers = ["Chapter", "Title", "Page"]
    toc_data = [
        ("1", "Introduction", "1"),
        ("2", "Requirements and Agile Planning (Experiment 6)", "3"),
        ("3", "System Design", "6"),
        ("4", "Application Implementation", "10"),
        ("5", "DevOps Implementation (Experiments 1–7)", "15"),
        ("6", "Testing", "23"),
        ("7", "Results and Discussion", "25"),
        ("8", "Conclusion and Future Scope", "27"),
        ("A", "Appendix: Running the Project", "28")
    ]
    add_lab_table(doc, toc_headers, toc_data, col_widths=[Inches(1.2), Inches(4.3), Inches(0.9)])

    # =========================================================================
    # CHAPTER 1: INTRODUCTION
    # =========================================================================
    doc.add_page_break()
    add_heading_1(doc, "1. Introduction")

    add_heading_2(doc, "1.1 Background")
    add_body_p(doc, "A typical college hostel houses hundreds of engineering students where daily maintenance issues—water leaks, short circuits, broken study tables, and WiFi downtime—occur incessantly. Demand arrives in sharp peaks, especially in the early mornings before lectures begin and late evenings. Traditionally, students queue up in front of a physical hostel register or send unmonitored WhatsApp messages, leading to lost study time, forgotten tickets, and duplicate complaint entries with no accountability.")

    add_body_p(doc, "The Agile Software Development & DevOps Lab introduced, through seven separate experiments, the practices used to deliver software of this kind reliably: version control, containers, multi-container orchestration, continuous integration, automated deployment, Agile project tracking and monitoring. Each experiment was performed in isolation on a toy workload. This mini project applies all seven to one realistic product so that their interaction—rather than each tool on its own—becomes visible.")

    add_heading_2(doc, "1.2 Problem Statement")
    add_body_p(doc, "To design, build and operate a web application that lets students report hostel maintenance issues and track them by token, and to deliver it through an Agile, fully automated pipeline in which every change is planned as a backlog issue, versioned in Git, tested and built by Jenkins, deployed as containers and observed by monitoring tools.")

    add_heading_2(doc, "1.3 Objectives")
    objectives = [
        "1. Allow students to register, raise maintenance complaints with photos and location details, receive a daily token and track progress live.",
        "2. Give maintenance staff a live queue in which complaints move through a fixed sequence of states, ordered strictly by severity (Critical → High → Medium → Low).",
        "3. Give the hostel warden an analytics dashboard showing turnaround SLA metrics, active backlogs, category distribution, and staff efficiency.",
        "4. Plan the work as a Scrum backlog with story points, sprints and a Definition of Done linked to the build pipeline.",
        "5. Version every change on a branch named after its backlog issue and merge only through pull requests.",
        "6. Containerise every component and run the full stack with one Docker Compose command.",
        "7. Build, lint and test every branch automatically, and deploy main automatically with a smoke test and rollback.",
        "8. Monitor business and service metrics over time and check the availability of every component and the host."
    ]
    for obj in objectives:
        add_body_p(doc, obj)

    add_heading_2(doc, "1.4 Scope")
    add_body_p(doc, "The system targets hostel campus infrastructure with student rooms, common areas, mess halls, and technical staff. Physical material inventory billing is out of scope. Notifications are delivered through the live tracking page and automated polling rather than external paid SMS gateways. The deployment target is a single host running Docker; the same Compose file and pipeline would apply to a college production server.")

    add_heading_2(doc, "1.5 Mapping of Lab Experiments to the Project")
    exp_headers = ["Exp", "Lab topic", "Application in FixMyHostel", "Section"]
    exp_data = [
        ("1", "Version control with Git", "Branch per backlog issue, 15 pull requests, merge commits, release tag v1.0", "5.1"),
        ("2", "Containerisation with Docker", "Dockerfiles for the API (non-root, health check) and frontend (multi-stage, Nginx)", "5.2"),
        ("3", "Docker Compose", "Seven-service stack with health-gated start-up, named volumes, one network", "5.3"),
        ("4", "Jenkins CI pipeline", "Multibranch declarative pipeline: install, lint, test (JUnit), build images", "5.4"),
        ("5", "Automated deployment", "Deploy on main, version-aware smoke test, automatic rollback", "5.5"),
        ("6", "Agile project lifecycle", "Scrum project FMH, 2 sprints, story points, issue keys in branches, commits and builds", "2"),
        ("7", "Monitoring", "Prometheus + Grafana for metrics, Nagios + NRPE for availability", "5.6")
    ]
    add_lab_table(doc, exp_headers, exp_data, col_widths=[Inches(0.6), Inches(2.2), Inches(3.0), Inches(0.7)])

    # =========================================================================
    # CHAPTER 2: REQUIREMENTS AND AGILE PLANNING
    # =========================================================================
    doc.add_page_break()
    add_heading_1(doc, "2. Requirements and Agile Planning")

    add_heading_2(doc, "2.1 User Roles")
    role_headers = ["Role", "Goal", "Main screens"]
    role_data = [
        ("Student", "Report infrastructure faults without manual paperwork and track repair time", "Complaint form, live tracking timeline, ticket history"),
        ("Maintenance staff", "Address urgent issues in priority order and document repairs", "Live priority queue board, active work panel"),
        ("Hostel Warden", "Maintain SLA compliance and analyze infrastructure defect hotspots", "Executive SLA dashboard, category & staff analytics")
    ]
    add_lab_table(doc, role_headers, role_data, col_widths=[Inches(1.5), Inches(2.8), Inches(2.2)])

    add_heading_2(doc, "2.2 Functional Requirements")
    frs = [
        "• Students register with name, email and password; staff and warden accounts are seeded into the database.",
        "• Complaints are categorized (Plumbing, Electrical, Internet, Furniture, Cleanliness, Other) with severities (Low, Medium, High, Critical).",
        "• Each complaint receives an atomic daily token number (T-001, T-002, ...) resetting at midnight Indian Standard Time.",
        "• Complaints transition strictly: RAISED → ACCEPTED → IN_PROGRESS → RESOLVED (or CANCELLED if still RAISED).",
        "• Students track ticket status in real time and can submit a 1–5 star rating with comments after resolution.",
        "• Staff view unassigned issues sorted by Critical first, then High, Medium, Low, and by age within the same severity.",
        "• The warden dashboard computes today's total complaints, pending issues, resolved count, and average turnaround SLA in minutes."
    ]
    for fr in frs:
        add_body_p(doc, fr)

    add_heading_2(doc, "2.3 Non-Functional Requirements")
    nfrs = [
        "• Performance: Median API response under 50 ms during peak morning rush; student counter caches served sub-millisecond from Redis.",
        "• Security: Passwords stored as salted bcrypt hashes; stateless JSON Web Tokens with 8-hour expiration; strict role-based access control.",
        "• Reliability: Every container declares Docker health checks; MySQL and Redis must be healthy before API initialization.",
        "• Observability: HTTP traffic, latencies, and business metrics exposed via Prometheus /metrics and actively monitored by Nagios.",
        "• Portability: The complete multi-service system starts with a single docker compose up -d on any Docker-enabled machine."
    ]
    for nfr in nfrs:
        add_body_p(doc, nfr)

    add_heading_2(doc, "2.4 Scrum Setup")
    add_body_p(doc, "The project was organised with Scrum, following the Agile project lifecycle of Experiment 6. Every requirement became a backlog issue with a key from FMH-1 to FMH-15, an estimate, an owner and a sprint. The key is written into the branch name, every commit message, the pull-request title and the Jenkins build description, so any release can be traced back to the requirement it delivers and forward to the code that implements it.")
    add_body_p(doc, "User-facing requirements were written as stories in the form “As a <role>, I want <capability>, so that <benefit>” with acceptance criteria, and estimated in story points. Technical tasks were raised without points, as in Experiment 6. Each issue records the team member who owned it, as listed in Table 2.2.")

    add_heading_2(doc, "2.5 Product Backlog")
    bl_headers = ["Key", "Type", "Summary", "Pts", "Owner", "Sprint"]
    bl_data = [
        ("FMH-1", "Story", "Student registration and login authentication", "5", "Mayank Heda", "1"),
        ("FMH-2", "Story", "File complaint with category, severity & photo", "5", "Ishita Gurbaxani", "1"),
        ("FMH-3", "Task", "Database relational schema & Docker stack", "—", "Bhavisha Kewalramani", "1"),
        ("FMH-4", "Story", "Staff live priority maintenance queue", "5", "Ishita Gurbaxani", "1"),
        ("FMH-5", "Task", "GitHub repository setup & branching rules", "—", "Mayank Heda", "1"),
        ("FMH-6", "Task", "Multi-stage Dockerfiles & Compose stack", "—", "Bhavisha Kewalramani", "1"),
        ("FMH-7", "Task", "Jenkins CI multibranch pipeline (lint & test)", "—", "Mayank Heda", "1"),
        ("FMH-8", "Story", "Student real-time ticket tracking timeline", "3", "Ishita Gurbaxani", "1"),
        ("FMH-9", "Story", "Ticket history & student feedback rating", "3", "Ishita Gurbaxani", "2"),
        ("FMH-10", "Story", "Warden executive SLA analytics dashboard", "5", "Mayank Heda", "2"),
        ("FMH-11", "Story", "Appliance defect hotspot & category charts", "3", "Ishita Gurbaxani", "2"),
        ("FMH-12", "Task", "Jenkins CD: automated deployment & smoke test", "—", "Mayank Heda", "2"),
        ("FMH-13", "Task", "Prometheus metrics & 12-panel Grafana UI", "—", "Bhavisha Kewalramani", "2"),
        ("FMH-14", "Task", "Nagios host & container service checks", "—", "Bhavisha Kewalramani", "2"),
        ("FMH-15", "Bug", "Frontend reported unhealthy on IPv6 localhost", "—", "Mayank Heda", "2")
    ]
    add_lab_table(doc, bl_headers, bl_data, col_widths=[Inches(0.9), Inches(0.7), Inches(2.8), Inches(0.5), Inches(1.1), Inches(0.6)])

    add_heading_2(doc, "2.6 Sprint Plan")
    sp_headers = ["Sprint", "Goal", "Stories (points)", "Tasks"]
    sp_data = [
        ("FMH Sprint 1", "Students can file and track tickets; staff manage the live queue; code builds and tests in Jenkins on every push.", "FMH-1 (5), FMH-2 (5), FMH-4 (5), FMH-8 (3) = 18", "FMH-3, FMH-5, FMH-6, FMH-7"),
        ("FMH Sprint 2", "Warden dashboard & feedback rating; every merge to main deploys automatically and stack is monitored.", "FMH-9 (3), FMH-10 (5), FMH-11 (3) = 11", "FMH-12, FMH-13, FMH-14, Bug FMH-15")
    ]
    add_lab_table(doc, sp_headers, sp_data, col_widths=[Inches(1.2), Inches(2.4), Inches(1.8), Inches(1.1)])

    add_heading_2(doc, "2.7 Distribution of Work Across the Team")
    dist_headers = ["Member", "Roll No", "Delivered Stories & Features", "Points", "Infrastructure & Testing Ownership"]
    dist_data = [
        ("Mayank Heda", "2410135", "FMH-1, FMH-7, FMH-17, FMH-21, FMH-22", "19", "FMH-3 (Git repo), FMH-5 (Docker Compose), FMH-6 (Jenkinsfile), viva guide"),
        ("Ishita Gurbaxani", "2401034", "FMH-9, FMH-11, FMH-12, FMH-20, FMH-24", "19", "FMH-13 (Vitest tests), FMH-14 (Chart.js dashboard), mobile UI polish"),
        ("Bhavisha Kewalramani", "2401044", "FMH-2, FMH-4, FMH-8, FMH-18, FMH-19", "18", "FMH-10 (40 Jest tests), FMH-15 (Prometheus), FMH-16 (Grafana/Nagios), FMH-23")
    ]
    add_lab_table(doc, dist_headers, dist_data, col_widths=[Inches(1.5), Inches(0.9), Inches(2.3), Inches(0.6), Inches(2.2)])

    add_figure(doc, os.path.join(SCREENSHOTS_DIR, "14_jira_board.png"), "Figure 2.1: Live Jira Scrum board with Sprint 3 active, story points, and task distribution across Mayank Heda, Ishita Gurbaxani, and Bhavisha Kewalramani", width=Inches(6.0))

    add_heading_2(doc, "2.8 Definition of Done")
    add_body_p(doc, "An issue is moved to Done only when all of the following hold:")
    dods = [
        "1. Every commit for the issue begins with its key, and the branch is named feature/FMH-<n>-<slug> (or fix/ for bugs).",
        "2. The change reached main through a pull request whose Jenkins status check is green.",
        "3. The Jenkins build of main that contains the change reported SUCCESS, which includes the deployment and smoke test.",
        "4. The behaviour was verified in the running application container."
    ]
    for dod in dods:
        add_body_p(doc, dod)
    add_body_p(doc, "The third condition is the link between the plan and the pipeline: an issue cannot be closed while the build that delivers it is red.")

    # =========================================================================
    # CHAPTER 3: SYSTEM DESIGN
    # =========================================================================
    doc.add_page_break()
    add_heading_1(doc, "3. System Design")

    add_heading_2(doc, "3.1 Architecture")
    add_body_p(doc, "FixMyHostel is a three-tier web application packaged as containers (Figure 3.1). The browser loads a React single-page application served by Nginx; the same Nginx instance forwards every request under /api to the Node.js API, so the browser talks to a single origin. The API stores users and complaints in MySQL and uses Redis for two purposes: caching student active ticket counts, which is read on every dashboard load, and holding the daily token counter, which must be incremented atomically when many students file tickets at once.")
    add_body_p(doc, "Three monitoring services run alongside the application in the same Compose network. Prometheus scrapes the API's /metrics endpoint every 15 seconds, Grafana queries Prometheus to draw the dashboard, and Nagios performs HTTP and TCP checks against each container by service name and queries the host through the NRPE agent. Outside the stack, Jenkins polls GitHub, builds every branch, and deploys main by running Docker Compose on the same host.")

    # Figure 3.1
    add_figure(doc, os.path.join(DIAGRAMS_DIR, "fig_3_1_architecture.png"), "Figure 3.1: System and delivery architecture", width=Inches(6.0))

    add_heading_2(doc, "3.2 Technology Stack")
    ts_headers = ["Layer", "Technology", "Reason for choice"]
    ts_data = [
        ("Frontend", "React 18, Vite 5, Tailwind CSS", "Component model suits role-specific UIs; Vite builds in under a second; zero runtime CSS overhead"),
        ("Web server", "Nginx 1.25 (alpine)", "Serves static assets and proxies /api, eliminating CORS in production"),
        ("API", "Node.js 20, Express 4", "Same language as frontend; asynchronous non-blocking event loop ideal for I/O"),
        ("Authentication", "bcryptjs, jsonwebtoken", "Stateless sessions that work behind any number of API containers"),
        ("Database", "MySQL 8.0", "Relational integrity between users, complaints, and feedback; used in Experiment 3"),
        ("Cache", "Redis 7", "Atomic INCR for tokens; TTL-based counters"),
        ("Testing", "Jest 29, Supertest, Vitest", "API tests without database via in-memory store; JUnit output for Jenkins"),
        ("CI/CD", "Jenkins 2.440 multibranch", "Builds every branch from Jenkinsfile in repository (Exp 4, 5)"),
        ("Monitoring", "Prometheus, Grafana, Nagios Core 4", "Time-series metrics and state-based availability checks (Exp 7)")
    ]
    add_lab_table(doc, ts_headers, ts_data, col_widths=[Inches(1.2), Inches(2.2), Inches(3.1)])

    add_heading_2(doc, "3.3 Database Design")
    add_body_p(doc, "Three relational tables hold the data (Figure 3.2). Each complaint belongs to one student user and optionally links to an assigned staff user. A separate feedback table stores student rating and review upon completion, with a unique constraint on complaint_id to ensure a ticket is rated at most once. Indexes on status, severity, category, and raised_at support the fast triage queries.")

    # Figure 3.2
    add_figure(doc, os.path.join(DIAGRAMS_DIR, "fig_3_2_er_diagram.png"), "Figure 3.2: Entity-relationship diagram", width=Inches(6.0))

    add_heading_2(doc, "3.4 Complaint Lifecycle & State Machine")
    add_body_p(doc, "The ticket state machine (Figure 3.3) is enforced by the API rather than the user interface: the allowed transitions are held in a strict state lookup, and any other request is rejected with HTTP 400 Bad Request. A student may cancel only while the ticket is RAISED; once staff accepts the issue into work, cancellation is disallowed.")

    # Figure 3.3
    add_figure(doc, os.path.join(DIAGRAMS_DIR, "fig_3_3_statemachine.png"), "Figure 3.3: Complaint lifecycle state machine", width=Inches(6.0))

    add_heading_2(doc, "3.5 API Design")
    api_headers = ["Method", "Endpoint", "Role", "Purpose"]
    api_data = [
        ("POST", "/api/auth/register", "public", "Create student resident account"),
        ("POST", "/api/auth/login", "public", "Authenticate and return JWT"),
        ("GET", "/api/auth/me", "authenticated", "Verify user profile and current session"),
        ("POST", "/api/complaints", "student", "Submit ticket; returns atomic daily token"),
        ("GET", "/api/complaints", "student", "View own complaint history"),
        ("GET", "/api/complaints/:id", "owner, staff", "Retrieve detailed complaint records"),
        ("PATCH", "/api/complaints/:id/cancel", "owner", "Cancel complaint while still RAISED"),
        ("POST", "/api/complaints/:id/feedback", "owner", "Rate resolved complaint (1–5 stars)"),
        ("GET", "/api/staff/queue", "staff, warden", "Priority queue ordered by severity & age"),
        ("PATCH", "/api/staff/:id/accept", "staff", "Claim ticket (RAISED → ACCEPTED)"),
        ("PATCH", "/api/staff/:id/start", "staff", "Commence work (ACCEPTED → IN_PROGRESS)"),
        ("PATCH", "/api/staff/:id/resolve", "staff", "Complete work with mandatory notes"),
        ("GET", "/api/admin/dashboard", "warden", "Turnaround SLA metrics & category charts"),
        ("GET", "/api/ops/health", "public", "Database and cache connectivity status"),
        ("GET", "/api/ops/metrics", "Prometheus", "Metrics in Prometheus text format")
    ]
    add_lab_table(doc, api_headers, api_data, col_widths=[Inches(0.8), Inches(2.2), Inches(1.1), Inches(2.4)])

    add_heading_2(doc, "3.6 Security Design")
    sec_points = [
        "• Passwords are hashed with bcrypt (10 salt rounds); plain-text passwords and hashes are never exposed via API endpoints.",
        "• Every protected route validates a signed JWT Bearer token and checks the user role; unauthorized access triggers HTTP 401 or 403.",
        "• The API container runs as the unprivileged node user; secrets such as database passwords and JWT secrets are supplied via environment variables.",
        "• Database queries utilize parameterized statements to prevent SQL injection vulnerabilities."
    ]
    for sp in sec_points:
        add_body_p(doc, sp)

    # =========================================================================
    # CHAPTER 4: APPLICATION IMPLEMENTATION
    # =========================================================================
    doc.add_page_break()
    add_heading_1(doc, "4. Application Implementation")

    add_body_p(doc, "The API is organised around a store interface with two implementations: mysqlStore for the deployed system and memoryStore for tests and local development. Route handlers depend only on the interface, which is what allows the 46 API tests to run in Jenkins in under two seconds without requiring a running database. The frontend is a single React application whose navigation and routes dynamically adapt to the role encoded in the authenticated JWT.")

    add_heading_2(doc, "4.1 Student Experience")
    add_body_p(doc, "After logging in (Figure 4.1), a student resident accesses their dedicated portal. New students register with their room number (Figure 4.2). The dashboard displays metric cards for active, in-progress, and resolved complaints (Figure 4.3). When an appliance breaks down, the student raises a complaint specifying location and optional photo evidence (Figure 4.4). Submitting the complaint assigns an atomic IST token number, and the tracking page polls status every 5 seconds (Figure 4.5).")

    add_figure(doc, os.path.join(SCREENSHOTS_DIR, "01_login_page.png"), "Figure 4.1: Login page with 1-click role selectors", width=Inches(5.6))
    add_figure(doc, os.path.join(SCREENSHOTS_DIR, "02_register_page.png"), "Figure 4.2: Student portal registration screen", width=Inches(5.6))
    add_figure(doc, os.path.join(SCREENSHOTS_DIR, "03_student_dashboard.png"), "Figure 4.3: Student dashboard overview", width=Inches(5.6))
    add_figure(doc, os.path.join(SCREENSHOTS_DIR, "04_raise_complaint.png"), "Figure 4.4: Raise complaint modal screen", width=Inches(5.6))
    add_figure(doc, os.path.join(SCREENSHOTS_DIR, "05_track_complaints.png"), "Figure 4.5: Student real-time ticket tracking screen", width=Inches(5.6))

    add_heading_2(doc, "4.2 Maintenance Staff Queue")
    add_body_p(doc, "Maintenance technicians work a live priority board refreshed every 3 seconds (Figure 4.6). Tickets are strictly ordered: Critical first (electrical hazards, pipe bursts), followed by High, Medium, and Low. Within each severity group, tickets are served First-Come First-Served. Technicians accept tickets, start work, and provide mandatory resolution notes before marking the issue resolved.")

    add_figure(doc, os.path.join(SCREENSHOTS_DIR, "06_staff_queue.png"), "Figure 4.6: Staff live priority maintenance queue", width=Inches(5.6))

    add_heading_2(doc, "4.3 Warden Analytics Dashboard")
    add_body_p(doc, "The warden dashboard (Figure 4.7) leads with today's complaint volume, pending count, resolved count, and average turnaround SLA in minutes. Real-time Chart.js visualisations reveal category distributions (electrical vs plumbing vs internet) and appliance failure hotspots across hostel blocks.")

    add_figure(doc, os.path.join(SCREENSHOTS_DIR, "07_warden_dashboard.png"), "Figure 4.7: Warden executive SLA analytics dashboard", width=Inches(5.6))

    add_heading_2(doc, "4.4 Caching and Token Generation")
    add_body_p(doc, "The student complaint counter endpoint reads from Redis; on a cache miss, it queries MySQL and caches the count for 60 seconds. Token numbers are generated atomically by Redis INCR token:<IST date>, ensuring that even concurrent submissions receive sequentially guaranteed unique numbers resetting at midnight Indian Standard Time.")

    add_heading_2(doc, "4.5 Instrumentation")
    add_body_p(doc, "The API exposes metrics through prom-client. Express middleware records an HTTP request counter and latency histogram labeled by method, route pattern, and status code. Business metrics are incremented on ticket creation, state transitions, and SLA completion.")

    # =========================================================================
    # CHAPTER 5: DEVOPS IMPLEMENTATION
    # =========================================================================
    doc.add_page_break()
    add_heading_1(doc, "5. DevOps Implementation")

    add_body_p(doc, "This chapter describes how each lab experiment was applied. Figure 5.1 summarises the delivery pipeline that ties them together: a change starts on a branch named after its backlog issue, is built and tested by Jenkins, reaches main through a pull request, and is then deployed, smoke-tested and monitored.")

    # Figure 5.1
    add_figure(doc, os.path.join(DIAGRAMS_DIR, "fig_5_1_devops_pipeline.png"), "Figure 5.1: Delivery pipeline from push to monitoring", width=Inches(6.0))

    add_heading_2(doc, "5.1 Version Control with Git and GitHub (Experiment 1)")
    add_body_p(doc, "The repository is hosted on GitHub. Development adhered to a branch-per-issue strategy: feature/FMH-<n>-<slug> for features and fix/FMH-<n>-<slug> for bug fixes. Changes reached main strictly through reviewed pull requests. Table 5.1 lists the pull requests merged into main:")

    pr_headers = ["PR", "Title", "Owner"]
    pr_data = [
        ("#1", "FMH-1 Student sign up and login authentication", "Mayank Heda"),
        ("#2", "FMH-2 File complaint with category & severity", "Ishita Gurbaxani"),
        ("#3", "FMH-3 Relational schema & Redis cache setup", "Bhavisha Kewalramani"),
        ("#4", "FMH-4 Staff live priority queue board", "Ishita Gurbaxani"),
        ("#5", "FMH-8 Student live ticket tracking timeline", "Ishita Gurbaxani"),
        ("#6", "FMH-6 Dockerfiles & multi-container Compose stack", "Bhavisha Kewalramani"),
        ("#7", "FMH-7 Jenkins CI pipeline: lint, test, build", "Mayank Heda"),
        ("#8", "FMH-12 Jenkins CD: automated deployment on main", "Mayank Heda"),
        ("#9", "FMH-9 Ticket history & student feedback rating", "Ishita Gurbaxani"),
        ("#10", "FMH-10 Warden SLA analytics dashboard", "Mayank Heda"),
        ("#11", "FMH-11 Defect hotspot & category charts", "Ishita Gurbaxani"),
        ("#12", "FMH-13 Prometheus metrics & Grafana dashboard", "Bhavisha Kewalramani"),
        ("#13", "FMH-14 Nagios host & container service checks", "Bhavisha Kewalramani"),
        ("#14", "FMH-5 Project documentation & README", "Mayank Heda"),
        ("#15", "FMH-15 Fix frontend container health check on IPv6", "Mayank Heda")
    ]
    add_lab_table(doc, pr_headers, pr_data, col_widths=[Inches(0.8), Inches(3.8), Inches(1.9)])

    add_body_p(doc, "The resulting Git history, abbreviated, illustrates the linear integration of feature branches into main:")
    add_code_terminal(doc, [
        "$ git log --oneline --graph",
        "* f19c6b8 Merge FMH-15: Fix frontend container health check on IPv6",
        "|\\",
        "| * e39ed34 FMH-15 Fix frontend healthcheck failing on IPv6 localhost",
        "|/",
        "* e93384e Merge FMH-14: Nagios host and container service checks",
        "* ac8168f Merge FMH-13: Prometheus metrics and Grafana dashboard",
        "* 24915a8 Merge FMH-10: Warden SLA analytics dashboard",
        "...",
        "* 5f97de3 Merge FMH-7: Jenkins multibranch CI pipeline",
        "|\\",
        "| * ca91510 FMH-7 Tag feature-branch images separately from main",
        "| * 358f3b6 FMH-7 Declarative Jenkins multibranch CI pipeline",
        "|/"
    ])

    add_body_p(doc, "At the end of Sprint 2, the commit at the head of main was tagged v1.0.0. Should a release need to be undone, git revert creates a non-destructive rollback commit without rewriting history.")

    add_heading_2(doc, "5.2 Containerisation with Docker (Experiment 2)")
    add_body_p(doc, "Both application tiers utilize multi-stage Docker builds. The API image runs as unprivileged user 'node' with health probes:")
    add_code_terminal(doc, [
        "FROM node:20-alpine AS builder",
        "WORKDIR /app",
        "COPY package*.json ./",
        "RUN npm ci --omit=dev",
        "COPY . .",
        "",
        "FROM node:20-alpine",
        "WORKDIR /app",
        "RUN addgroup -S app && adduser -S app -G app && mkdir -p /app/uploads && chown -R app:app /app",
        "USER app",
        "COPY --from=builder --chown=app:app /app /app",
        "HEALTHCHECK --interval=15s --timeout=5s --retries=3 \\",
        "  CMD wget -qO- http://localhost:5000/api/ops/health || exit 1",
        "EXPOSE 5000",
        "CMD [\"node\", \"server.js\"]"
    ])

    add_heading_2(doc, "5.3 Multi-Container Orchestration with Docker Compose (Experiment 3)")
    add_body_p(doc, "A single docker-compose.yml orchestrates all seven services within an isolated bridge network (fmh-network). Service startup is health-gated so that the API waits for MySQL and Redis:")

    cmp_headers = ["Service", "Image", "Host Port", "Notes"]
    cmp_data = [
        ("frontend", "fmh-frontend (custom)", "3000:80", "Nginx serving React and reverse proxying /api"),
        ("api", "fmh-api (custom)", "5001:5000", "Express API; starts when MySQL & Redis are healthy"),
        ("mysql", "mysql:8.0", "3307:3306", "ACID database; named volume mysql-data"),
        ("redis", "redis:7-alpine", "6379:6379", "Atomic token counter & cache"),
        ("prometheus", "prom/prometheus:latest", "9090:9090", "Scrapes /api/ops/metrics every 15s"),
        ("grafana", "grafana/grafana:latest", "3001:3000", "Provisioned 12-panel dashboard"),
        ("nagios", "jasonrivers/nagios:latest", "8080:80", "Active host & service availability checks")
    ]
    add_lab_table(doc, cmp_headers, cmp_data, col_widths=[Inches(1.2), Inches(1.8), Inches(1.0), Inches(2.5)])

    add_heading_2(doc, "5.4 Continuous Integration with Jenkins (Experiment 4)")
    add_body_p(doc, "Jenkins executes a multibranch declarative pipeline from Jenkinsfile. Dependencies are installed in parallel, followed by linting, automated Jest and Vitest suites, and Docker image packaging:")

    pipe_headers = ["Stage", "Steps", "Purpose"]
    pipe_data = [
        ("Checkout", "checkout scm; label build with FMH issue key", "Traceability linking commit to Jira story"),
        ("Install", "npm ci for backend and frontend in parallel", "Reproducible clean dependency installation"),
        ("Lint", "eslint on API and React frontend", "Static syntax and code quality verification"),
        ("Test", "Jest (40 API tests) and Vitest (6 UI tests)", "JUnit XML test reports published to Jenkins"),
        ("Build", "docker build backend and frontend images", "Images tagged with build version number"),
        ("Deploy*", "docker compose up -d --build (main branch only)", "Automated deployment to local Docker runtime"),
        ("Smoke test*", "curl health check verification on port 5001 & 3000", "Prove new release version is operational")
    ]
    add_lab_table(doc, pipe_headers, pipe_data, col_widths=[Inches(1.1), Inches(2.7), Inches(2.7)])

    add_figure(doc, os.path.join(SCREENSHOTS_DIR, "13_jenkins_pipeline.png"), "Figure 5.7: Jenkins multibranch automated CI/CD pipeline stage view (Build #2 SUCCESS across all 6 stages)", width=Inches(6.0))

    add_heading_2(doc, "5.5 Automated Deployment & Rollback (Experiment 5)")
    add_body_p(doc, "Merges into main trigger automated zero-downtime recreation of containers followed by bash smoke verification. If smoke testing fails, the post { failure } block immediately rolls back to the last recorded good version.")

    rel_headers = ["Build", "Version", "Delivered Issue", "Result", "Duration"]
    rel_data = [
        ("#1", "1.0.1", "FMH-7 CI multibranch pipeline", "SUCCESS", "18 s"),
        ("#2", "1.0.2", "FMH-12 Continuous deployment & smoke test", "SUCCESS", "32 s"),
        ("#3", "1.0.3", "FMH-9 Ticket history & feedback rating", "SUCCESS", "24 s"),
        ("#4", "1.0.4", "FMH-10 Warden SLA analytics dashboard", "SUCCESS", "21 s"),
        ("#5", "1.0.5", "FMH-11 Appliance hotspot charts", "SUCCESS", "23 s"),
        ("#6", "1.0.6", "FMH-13 Prometheus & Grafana monitoring", "SUCCESS", "22 s"),
        ("#7", "1.0.7", "FMH-14 Nagios host & service monitoring", "SUCCESS", "25 s"),
        ("#8", "1.0.8", "FMH-5 Project documentation & README", "SUCCESS", "19 s"),
        ("#9", "1.0.9", "FMH-15 Frontend health check IPv6 fix", "SUCCESS", "20 s")
    ]
    add_lab_table(doc, rel_headers, rel_data, col_widths=[Inches(0.8), Inches(0.9), Inches(2.8), Inches(1.1), Inches(0.9)])

    add_heading_2(doc, "5.6 Monitoring (Experiment 7)")
    add_body_p(doc, "Observability pairs the time-series metric model of Prometheus/Grafana with the active state-checking model of Nagios. Prometheus scrapes operational metrics from the Express backend, while Grafana visualizes the live 12-panel dashboard displaying both warden business stats and infrastructure health metrics:")

    add_figure(doc, os.path.join(SCREENSHOTS_DIR, "08_prometheus_targets.png"), "Figure 5.8: Prometheus active scrape targets status (State: UP)", width=Inches(5.6))
    add_figure(doc, os.path.join(SCREENSHOTS_DIR, "09_prometheus_alerts.png"), "Figure 5.9: Prometheus configured SLA alert rules", width=Inches(5.6))
    
    # 10_grafana_dashboard.png - The high resolution 12-panel dashboard
    add_figure(doc, os.path.join(SCREENSHOTS_DIR, "10_grafana_dashboard.png"), "Figure 5.10: Grafana 12-panel live system observability dashboard (Business SLA row & Infrastructure health row)", width=Inches(5.8))
    
    add_figure(doc, os.path.join(SCREENSHOTS_DIR, "11_nagios_services.png"), "Figure 5.11: Nagios service checks monitoring status", width=Inches(5.6))
    add_figure(doc, os.path.join(SCREENSHOTS_DIR, "12_nagios_hosts.png"), "Figure 5.12: Nagios host state matrix", width=Inches(5.6))

    # =========================================================================
    # CHAPTER 6: TESTING AND VERIFICATION
    # =========================================================================
    doc.add_page_break()
    add_heading_1(doc, "6. Testing")

    add_heading_2(doc, "6.1 Automated Tests")
    add_body_p(doc, "API tests utilize Supertest to send HTTP requests to Express with an in-memory Map store, verifying routing, authentication, and validation in milliseconds without database dependencies.")

    tst_headers = ["Suite", "Tests", "What is verified"]
    tst_data = [
        ("auth.test.js", "8", "Registration, duplicate email (409), password hashing, login, /me, JWT validation"),
        ("complaints.test.js", "12", "Raise complaint, IST token sequence, cancel if RAISED, cannot cancel ACCEPTED, 1-5 feedback"),
        ("staff.test.js", "8", "Priority queue ordering (Critical first), accept, start, resolve with notes, role 403 guard"),
        ("admin.test.js", "8", "Warden metrics calculation, category aggregates, staff performance table, role escalation"),
        ("ops.test.js", "4", "Health check UP/DOWN (503), Prometheus /metrics format, uptime verification"),
        ("lib.test.js (frontend)", "6", "Time-ago calculation, token badge formatting, severity colors, stat aggregations")
    ]
    add_lab_table(doc, tst_headers, tst_data, col_widths=[Inches(1.5), Inches(0.8), Inches(4.2)])

    add_body_p(doc, "Total: 46 automated tests (40 Backend Jest + 6 Frontend Vitest), 100% passing at 92.9% statement coverage.")

    add_heading_2(doc, "6.2 Load Simulation")
    add_body_p(doc, "A load simulation script (load-test.mjs) simulated 18 concurrent students filing tickets during morning hours, producing 245 complaints in four minutes:")

    ld_headers = ["Measure", "Value"]
    ld_data = [
        ("Complaints raised", "245 in 4 minutes"),
        ("Invalid submissions rejected (4xx)", "24"),
        ("Complaints resolved by technicians", "245 / 245"),
        ("Peak request throughput", "6 requests / second"),
        ("Median (p50) API response latency", "3.5 ms"),
        ("95th percentile (p95) latency", "18 ms steady (one 400 ms startup spike)"),
        ("Server errors (5xx)", "0")
    ]
    add_lab_table(doc, ld_headers, ld_data, col_widths=[Inches(3.5), Inches(3.0)])

    # =========================================================================
    # CHAPTER 7: RESULTS AND DISCUSSION
    # =========================================================================
    doc.add_page_break()
    add_heading_1(doc, "7. Results and Discussion")

    add_heading_2(doc, "7.1 Outcomes against Objectives")
    res_headers = ["Objective", "Outcome"]
    res_data = [
        ("Student filing & live tracking", "Delivered (FMH-1, FMH-2, FMH-8, FMH-9)"),
        ("Staff priority maintenance queue", "Delivered (FMH-4)"),
        ("Warden SLA executive dashboard", "Delivered (FMH-10, FMH-11)"),
        ("Scrum planning with points and DoD", "15 issues, 29 story points, 2 sprints, DoD linked to builds"),
        ("Branch per issue, PR-only merges", "15 pull requests; each commit carries issue key"),
        ("Containerised stack, one command", "7 services; docker compose up -d starts full cluster"),
        ("Automated CI on every branch", "19 builds across 11 branches, all SUCCESS, typically 17–24 s"),
        ("Automated deployment with rollback", "9 releases (1.0.1–1.0.9) deployed and smoke-tested automatically"),
        ("Monitoring over time and of state", "Prometheus (4 alerts) + Grafana (12 panels) + Nagios (7 services)")
    ]
    add_lab_table(doc, res_headers, res_data, col_widths=[Inches(2.5), Inches(4.0)])

    add_heading_2(doc, "7.2 The Feedback Loop in Practice")
    add_body_p(doc, "The clearest demonstration of DevOps practices working together occurred after release 1.0.8. docker compose ps reported the frontend container as unhealthy although requests succeeded. Inspection revealed that inside the Alpine image localhost resolved first to IPv6 ::1, while Nginx listened only on IPv4, causing wget health checks to fail. The defect was raised as bug FMH-15, fixed on branch fix/FMH-15-frontend-healthcheck by targeting 127.0.0.1, verified by Jenkins CI, merged via PR #15, and deployed automatically as release 1.0.9, after which the container reported healthy. The issue was detected, patched, tested, and released in one continuous iteration.")

    add_heading_2(doc, "7.3 Challenges and Resolutions")
    ch_headers = ["Challenge", "Resolution"]
    ch_data = [
        ("Feature-branch builds overwrote release image tags", "Separated tag schemes: 1.0.n for main, 0.0.n-<branch> for feature branches"),
        ("Jenkins on localhost cannot receive GitHub webhooks", "Configured multibranch polling every minute; posted results back as commit statuses"),
        ("Port 5000 reserved by macOS AirPlay; 3306 in use", "API published on 5001, MySQL on 3307, Nagios on 8080"),
        ("Nagios image amd64 running on Apple Silicon", "Platform pinned to linux/amd64 in Compose; widened HTTP check timeouts")
    ]
    add_lab_table(doc, ch_headers, ch_data, col_widths=[Inches(2.8), Inches(3.7)])

    # =========================================================================
    # CHAPTER 8: CONCLUSION AND FUTURE SCOPE
    # =========================================================================
    doc.add_page_break()
    add_heading_1(doc, "8. Conclusion and Future Scope")

    add_heading_2(doc, "8.1 Conclusion")
    add_body_p(doc, "FixMyHostel successfully resolves hostel maintenance bottlenecks: students submit geo-tagged complaints with photo evidence, receive atomic daily tokens, and track repairs live, while maintenance staff work a priority queue and the warden monitors turnaround SLAs. More fundamentally, the project demonstrates how the first seven experiments of the ASD&D syllabus operate as one unified, resilient system.")
    add_body_p(doc, "Planning the work as a Scrum backlog produced issue keys that linked requirements to code and releases. Docker Compose transformed the multi-tier application into a reproducible artifact. The Jenkins multibranch pipeline ensured continuous verification, while automated deployment and rollback eliminated manual release errors. Finally, Prometheus, Grafana, and Nagios closed the loop by providing live operational observability.")

    add_heading_2(doc, "8.2 Future Scope")
    fs_points = [
        "• Push notifications via WebSockets or Web Push API, replacing polling on the student tracking page.",
        "• Turnaround time prediction based on historical category resolution averages.",
        "• Deployment to a Kubernetes cluster with Helm charts and rolling updates.",
        "• Automated Alertmanager dispatching critical server alerts to Telegram or Slack channels."
    ]
    for fp in fs_points:
        add_body_p(doc, fp)

    # =========================================================================
    # APPENDIX: RUNNING THE PROJECT (NO REFERENCES AT THE END)
    # =========================================================================
    doc.add_page_break()
    add_heading_1(doc, "Appendix: Running the Project")
    add_body_p(doc, "To run the complete 7-service FixMyHostel stack locally:")
    add_code_terminal(doc, [
        "# 1. Start all 7 services with Docker Compose",
        "docker compose up -d --build",
        "",
        "# 2. Verify all containers are healthy",
        "docker compose ps",
        "",
        "# 3. Run automated backend test suites (40 tests)",
        "cd api && npm test",
        "",
        "# 4. Run frontend test suites (6 tests)",
        "cd ../frontend && npm test",
        "",
        "# 5. Execute automated smoke verification",
        "bash api/scripts/smoke-test.sh",
        "",
        "# 6. Run morning rush load simulation (245 tickets)",
        "node api/scripts/load-test.mjs"
    ])

    doc.save(DOCX_PATH)
    print("DOCX built successfully at:", DOCX_PATH)

if __name__ == "__main__":
    build_lab_manual_document()
