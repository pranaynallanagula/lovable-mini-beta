# core/ai/prompt_engine.py
from typing import Dict, List, Any, Optional
from models.project import ProjectTemplate

class PromptEngine:
    def __init__(self):
        self.templates = self._load_templates()
        self.component_prompts = self._load_component_prompts()
    
    def _load_templates(self) -> Dict[str, ProjectTemplate]:
        return {
            "portfolio": ProjectTemplate(
                id="portfolio",
                name="Developer Portfolio",
                description="Professional portfolio website",
                features=["Hero section", "About", "Projects", "Contact", "Skills"],
                stack="React + TypeScript + Tailwind",
                components=["Navbar", "Hero", "About", "ProjectsGrid", "Skills", "Contact", "Footer"]
            ),
            "dashboard": ProjectTemplate(
                id="dashboard",
                name="Admin Dashboard", 
                description="Full-featured admin dashboard",
                features=["Authentication", "Charts", "Tables", "Settings"],
                stack="React + TypeScript + Tailwind + Recharts",
                components=["Sidebar", "Header", "Dashboard", "Analytics", "UserTable", "Settings"]
            )
        }
    
    def _load_component_prompts(self) -> Dict[str, str]:
        return {
            "navbar": "Create a modern, responsive navigation bar component",
            "hero": "Create an engaging hero section component",
            "footer": "Create a comprehensive footer component"
        }
    
    def get_project_plan_prompt(self, idea: str, complexity: str = "medium", template_id: Optional[str] = None) -> str:
        return f"""Create a project plan for: {idea}
        Complexity: {complexity}
        Return JSON with: title, description, stack, features, components_sequence"""
    
    def get_component_prompt(self, component_name: str, project_context: Dict[str, Any], session_history: List[Dict[str, Any]]) -> str:
        return f"""Create React component: {component_name}
        Project: {project_context.get('title', 'Web App')}
        Return JSON with: name, filename, code, explanation"""
    
    def get_preview_prompt(self, description: str, style: str = "modern") -> str:
        return f"Create HTML page for: {description} with {style} style"
    
    def get_template(self, template_id: str) -> Optional[ProjectTemplate]:
        return self.templates.get(template_id)
    
    def list_templates(self) -> List[ProjectTemplate]:
        return list(self.templates.values())