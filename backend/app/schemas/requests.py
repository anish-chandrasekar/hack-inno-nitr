from pydantic import BaseModel


class IngestRequest(BaseModel):
    source_type: str = "email"
    title: str = ""
    sender: str = ""
    content: str = ""
    raw_content: str | None = None


class ApprovalRequest(BaseModel):
    decision: str  # "approved" or "rejected"
    notes: str | None = None


class RunInvestigationRequest(BaseModel):
    source_document_id: int


class QueryRequest(BaseModel):
    query: str
    entity_type: str | None = None
