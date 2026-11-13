# SECOND BRAIN
## The Context-Aware AI Event Operations and Decision Intelligence Platform
### *HackInnovision 2026 | Track B: Agentic Workflow Automation & Context Engineering*

> **"One change. Complete context. Intelligent execution."**

---

## 🌟 Executive Summary

**SECOND BRAIN** is an operational intelligence and multi-agent orchestration platform built for high-stakes event management (demonstrated with **INNOVISION 2026**, a ₹10,00,000 college technology and cultural festival).

Unlike ordinary chatbots or static CRUD dashboards, SECOND BRAIN understands **how information is connected across an entire organization**. When a critical sponsor unexpectedly cuts their financial commitment and withdraws delegate merchandise kits midway through event preparation, SECOND BRAIN instantly traverses the organizational dependency graph to assess cascading risks, deterministically recalculates budget deficits, formulates adaptive recovery plans, and gates all high-consequence operations through human authorization before idempotent, independently-verified execution.

---

## 🏆 Key Differentiators (Why We Win Track B)

### Differentiator A: Contextual Organizational Memory
- Persistent relational context (SQLAlchemy + SQLite) rather than ephemeral prompt windows.
- Entity resolution engine recognizing aliases (e.g. `NovaTech` ↔ `NovaTech Pvt Ltd` ↔ `Nova Technologies`).
- Full fact provenance tracking source documents, timestamps, and contract versions.
- Explicit conflict detection between incoming messages and signed contracts (e.g. Agreement Clause 3.1 vs Email revision).

### Differentiator B: Cascading Change-Impact Analysis (Flagship)
- Real-time typed dependency graph powered by `@xyflow/react`.
- Traverses 5 hierarchical operational tiers:
  `Sponsor` → `Agreement` → `Commitment` → `Budget Allocation` → `Deliverables` → `Operational Tasks`.
- Differentiates **Direct Impact** (red), **Indirect Impact** (amber), and **Unaffected** components.
- Interactive node inspector revealing live contract clauses, vendor deadlines, and department leads.

### Differentiator C: Adaptive Recovery Replanning
- The Planning Agent does not merely report problems; it formulates deterministic recovery paths:
  - **Plan A: Replacement Sponsor Acquisition** (Fast-track waitlisted hardware/IoT co-sponsors).
  - **Plan B: Strategic Expenditure Optimization** (Absorb shortfall by trimming catering buffer & contingency).
  - **Plan C: Sponsor Benefit Renegotiation & Tier Downgrade** (Reclassify to Silver tier at ₹50,000, remove backdrop logo).
- Pure deterministic Python calculations for all financial figures (no LLM arithmetic hallucinations).

### Differentiator D: Reliable, Verified Execution
- **Strict Human-in-the-Loop Policy**: Consequential external and financial mutations require explicit approval.
- **Idempotency Keys**: Actions (`IDEM_<proposal_id>_<action_type>`) prevent duplicate execution.
- **Resilient Retry Handling**: Simulates and recovers from transient tool failures (e.g., spreadsheet sync timeouts).
- **Independent Verification Agent**: Reads back database state directly after execution to ensure invariants hold.
- **Immutable Audit Trail**: End-to-end provenance linking the trigger email, agent reasoning, human approval, and database snapshot.

---

## 🤖 The 6 Specialized Agents

| Agent | Responsibility | Core Tools |
| :--- | :--- | :--- |
| **Communication Agent** | Parses unstructured emails/documents, extracts facts, classifies changes, flags ambiguity | `entity_extractor`, `financial_parser` |
| **Knowledge Agent** | Queries organizational context, matches sponsors, queries agreements, identifies contract conflicts | `entity_resolver`, `knowledge_graph_query`, `conflict_detector` |
| **Planning Agent** | Traverses dependency graph, computes budget differences, synthesizes recovery plans, stages proposals | `cascade_simulator`, `recovery_planner`, `proposal_generator` |
| **Execution Agent** | Executes authorized proposals idempotently, takes before/after state snapshots, logs audit records | `state_mutator`, `idempotency_guard`, `tool_caller` |
| **Verification Agent** | Reads back modified records directly from database, checks invariants, detects discrepancies | `db_readback_verifier`, `invariant_checker` |
| **Coordinator Agent** | Manages state machine (`RECEIVED` → `EXTRACTING` → `RETRIEVING_CONTEXT` → `PLANNING` → `AWAITING_APPROVAL` → `EXECUTING` → `VERIFYING` → `COMPLETED`) | State machine orchestrator |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js 20+ & npm
- Python 3.10+
- Git

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend initializes SQLite and automatically seeds the complete **INNOVISION 2026** festival scenario.
- Backend API Docs: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Frontend UI: `http://localhost:5173`

---

## 🎬 8-Minute Hackathon Demonstration Script

1. **Minute 0–1: Problem Statement**  
   Open `http://localhost:5173`. Show the Overview Command Centre. Point out the ₹10,00,000 festival budget and 8 active institutional sponsors.
2. **Minute 1–2: Ingest Incoming Shock**  
   Navigate to **Inbox & Context Hub**. Select the incoming unapproved email from NovaTech:
   *"Due to changes in our internal marketing budget, we can only contribute ₹50,000 instead of our previously committed ₹2,00,000..."*
3. **Minute 2–3: Trigger AI Investigation**  
   Click **Trigger Second Brain Analysis**. Watch the Communication & Knowledge Agents parse entities and flag the ₹1,50,000 delta against the active signed agreement.
4. **Minute 3–5: Interactive Impact Studio (Flagship)**  
   Switch to **Impact Studio**. Demonstrate the live **React Flow Dependency Graph**. Show how a single sponsor commitment cut propagates downstream to Food & Hospitality catering budgets, main stage backdrop printing tasks, and delegate kit procurement.
5. **Minute 5–6: Adaptive Recovery Replanning**  
   Review **Plan A**, **Plan B**, and **Plan C** generated by the Planning Agent with real trade-offs and advantages.
6. **Minute 6–7: Human Approval & Verified Execution**  
   Navigate to **Approval Centre**. Highlight that high-risk actions are paused for human review. Click **Authorize & Execute**. Show how the Execution Agent applies changes idempotently and the Verification Agent reads back the database to confirm invariants.
7. **Minute 7–8: Execution & Audit Centre**  
   Show the verified execution log with unique idempotency keys, before/after state snapshots, and read-back validation proof.
