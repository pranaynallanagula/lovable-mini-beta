export interface Plan {
  title?: string;
  description?: string;
  stack?: string;
  features?: string[];
  components_sequence?: string[];
  file_structure?: string[];
  database_schema?: string[];
  api_endpoints?: string[];
  deployment_notes?: string;
  estimated_complexity?: string;
  development_time_estimate?: string;
}

export interface GeneratedComponent {
  name: string;
  code: string;
  explanation?: string;
  filename?: string;
  dependencies?: string[];
  usage_example?: string;
  generated_at?: number;
  validation_notes?: string[];
}

export interface ProgressStats {
  total_components: number;
  generated_count: number;
  remaining_count: number;
  progress_percentage: number;
  estimated_time_remaining: string;
  session_duration: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  features: string[];
  stack: string;
}

// frontend/src/services/api.ts
import axios from "axios";
import { Plan, GeneratedComponent, ProgressStats, Template } from "./types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000, // 30 seconds timeout
});

export class ApiService {
  static async getTemplates(): Promise<Template[]> {
    const response = await api.get("/templates");
    return response.data.templates;
  }

  static async startProject(
    idea: string,
    complexity: string = "medium",
    templateId?: string
  ): Promise<{ session_id: string; plan: Plan }> {
    const response = await api.post("/start-project", {
      idea,
      complexity,
      template_id: templateId,
    });
    return response.data;
  }

  static async generateComponent(
    sessionId: string,
    componentName?: string,
    includeExplanation: boolean = true
  ): Promise<{
    session_id: string;
    component_name: string;
    code: string;
    explanation?: string;
    remaining: string[];
    validation_notes?: string[];
  }> {
    const response = await api.post("/generate-step", {
      session_id: sessionId,
      component: componentName,
      include_explanation: includeExplanation,
      include_tests: false,
    });
    return response.data;
  }

  static async generatePreview(
    prompt: string,
    stylePreference: string = "modern"
  ): Promise<{ preview_html: string; generated_at: number }> {
    const response = await api.post("/generate-preview", {
      prompt,
      style_preference: stylePreference,
    });
    return response.data;
  }

  static async getSession(sessionId: string): Promise<{
    session_id: string;
    idea: string;
    plan: Plan;
    remaining: string[];
    generated: GeneratedComponent[];
    progress: ProgressStats;
  }> {
    const response = await api.get(`/session/${sessionId}`);
    return response.data;
  }

  static async applyTemplate(
    templateId: string,
    customizations: Record<string, any> = {}
  ): Promise<{ session_id: string; plan: Plan }> {
    const response = await api.post(`/apply-template/${templateId}`, {
      customizations,
    });
    return response.data;
  }

  static async healthCheck(): Promise<{
    status: string;
    sessions: number;
    ai_available: boolean;
  }> {
    const response = await api.get("/health");
    return response.data;
  }
}

// frontend/src/components/ui/Button.tsx
import React from "react";
import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        {
          "opacity-50 cursor-not-allowed": disabled || loading,
          "hover:transform hover:scale-105": !disabled && !loading,
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
}

// frontend/src/components/ui/Card.tsx
import React from "react";
import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  className,
  padding = "md",
  shadow = "sm",
}: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  return (
    <div
      className={clsx(
        "bg-white rounded-lg border border-gray-200",
        paddingClasses[padding],
        shadowClasses[shadow],
        className
      )}
    >
      {children}
    </div>
  );
}

// frontend/src/components/ui/ProgressBar.tsx
import React from "react";
import { clsx } from "clsx";

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "green" | "purple" | "red";
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  progress,
  className,
  size = "md",
  color = "blue",
  showLabel = false,
  label,
}: ProgressBarProps) {
  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const colors = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    red: "bg-red-600",
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {label || "Progress"}
          </span>
          <span className="text-sm text-gray-500">{progress.toFixed(1)}%</span>
        </div>
      )}
      <div className={clsx("w-full bg-gray-200 rounded-full", sizes[size])}>
        <div
          className={clsx(
            "rounded-full transition-all duration-300 ease-out",
            sizes[size],
            colors[color]
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

// frontend/src/utils/helpers.ts
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return "< 1 minute";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function downloadFile(
  content: string,
  filename: string,
  type: string = "text/plain"
) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    return Promise.resolve();
  }
}
