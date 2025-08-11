
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os, uuid, time, json
from dotenv import load_dotenv
import traceback


from core.ai.prompt_engine import PromptEngine
from core.ai.code_generator import CodeGenerator
from core.services.project_service import ProjectService
from core.utils.validators import CodeValidator
from models.requests import StartProjectReq, GenerateStepReq, GeneratePreviewReq
from models.responses import StartProjectResp, GenerateStepResp, GeneratePreviewResp

try:
    import openai
except Exception:
    openai = None

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if OPENAI_API_KEY and openai:
    openai.api_key = OPENAI_API_KEY

app = FastAPI(
    title="Lovable-mini (Beta) Backend",
    description="AI-powered web application generator",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
prompt_engine = PromptEngine()
code_generator = CodeGenerator(openai_api_key=OPENAI_API_KEY)
project_service = ProjectService()
code_validator = CodeValidator()

@app.get("/")
async def root():
    return {
        "message": "Lovable-mini Beta Backend", 
        "version": "2.0.0",
        "features": [
            "AI code generation",
            "Project planning",
            "Code validation",
            "Template system",
            "Live preview generation"
        ]
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy", 
        "sessions": project_service.get_session_count(),
        "ai_available": bool(OPENAI_API_KEY and openai)
    }

@app.post("/start-project", response_model=StartProjectResp)
async def start_project(req: StartProjectReq):
    """Enhanced project initialization with better planning"""
    try:
        if not req.idea.strip():
            raise HTTPException(status_code=400, detail="Project idea cannot be empty")
        
        #  project plan
        plan = await code_generator.generate_project_plan(
            idea=req.idea,
            preferred_stack=req.preferred_stack,
            complexity=req.complexity or "medium"
        )
        
        # Create session 
        session_id = project_service.create_session(
            idea=req.idea,
            plan=plan,
            user_preferences={"stack": req.preferred_stack, "complexity": req.complexity}
        )
        
        return StartProjectResp(session_id=session_id, plan=plan)
        
    except Exception as e:
        print(f"Error in start_project: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to start project: {str(e)}")

@app.post("/generate-step", response_model=GenerateStepResp)
async def generate_step(req: GenerateStepReq):
    """Enhanced component generation with validation"""
    try:
        session = project_service.get_session(req.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        #  to generate
        component_name = req.component or project_service.get_next_component(req.session_id)
        if not component_name:
            raise HTTPException(status_code=400, detail="No components remaining")
        
        # Generate component with enhanced context
        result = await code_generator.generate_component(
            session=session,
            component_name=component_name,
            include_explanation=req.include_explanation,
            include_tests=req.include_tests or False
        )
        
        # Validate 
        validation_result = code_validator.validate_component_code(result["code"])
        if not validation_result.is_valid:
            
            result["code"] = code_validator.auto_fix_code(result["code"])
        
        # Update session
        project_service.add_generated_component(req.session_id, result)
        remaining = project_service.get_remaining_components(req.session_id)
        
        return GenerateStepResp(
            session_id=req.session_id,
            component_name=result["name"],
            code=result["code"],
            explanation=result.get("explanation"),
            remaining=remaining,
            validation_notes=validation_result.notes if validation_result.notes else None
        )
        
    except Exception as e:
        print(f"Error in generate_step: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to generate component: {str(e)}")

@app.post("/generate-preview", response_model=GeneratePreviewResp)
async def generate_preview(req: GeneratePreviewReq):
    """Generate live HTML preview of the application"""
    try:
        # Generate preview 
        preview_html = await code_generator.generate_preview_html(
            prompt=req.prompt,
            style_preference=req.style_preference or "modern"
        )
        
        return GeneratePreviewResp(
            preview_html=preview_html,
            generated_at=time.time()
        )
        
    except Exception as e:
        print(f"Error in generate_preview: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to generate preview: {str(e)}")

@app.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get detailed session information"""
    session = project_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "idea": session["idea"],
        "plan": session["plan"],
        "remaining": session["remaining_components"],
        "generated": session["generated"],
        "progress": project_service.get_progress_stats(session_id)
    }

@app.get("/templates")
async def get_templates():
    """Get available project templates with detailed AI-friendly descriptions"""
    return {
        "templates": [
            {
                "id": "portfolio",
                "name": "Developer Portfolio",
                "description": "Create a modern, professional portfolio website for a software developer. Include a hero section with name and title, an about section with skills and experience, a projects grid showcasing 3-4 coding projects with GitHub links, a skills section with programming languages and technologies, and a contact form. Use a clean, minimalist design with blue and gray color scheme. Make it fully responsive for mobile and desktop.",
                "features": [
                    "Hero section with developer name and animated typing effect",
                    "About section with professional photo and bio",
                    "Projects grid with hover effects and live demo links", 
                    "Skills section with programming language icons",
                    "Contact form with email integration",
                    "Responsive navigation with smooth scrolling"
                ],
                "stack": "React + TypeScript + Tailwind CSS",
                "sample_prompt": "Build a software developer portfolio website with sections for hero introduction, about me, projects showcase, technical skills, and contact form. Use modern design with blue accent colors and professional typography."
            },
            {
                "id": "dashboard",
                "name": "Admin Dashboard",
                "description": "Create a comprehensive admin dashboard with sidebar navigation, data visualization charts, user management table, analytics widgets, and settings panel. Include mock data for sales, users, and analytics. Use a dark theme with purple and blue accents. Add interactive charts showing revenue, user growth, and performance metrics.",
                "features": [
                    "Sidebar navigation with icons and active states",
                    "Overview dashboard with key metrics cards",
                    "Interactive charts for sales and user data",
                    "Data table with sorting and pagination", 
                    "User profile management section",
                    "Settings panel with theme toggles"
                ],
                "stack": "React + TypeScript + Tailwind + Recharts",
                "sample_prompt": "Build an admin dashboard with sidebar navigation, analytics charts showing sales data, user management table, and overview cards. Use dark theme with purple accents and include mock data for demonstrations."
            },
            {
                "id": "landing",
                "name": "SaaS Landing Page", 
                "description": "Create a high-converting SaaS landing page for a productivity app. Include hero section with compelling headline, features section with icons and benefits, pricing tiers with comparison table, testimonials carousel, FAQ accordion, and call-to-action buttons throughout. Use modern gradients and animations to make it engaging.",
                "features": [
                    "Hero section with animated gradient background",
                    "Features showcase with icons and descriptions",
                    "Pricing table with 3 tiers and popular badge",
                    "Customer testimonials with photos and ratings",
                    "FAQ section with expandable answers",
                    "Call-to-action buttons with hover animations"
                ],
                "stack": "React + TypeScript + Tailwind CSS",
                "sample_prompt": "Build a SaaS landing page for a productivity tool with hero section, features showcase, pricing plans, customer testimonials, and FAQ. Use modern gradients, animations, and compelling copy to drive conversions."
            },
            {
                "id": "business", 
                "name": "Business Website",
                "description": "Create a professional business website for a consulting company. Include hero section with company mission, services offered with detailed descriptions, team member profiles with photos, client testimonials, company statistics, and contact information. Use corporate colors (navy blue and gold) with professional imagery.",
                "features": [
                    "Hero section with company value proposition",
                    "Services grid with detailed descriptions",
                    "Team profiles with photos and expertise",
                    "Client testimonials and case studies",
                    "Company statistics and achievements",
                    "Multi-location contact information"
                ],
                "stack": "React + TypeScript + Tailwind CSS", 
                "sample_prompt": "Build a professional consulting company website with hero section, services overview, team profiles, client testimonials, and contact details. Use corporate navy blue and gold colors with clean, trustworthy design."
            }
        ]
    }

@app.post("/apply-template/{template_id}")
async def apply_template(template_id: str, req: dict):
    """Apply a template to create a new project"""
    try:
        template = prompt_engine.get_template(template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # Customize template with user input
        customized_idea = template.customize(req.get("customizations", {}))
        
        # Create project from template
        plan = await code_generator.generate_project_plan(
            idea=customized_idea,
            template_id=template_id
        )
        
        session_id = project_service.create_session(
            idea=customized_idea,
            plan=plan,
            template_id=template_id
        )
        
        return {"session_id": session_id, "plan": plan}
        
    except Exception as e:
        print(f"Error in apply_template: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to apply template: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)