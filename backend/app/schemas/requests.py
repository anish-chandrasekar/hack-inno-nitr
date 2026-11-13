from pydantic import BaseModel


class IngestRequest(BaseModel):
    source_type: str = "email"
    title: str = ""
    sender: str = ""
    content: str = ""
    raw_content: str | None = None


class ApprovalRequest(BaseModel):
    decision: str = "approved"
    notes: str | None = None


class RunInvestigationRequest(BaseModel):
    source_document_id: int


class QueryRequest(BaseModel):
    query: str
    entity_type: str | None = None


class CreateSponsorRequest(BaseModel):
    name: str
    category: str = "Technology"
    tier: str = "Gold"
    contact_name: str = ""
    contact_email: str = ""
    contact_phone: str = ""
    commitment_amount: float = 0.0
    notes: str | None = None
