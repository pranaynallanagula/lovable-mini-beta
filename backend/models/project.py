from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from enum import Enum

class ProjectComplexity(str, Enum):
    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"

class ProjectTemplate(BaseModel):
    id: str
    name: str
    description: str
    features: List[str]
    stack: str
    components: List[str]
    
    def customize(self, customizations: Dict[str, Any]) -> str:
        base_idea = f"Create a {self.name.lower()}"
        if customizations.get("industry"):
            base_idea += f" for {customizations['industry']}"
        if customizations.get("additional_features"):
            base_idea += f" with {', '.join(customizations['additional_features'])}"
        return base_idea

class ValidationResult(BaseModel):
    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []
    notes: List[str] = []