from datetime import datetime, timezone, timedelta
from app.models import (
    Event, Sponsor, Agreement, Commitment, SourceDocument, Deliverable,
    BudgetLine, Task, Dependency, MemoryFact, AuditLog
)

def seed_database(db):
    # Check if already seeded
    if db.query(Event).first():
        return

    now = datetime.now(timezone.utc)
    
    # 1. Event
    event = Event(
        name="INNOVISION 2026",
        tagline="College Annual Technology and Cultural Fest",
        date="2026-03-20 to 2026-03-22",
        venue="Campus Grounds & Main Auditorium",
        status="planning",
        total_budget=1000000.0,
    )
    db.add(event)
    db.flush()

    # 2. Source Documents (Simulated connectors: Emails, Agreements)
    doc_novatech_original = SourceDocument(
        source_type="email",
        title="NovaTech Sponsorship Agreement Confirmation — Innovision 2026",
        sender="ravi.mehta@novatech.in",
        content="""Dear Innovision 2026 Organizing Committee,

We are delighted to confirm NovaTech Pvt Ltd as a Gold Sponsor for Innovision 2026.
As discussed with the corporate relations team, our sponsorship package encompasses:
1. Financial contribution of ₹2,00,000 (INR Two Lakhs).
2. Provision of 500 premium delegate merchandise kits (branded attendee backpacks, notebook, metal bottle).
3. Deliverables expected: Main stage logo placement, 3 dedicated social media posts, 3x3m exhibition booth in Tech Hall A, and inclusion in all digital/print promotional materials.

We look forward to an impactful collaboration.

Warm regards,
Ravi Mehta
Head of Corporate Communications & Marketing
NovaTech Pvt Ltd""",
        received_at=now - timedelta(days=20),
        processing_status="processed",
        extracted_data={
            "sponsor": "NovaTech Pvt Ltd",
            "tier": "Gold",
            "financial_commitment": 200000.0,
            "merchandise_kits": 500,
            "status": "confirmed"
        },
        is_demo=True
    )
    db.add(doc_novatech_original)

    doc_novatech_revision = SourceDocument(
        source_type="email",
        title="URGENT: Revisions to Sponsorship Allocation — NovaTech Pvt Ltd",
        sender="ravi.mehta@novatech.in",
        content="""Due to changes in our internal marketing budget, we can only contribute ₹50,000 instead of our previously committed ₹2,00,000. We will also be unable to provide the 500 merchandise kits discussed earlier.""",
        received_at=now - timedelta(hours=2),
        processing_status="unprocessed",
        is_demo=True
    )
    db.add(doc_novatech_revision)

    doc_techcorp = SourceDocument(
        source_type="document",
        title="Title Sponsorship Master Contract — TechCorp India",
        sender="partnerships@techcorp.in",
        content="Title sponsorship contract executed for ₹3,00,000 cash grant, naming rights to Hackathon arena and Grand Stage.",
        received_at=now - timedelta(days=30),
        processing_status="processed",
        is_demo=True
    )
    db.add(doc_techcorp)

    doc_digitaldynamics = SourceDocument(
        source_type="message",
        title="Slack Confirmation: Digital Dynamics Platinum Grant",
        sender="priya.sharma@digitaldynamics.io",
        content="Digital Dynamics board approved ₹1,50,000 commitment for Platinum tier.",
        received_at=now - timedelta(days=15),
        processing_status="processed",
        is_demo=True
    )
    db.add(doc_digitaldynamics)
    db.flush()

    # 3. 8 Sponsors
    sponsors_data = [
        ("TechCorp India", "Technology", "Title", "Sunil Deshmukh", "partnerships@techcorp.in", "+91 98201 11223", "active", "low", "Confirmed Title Partner. Naming rights granted."),
        ("InnovateTech Solutions", "Software / Cloud", "Platinum", "Ananya Verma", "ananya@innovatetech.io", "+91 98450 33445", "active", "low", "First tranche received. Booth confirmed."),
        ("Digital Dynamics", "FinTech", "Platinum", "Priya Sharma", "priya.sharma@digitaldynamics.io", "+91 97110 55667", "active", "low", "MoU executed. 50% advance received."),
        ("NovaTech Pvt Ltd", "Hardware & IoT", "Gold", "Ravi Mehta", "ravi.mehta@novatech.in", "+91 99203 77889", "active", "high", "Midway reduction email received. Under review."),
        ("CloudNine Systems", "DevOps & Cloud", "Gold", "Vikram Sen", "vikram@cloudnine.org", "+91 98300 22334", "active", "low", "100% payment processed."),
        ("DataVerse Analytics", "AI / Data Science", "Gold", "Sneha Roy", "sneha.r@dataverse.ai", "+91 99401 66778", "active", "medium", "Deliverables review pending."),
        ("StartupHub", "Incubator / VC", "Silver", "Arun Kulkarni", "arun@startuphub.co", "+91 98112 88990", "active", "low", "Sponsoring incubation awards."),
        ("GreenTech Innovations", "CleanTech", "Silver", "Farhan Akhtar", "farhan@greentech.in", "+91 98765 43210", "active", "low", "Sustainability track sponsor.")
    ]

    sponsor_records = {}
    for name, cat, tier, cname, cmail, cphone, st, risk, notes in sponsors_data:
        sp = Sponsor(
            event_id=event.id,
            name=name,
            category=cat,
            tier=tier,
            contact_name=cname,
            contact_email=cmail,
            contact_phone=cphone,
            status=st,
            risk_level=risk,
            notes=notes,
        )
        db.add(sp)
        db.flush()
        sponsor_records[name] = sp

    # 4. Agreements
    agreements = [
        Agreement(
            sponsor_id=sponsor_records["TechCorp India"].id,
            title="Title Sponsorship Master Agreement",
            content="Official Title Partner agreement for Innovision 2026. Mutual commitments, branding rights, ₹3,00,000 grant.",
            agreed_date="2026-01-15",
            status="active",
            version=1,
            source_document_id=doc_techcorp.id
        ),
        Agreement(
            sponsor_id=sponsor_records["NovaTech Pvt Ltd"].id,
            title="Gold Sponsorship Master Agreement — NovaTech",
            content="Official Gold Sponsorship agreement: ₹2,00,000 direct funding + 500 attendee merchandise kits.",
            agreed_date="2026-02-01",
            status="active",
            version=1,
            source_document_id=doc_novatech_original.id
        ),
        Agreement(
            sponsor_id=sponsor_records["Digital Dynamics"].id,
            title="Platinum Sponsorship Agreement — Digital Dynamics",
            content="Platinum Sponsorship agreement for ₹1,50,000 grant with FinTech track branding.",
            agreed_date="2026-02-10",
            status="active",
            version=1,
            source_document_id=doc_digitaldynamics.id
        )
    ]
    for ag in agreements:
        db.add(ag)
    db.flush()

    # 5. Commitments
    commitments_data = [
        # Sponsor, type, desc, orig, curr, proposed, unit, status, doc_id
        ("TechCorp India", "financial", "Title Sponsorship Cash Grant", 300000.0, 300000.0, 300000.0, "INR", "confirmed", doc_techcorp.id),
        ("InnovateTech Solutions", "financial", "Platinum Sponsorship Cash Grant", 150000.0, 150000.0, 150000.0, "INR", "confirmed", None),
        ("Digital Dynamics", "financial", "Platinum Sponsorship Cash Grant", 150000.0, 150000.0, 150000.0, "INR", "confirmed", doc_digitaldynamics.id),
        ("NovaTech Pvt Ltd", "financial", "Gold Sponsorship Financial Commitment", 200000.0, 200000.0, 50000.0, "INR", "revision_pending", doc_novatech_original.id),
        ("NovaTech Pvt Ltd", "merchandise", "500 Delegate Premium Merchandise Kits", 500.0, 500.0, 0.0, "kits", "revision_pending", doc_novatech_original.id),
        ("CloudNine Systems", "financial", "Gold Sponsorship Cash Grant", 100000.0, 100000.0, 100000.0, "INR", "confirmed", None),
        ("DataVerse Analytics", "financial", "Gold Sponsorship Cash Grant", 75000.0, 75000.0, 75000.0, "INR", "confirmed", None),
        ("StartupHub", "financial", "Silver Sponsorship Cash Grant", 50000.0, 50000.0, 50000.0, "INR", "confirmed", None),
        ("GreenTech Innovations", "financial", "Silver Sponsorship Cash Grant", 25000.0, 25000.0, 25000.0, "INR", "confirmed", None)
    ]

    commitment_records = {}
    for sp_name, c_type, desc, orig, curr, prop, unit, st, doc_id in commitments_data:
        c = Commitment(
            sponsor_id=sponsor_records[sp_name].id,
            commitment_type=c_type,
            description=desc,
            original_value=orig,
            current_approved_value=curr,
            proposed_value=prop,
            unit=unit,
            status=st,
            source_document_id=doc_id
        )
        db.add(c)
        db.flush()
        commitment_records[f"{sp_name}_{c_type}"] = c

    # 6. Budget Lines (Totaling ₹10,00,000)
    budgets = [
        BudgetLine(event_id=event.id, category="Venue & Infrastructure", subcategory="Main Stage, Sound, Lighting & Seating", allocated_amount=250000.0, committed_amount=250000.0, spent_amount=120000.0, funding_source="TechCorp India", status="active", notes="Key vendor contract signed."),
        BudgetLine(event_id=event.id, category="Technical Equipment", subcategory="LED Displays, Streaming Rig & Cloud Servers", allocated_amount=150000.0, committed_amount=150000.0, spent_amount=80000.0, funding_source="InnovateTech Solutions", status="active", notes="Streaming gear locked."),
        BudgetLine(event_id=event.id, category="Marketing & Promotion", subcategory="Banners, Hoardings, Social Ads & PR", allocated_amount=100000.0, committed_amount=100000.0, spent_amount=45000.0, funding_source="Digital Dynamics", status="active", notes="Digital campaigns live."),
        BudgetLine(event_id=event.id, category="Prizes & Awards", subcategory="Hackathon Cash Prizes & Trophies", allocated_amount=150000.0, committed_amount=150000.0, spent_amount=50000.0, funding_source="CloudNine / DataVerse", status="active", notes="Cash awards pool."),
        BudgetLine(event_id=event.id, category="Food & Hospitality", subcategory="Judge & Guest Catering, VIP Lounges", allocated_amount=150000.0, committed_amount=150000.0, spent_amount=30000.0, funding_source="NovaTech Pvt Ltd", status="active", notes="Funded primarily from NovaTech Gold commitment."),
        BudgetLine(event_id=event.id, category="Merchandise & Kits", subcategory="Delegate kits, Badges & T-shirts", allocated_amount=100000.0, committed_amount=100000.0, spent_amount=20000.0, funding_source="NovaTech In-Kind + Silver Sponsors", status="active", notes="Dependent on NovaTech 500 kit contribution."),
        BudgetLine(event_id=event.id, category="Logistics & Transport", subcategory="Shuttle Services & Material Shipping", allocated_amount=50000.0, committed_amount=50000.0, spent_amount=15000.0, funding_source="StartupHub", status="active", notes="Campus buses arranged."),
        BudgetLine(event_id=event.id, category="Contingency Reserve", subcategory="Emergency & Unforeseen Overruns", allocated_amount=50000.0, committed_amount=50000.0, spent_amount=5000.0, funding_source="GreenTech Innovations", status="active", notes="Reserve buffer.")
    ]
    for b in budgets:
        db.add(b)
    db.flush()

    # 7. Deliverables
    deliverables_data = [
        ("NovaTech Pvt Ltd", "Logo Placement on Main Stage", "logo_placement", "Prominent logo display on main auditorium backdrop & podium", "at_risk", "2026-03-10", "Design Lead (Creative Dept)", "doc_novatech_original"),
        ("NovaTech Pvt Ltd", "Three Social Media Promotional Posts", "social_media", "Dedicated feature posts on Instagram & LinkedIn with product tag", "at_risk", "2026-03-12", "Marketing Coordinator", "doc_novatech_original"),
        ("NovaTech Pvt Ltd", "Sponsor Exhibition Booth", "booth", "3x3m exhibition stall in Hall A with electrical & WiFi setup", "at_risk", "2026-03-18", "Logistics Head", "doc_novatech_original"),
        ("NovaTech Pvt Ltd", "Brochure & Event Material Acknowledgement", "acknowledgement", "Full-page company profile in attendee handbook", "at_risk", "2026-03-08", "Print Coordinator", "doc_novatech_original"),
        ("TechCorp India", "Main Stage Naming Rights", "naming_rights", "TechCorp Arena title on all stages & signage", "completed", "2026-02-28", "Organising Secretary", "doc_techcorp"),
        ("InnovateTech Solutions", "Hackathon Platform Branding", "digital_branding", "Banner on submission portal and live leaderboard", "in_progress", "2026-03-05", "Technical Team Lead", "InnovateTech MoU"),
        ("Digital Dynamics", "FinTech Track Sponsorship Branding", "track_branding", "Custom stage banners for FinTech track and certificate co-branding", "pending", "2026-03-15", "Corporate Outreach", "Digital Dynamics MoU")
    ]

    deliverable_records = {}
    for sp_name, title, d_type, desc, st, dline, owner, src in deliverables_data:
        dl = Deliverable(
            sponsor_id=sponsor_records[sp_name].id,
            event_id=event.id,
            title=title,
            deliverable_type=d_type,
            description=desc,
            status=st,
            deadline=dline,
            owner=owner,
            source_reference=src
        )
        db.add(dl)
        db.flush()
        deliverable_records[title] = dl

    # 8. Tasks
    tasks_data = [
        ("Design and print main stage backdrop with NovaTech logo", "Creative", "Kavita S. (Design Lead)", "2026-03-09", "at_risk", "high", "deliverable", deliverable_records["Logo Placement on Main Stage"].id),
        ("Schedule 3 social media promotional rollouts for NovaTech", "Marketing", "Aman Verma (Socials)", "2026-03-11", "at_risk", "medium", "deliverable", deliverable_records["Three Social Media Promotional Posts"].id),
        ("Assign and demarcate Hall A Booth 12 for NovaTech Expo", "Logistics", "Rohan P. (Stall Manager)", "2026-03-17", "at_risk", "medium", "deliverable", deliverable_records["Sponsor Exhibition Booth"].id),
        ("Send attendee kit count to packaging vendor (500 NovaTech kits)", "Logistics", "Deepak Gupta (Vendor Spoc)", "2026-03-05", "at_risk", "critical", "commitment", commitment_records["NovaTech Pvt Ltd_merchandise"].id),
        ("Rebalance Food & Hospitality catering budget with treasurer", "Finance", "Nikhil Rao (Treasurer)", "2026-03-06", "pending", "high", "budget_line", budgets[4].id),
        ("Confirm AV and streaming contracts for Hackathon arena", "Technical", "Aarav Patel (Tech Head)", "2026-03-08", "in_progress", "high", "budget_line", budgets[1].id),
        ("Print delegate identity badges and lanyards", "Operations", "Siddharth J.", "2026-03-14", "pending", "low", "event", event.id),
        ("Execute stage lighting and sound rehearsal", "Production", "Vikram Malhotra", "2026-03-19", "pending", "medium", "event", event.id),
        ("Collect second tranche payment from Digital Dynamics", "Sponsorship", "Neha Mehta (Sponsorship Lead)", "2026-03-10", "in_progress", "high", "sponsor", sponsor_records["Digital Dynamics"].id),
        ("Review and finalize hackathon judge honorarium pool", "Finance", "Nikhil Rao (Treasurer)", "2026-03-07", "completed", "medium", "budget_line", budgets[3].id),
        ("Sign off on student registration platform load test", "Technical", "Aarav Patel", "2026-03-04", "completed", "high", "event", event.id),
        ("Prepare contingency backup power and UPS battery setups", "Logistics", "Rohan P.", "2026-03-16", "pending", "high", "budget_line", budgets[7].id)
    ]

    task_records = []
    for title, dept, owner, dline, st, pri, rel_type, rel_id in tasks_data:
        t = Task(
            event_id=event.id,
            title=title,
            department=dept,
            owner=owner,
            deadline=dline,
            status=st,
            priority=pri,
            related_entity_type=rel_type,
            related_entity_id=rel_id
        )
        db.add(t)
        task_records.append(t)
    db.flush()

    # 9. Dependencies (Knowledge Graph)
    dependencies_data = [
        ("sponsor", sponsor_records["NovaTech Pvt Ltd"].id, "agreement", agreements[1].id, "SPONSOR_HAS_AGREEMENT", "NovaTech executed Gold Agreement", "Agreement #2"),
        ("agreement", agreements[1].id, "commitment", commitment_records["NovaTech Pvt Ltd_financial"].id, "AGREEMENT_CONTAINS_COMMITMENT", "Agreement specifies ₹2,00,000 cash grant", "Clause 3.1"),
        ("agreement", agreements[1].id, "commitment", commitment_records["NovaTech Pvt Ltd_merchandise"].id, "AGREEMENT_CONTAINS_COMMITMENT", "Agreement specifies 500 kit contribution", "Clause 3.2"),
        ("commitment", commitment_records["NovaTech Pvt Ltd_financial"].id, "budget_line", budgets[4].id, "COMMITMENT_AFFECTS_BUDGET", "Food & Hospitality depends on ₹1.5L from NovaTech funding", "Budget Allocation sheet"),
        ("commitment", commitment_records["NovaTech Pvt Ltd_financial"].id, "budget_line", budgets[5].id, "COMMITMENT_AFFECTS_BUDGET", "Merchandise funding surplus depends on NovaTech", "Budget Allocation sheet"),
        ("sponsor", sponsor_records["NovaTech Pvt Ltd"].id, "deliverable", deliverable_records["Logo Placement on Main Stage"].id, "SPONSOR_HAS_DELIVERABLE", "Gold tier logo on main stage backdrop", "Sponsorship Matrix"),
        ("sponsor", sponsor_records["NovaTech Pvt Ltd"].id, "deliverable", deliverable_records["Three Social Media Promotional Posts"].id, "SPONSOR_HAS_DELIVERABLE", "3 scheduled posts for Gold partner", "Sponsorship Matrix"),
        ("sponsor", sponsor_records["NovaTech Pvt Ltd"].id, "deliverable", deliverable_records["Sponsor Exhibition Booth"].id, "SPONSOR_HAS_DELIVERABLE", "Booth 12 reserved in Tech Hall A", "Sponsorship Matrix"),
        ("sponsor", sponsor_records["NovaTech Pvt Ltd"].id, "deliverable", deliverable_records["Brochure & Event Material Acknowledgement"].id, "SPONSOR_HAS_DELIVERABLE", "1-page handbook feature", "Sponsorship Matrix"),
        ("deliverable", deliverable_records["Logo Placement on Main Stage"].id, "task", task_records[0].id, "DELIVERABLE_REQUIRES_TASK", "Requires backdrop design & printing", "Task Tracker"),
        ("deliverable", deliverable_records["Three Social Media Promotional Posts"].id, "task", task_records[1].id, "DELIVERABLE_REQUIRES_TASK", "Requires marketing rollout", "Task Tracker"),
        ("deliverable", deliverable_records["Sponsor Exhibition Booth"].id, "task", task_records[2].id, "DELIVERABLE_REQUIRES_TASK", "Requires stall demarcation", "Task Tracker"),
        ("commitment", commitment_records["NovaTech Pvt Ltd_merchandise"].id, "task", task_records[3].id, "COMMITMENT_REQUIRES_TASK", "Vendor order depends on kit arrival", "Task Tracker"),
        ("budget_line", budgets[4].id, "task", task_records[4].id, "BUDGET_AFFECTS_TASK", "Treasurer review of food line item", "Finance Plan")
    ]

    for s_type, s_id, t_type, t_id, r_type, desc, src in dependencies_data:
        dep = Dependency(
            source_entity_type=s_type,
            source_entity_id=s_id,
            target_entity_type=t_type,
            target_entity_id=t_id,
            relationship_type=r_type,
            description=desc,
            source_reference=src,
            confidence=1.0,
            status="active"
        )
        db.add(dep)
    db.flush()

    # 10. Memory Facts
    facts_data = [
        ("sponsor", sponsor_records["NovaTech Pvt Ltd"].id, "historical_commitment", "original_financial", "200000", "doc_novatech_original", 1.0, "confirmed"),
        ("sponsor", sponsor_records["NovaTech Pvt Ltd"].id, "historical_commitment", "original_merchandise", "500_kits", "doc_novatech_original", 1.0, "confirmed"),
        ("sponsor", sponsor_records["NovaTech Pvt Ltd"].id, "alias", "entity_name", "Nova Technologies", "CRM Record #412", 0.95, "confirmed"),
        ("sponsor", sponsor_records["NovaTech Pvt Ltd"].id, "alias", "entity_name", "NovaTech", "Email thread header", 0.99, "confirmed"),
        ("sponsor", sponsor_records["NovaTech Pvt Ltd"].id, "proposed_revision", "proposed_financial", "50000", "doc_novatech_revision", 1.0, "proposed"),
        ("sponsor", sponsor_records["NovaTech Pvt Ltd"].id, "proposed_revision", "proposed_merchandise", "0_kits", "doc_novatech_revision", 1.0, "proposed"),
        ("sponsor", sponsor_records["NovaTech Pvt Ltd"].id, "conflict_detection", "financial_discrepancy", "₹1,50,000 delta between confirmed agreement and email proposal", "Internal Audit", 1.0, "conflicting"),
        ("budget", budgets[4].id, "funding_dependency", "Food & Hospitality", "NovaTech cash grant funds 80% of catering contracts", "Budget Model", 1.0, "confirmed")
    ]

    for e_type, e_id, f_type, key, val, src, conf, st in facts_data:
        mf = MemoryFact(
            entity_type=e_type,
            entity_id=e_id,
            fact_type=f_type,
            key=key,
            value=val,
            source_reference=src,
            confidence=conf,
            status=st
        )
        db.add(mf)
    db.flush()

    # 11. Initial Audit Logs
    audit_entries = [
        ("System", "SEED_INITIALIZATION", "event", event.id, "Demo environment initialized for INNOVISION 2026", None, {"event": event.name, "budget": 1000000.0}, "Seed Service"),
        ("Ravi Mehta (NovaTech)", "SPONSOR_AGREEMENT_SIGNED", "sponsor", sponsor_records["NovaTech Pvt Ltd"].id, "NovaTech signed Gold Tier agreement (₹2,00,000 + 500 kits)", None, {"financial": 200000, "kits": 500}, "Email: doc_novatech_original"),
        ("Mail Connector", "INCOMING_COMMUNICATION", "source_document", doc_novatech_revision.id, "Received sponsorship revision request from ravi.mehta@novatech.in", None, {"subject": doc_novatech_revision.title}, "IMAP Poller")
    ]

    for actor, act, e_type, e_id, desc, before, after, src in audit_entries:
        log = AuditLog(
            actor=actor,
            action=act,
            entity_type=e_type,
            entity_id=e_id,
            description=desc,
            before_value=before,
            after_value=after,
            source=src
        )
        db.add(log)

    db.commit()
