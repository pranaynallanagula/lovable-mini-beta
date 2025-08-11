import re
from typing import List, Dict, Any
from models.project import ValidationResult

class CodeValidator:
    def __init__(self):
        self.security_patterns = [
            r'eval\s*\(',
            r'exec\s*\(',
            r'__import__\s*\(',
            r'document\.write\s*\(',
            r'innerHTML\s*=',
            r'dangerouslySetInnerHTML'
        ]
        
        self.react_patterns = {
            'component_export': r'export\s+default\s+function\s+\w+',
            'react_import': r'import\s+React',
            'tsx_extension': r'\.tsx?$'
        }
    
    def validate_component_code(self, code: str) -> ValidationResult:
        errors = []
        warnings = []
        notes = []
        
        # Security checks
        for pattern in self.security_patterns:
            if re.search(pattern, code, re.IGNORECASE):
                errors.append(f"Potentially unsafe pattern detected: {pattern}")
        
        # React-specific validations
        if not re.search(self.react_patterns['react_import'], code):
            warnings.append("React import not found")
        
        if not re.search(self.react_patterns['component_export'], code):
            warnings.append("Default export function not found")
        
        # Basic syntax check
        try:
            if not self._check_balanced_brackets(code):
                errors.append("Unbalanced brackets or parentheses")
        except Exception as e:
            warnings.append(f"Syntax validation warning: {str(e)}")
        
        # Check for common issues
        if 'className=' not in code and 'class=' in code:
            warnings.append("Use 'className' instead of 'class' in JSX")
        
        if len(code.split('\n')) > 200:
            notes.append("Component is quite large - consider breaking it down")
        
        if 'TODO' in code or 'FIXME' in code:
            notes.append("Contains TODO/FIXME comments")
        
        is_valid = len(errors) == 0
        
        return ValidationResult(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            notes=notes
        )
    
    def _check_balanced_brackets(self, code: str) -> bool:
        stack = []
        pairs = {'(': ')', '[': ']', '{': '}'}
        
        for char in code:
            if char in pairs:
                stack.append(char)
            elif char in pairs.values():
                if not stack:
                    return False
                if pairs[stack.pop()] != char:
                    return False
        
        return len(stack) == 0
    
    def auto_fix_code(self, code: str) -> str:
        # Fix class -> className
        code = re.sub(r'\bclass=', 'className=', code)
        
        # Add React import if missing
        if not re.search(self.react_patterns['react_import'], code):
            code = "import React from 'react';\n\n" + code
        
        # Basic formatting improvements
        code = re.sub(r'\n\s*\n\s*\n', '\n\n', code)
        
        return code