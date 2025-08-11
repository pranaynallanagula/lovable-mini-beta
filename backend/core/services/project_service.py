
import time
import uuid
from typing import Dict, List, Any, Optional
from models.project import ValidationResult

class ProjectService:
    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}
    
    def create_session(self, idea: str, plan: Dict[str, Any], user_preferences: Optional[Dict[str, Any]] = None, template_id: Optional[str] = None) -> str:
        session_id = str(uuid.uuid4())
        
        self.sessions[session_id] = {
            "id": session_id,
            "idea": idea,
            "plan": plan,
            "remaining_components": plan.get("components_sequence", []).copy(),
            "generated": [],
            "user_preferences": user_preferences or {},
            "template_id": template_id,
            "created_at": time.time(),
            "updated_at": time.time(),
            "status": "active"
        }
        
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        return self.sessions.get(session_id)
    
    def get_session_count(self) -> int:
        return len(self.sessions)
    
    def get_next_component(self, session_id: str) -> Optional[str]:
        session = self.get_session(session_id)
        if not session:
            return None
        
        remaining = session.get("remaining_components", [])
        return remaining[0] if remaining else None
    
    def get_remaining_components(self, session_id: str) -> List[str]:
        session = self.get_session(session_id)
        if not session:
            return []
        
        return session.get("remaining_components", [])
    
    def add_generated_component(self, session_id: str, component_data: Dict[str, Any]) -> bool:
        session = self.get_session(session_id)
        if not session:
            return False
        
        component_data["generated_at"] = time.time()
        session["generated"].append(component_data)
        
        component_name = component_data.get("name")
        if component_name in session["remaining_components"]:
            session["remaining_components"].remove(component_name)
        
        session["updated_at"] = time.time()
        return True
    
    def get_progress_stats(self, session_id: str) -> Dict[str, Any]:
        session = self.get_session(session_id)
        if not session:
            return {}
        
        total_components = len(session["plan"].get("components_sequence", []))
        generated_count = len(session["generated"])
        remaining_count = len(session["remaining_components"])
        
        progress_percentage = (generated_count / total_components * 100) if total_components > 0 else 0
        
        return {
            "total_components": total_components,
            "generated_count": generated_count,
            "remaining_count": remaining_count,
            "progress_percentage": round(progress_percentage, 1),
            "estimated_time_remaining": self._estimate_time_remaining(remaining_count),
            "session_duration": time.time() - session["created_at"]
        }
    
    def _estimate_time_remaining(self, remaining_count: int) -> str:
        minutes_per_component = 2
        total_minutes = remaining_count * minutes_per_component
        
        if total_minutes < 5:
            return "< 5 minutes"
        elif total_minutes < 60:
            return f"~{total_minutes} minutes"
        else:
            hours = total_minutes // 60
            return f"~{hours} hour{'s' if hours > 1 else ''}"