from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class StartProjectReq(BaseModel):
    idea: str
    preferred_stack: Optional[str] = None
    complexity: Optional[str] = "medium"  # simple, medium, complex
    template_id: Optional[str] = None

class GenerateStepReq(BaseModel):
    session_id: str
    component: Optional[str] = None
    include_explanation: Optional[bool] = True
    include_tests: Optional[bool] = False

class GeneratePreviewReq(BaseModel):
    prompt: str
    style_preference: Optional[str] = "modern"