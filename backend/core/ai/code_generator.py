# core/ai/code_generator.py
import json
import asyncio
from typing import Dict, Any, List, Optional
from core.ai.prompt_engine import PromptEngine

try:
    import openai
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

class CodeGenerator:
    def __init__(self, openai_api_key: Optional[str] = None):
        self.openai_api_key = openai_api_key
        self.prompt_engine = PromptEngine()
        self.has_openai = HAS_OPENAI and bool(openai_api_key)
        
        if self.has_openai:
            openai.api_key = openai_api_key
    
    async def _call_openai(self, messages: List[Dict[str, str]], max_tokens: int = 1000, temperature: float = 0.3) -> str:
        if not self.has_openai:
            raise RuntimeError("OpenAI not configured")
        
        try:
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    timeout=30
                )
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API error: {e}")
            raise
    
    async def generate_project_plan(self, idea: str, preferred_stack: Optional[str] = None, complexity: str = "medium", template_id: Optional[str] = None) -> Dict[str, Any]:
        if self.has_openai:
            try:
                prompt = self.prompt_engine.get_project_plan_prompt(idea, complexity, template_id)
                messages = [
                    {"role": "system", "content": "You are an expert software architect. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ]
                
                response = await self._call_openai(messages, max_tokens=1500, temperature=0.2)
                plan = json.loads(response)
                return self._enhance_plan(plan, idea, preferred_stack)
                
            except Exception as e:
                print(f"Error generating plan with OpenAI: {e}")
                return self._generate_fallback_plan(idea, preferred_stack, complexity)
        else:
            return self._generate_fallback_plan(idea, preferred_stack, complexity)
    
    def _enhance_plan(self, plan: Dict[str, Any], idea: str, preferred_stack: Optional[str]) -> Dict[str, Any]:
        return {
            "title": plan.get("title", idea[:50]),
            "description": plan.get("description", idea),
            "stack": preferred_stack or plan.get("stack", "React + TypeScript + Tailwind"),
            "features": plan.get("features", ["Basic functionality"]),
            "components_sequence": plan.get("components_sequence", ["Navbar", "Hero", "About", "Contact", "Footer"]),
            "file_structure": plan.get("file_structure", ["src/components/", "src/pages/"]),
            "database_schema": plan.get("database_schema", []),
            "api_endpoints": plan.get("api_endpoints", []),
            "deployment_notes": plan.get("deployment_notes", "Deploy to Vercel or Netlify"),
            "estimated_complexity": plan.get("estimated_complexity", "medium"),
            "development_time_estimate": plan.get("development_time_estimate", "8-12 hours")
        }
    
    def _generate_fallback_plan(self, idea: str, preferred_stack: Optional[str], complexity: str) -> Dict[str, Any]:
        idea_lower = idea.lower()
        components = ["Navbar"]
        
        if any(word in idea_lower for word in ["portfolio", "showcase", "developer"]):
            components.extend(["Hero", "About", "ProjectsGrid", "Skills", "Contact"])
        elif any(word in idea_lower for word in ["dashboard", "admin"]):
            components.extend(["Sidebar", "Dashboard", "Analytics", "UserTable", "Settings"])
        else:
            components.extend(["Hero", "About", "Features", "Contact"])
        
        components.append("Footer")
        
        if complexity == "simple":
            components = components[:4]
        elif complexity == "complex":
            components.extend(["Settings", "AdminPanel"])
        
        return {
            "title": idea.split('.')[0][:60],
            "description": idea,
            "stack": preferred_stack or "React + TypeScript + Tailwind",
            "features": ["Responsive design", "Modern UI components", "Professional styling"],
            "components_sequence": components,
            "file_structure": ["src/components/", "src/pages/", "src/utils/"],
            "database_schema": [],
            "api_endpoints": [],
            "deployment_notes": "Ready for deployment to Vercel, Netlify, or similar platforms",
            "estimated_complexity": complexity,
            "development_time_estimate": {"simple": "4-6 hours", "medium": "8-12 hours", "complex": "16-24 hours"}[complexity]
        }
    
    async def generate_component(self, session: Dict[str, Any], component_name: str, include_explanation: bool = True, include_tests: bool = False) -> Dict[str, Any]:
        if self.has_openai:
            try:
                prompt = self.prompt_engine.get_component_prompt(component_name, session["plan"], session.get("generated", []))
                messages = [
                    {"role": "system", "content": "You are an expert React developer. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ]
                
                response = await self._call_openai(messages, max_tokens=2000, temperature=0.3)
                result = json.loads(response)
                return self._validate_component_result(result, component_name)
                
            except Exception as e:
                print(f"Error generating component with OpenAI: {e}")
                return self._generate_fallback_component(component_name, session["plan"])
        else:
            return self._generate_fallback_component(component_name, session["plan"])
    
    def _validate_component_result(self, result: Dict[str, Any], component_name: str) -> Dict[str, Any]:
        return {
            "name": result.get("name", component_name),
            "filename": result.get("filename", f"src/components/{component_name}.tsx"),
            "code": result.get("code", f"// Placeholder for {component_name}"),
            "explanation": result.get("explanation", f"Generated {component_name} component"),
            "dependencies": result.get("dependencies", []),
            "usage_example": result.get("usage_example", f"<{component_name} />")
        }
    
    def _generate_fallback_component(self, component_name: str, plan: Dict[str, Any]) -> Dict[str, Any]:
        code = f'''import React from 'react';

export default function {component_name}() {{
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">{component_name}</h2>
      <p className="text-gray-600">
        This is the {component_name} component for {plan.get('title', 'your application')}.
      </p>
    </div>
  );
}}'''
        
        return {
            "name": component_name,
            "filename": f"src/components/{component_name}.tsx",
            "code": code,
            "explanation": f"Basic {component_name} component with clean styling",
            "dependencies": [],
            "usage_example": f"<{component_name} />"
        }
    
    async def generate_preview_html(self, prompt: str, style_preference: str = "modern") -> str:
        if self.has_openai:
            try:
                prompt_text = self.prompt_engine.get_preview_prompt(prompt, style_preference)
                messages = [
                    {"role": "system", "content": "Create beautiful, responsive HTML pages."},
                    {"role": "user", "content": prompt_text}
                ]
                
                return await self._call_openai(messages, max_tokens=3000, temperature=0.4)
                
            except Exception as e:
                print(f"Error generating preview: {e}")
                return self._generate_fallback_preview(prompt, style_preference)
        else:
            return self._generate_fallback_preview(prompt, style_preference)
    
    def _generate_fallback_preview(self, prompt: str, style: str) -> str:
        return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - {prompt[:30]}...</title>
    <style>
        body {{ font-family: Inter, sans-serif; margin: 0; padding: 20px; background: #f9fafb; }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 20px; text-align: center; border-radius: 12px; }}
        .header h1 {{ font-size: 3rem; margin-bottom: 1rem; }}
        .section {{ padding: 40px 0; }}
        .card {{ background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 20px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Application</h1>
            <p>{prompt}</p>
        </div>
        <div class="section">
            <div class="card">
                <h3>Feature 1</h3>
                <p>Your first key feature description.</p>
            </div>
        </div>
    </div>
</body>
</html>'''