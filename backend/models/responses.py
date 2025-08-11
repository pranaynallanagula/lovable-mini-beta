from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class StartProjectResp(BaseModel):
    session_id: str
    plan: Dict[str, Any]

class GenerateStepResp(BaseModel):
    session_id: str
    component_name: str
    code: str
    explanation: Optional[str] = None
    remaining: List[str]
    validation_notes: Optional[List[str]] = None

class GeneratePreviewResp(BaseModel):
    preview_html: str
    generated_at: float