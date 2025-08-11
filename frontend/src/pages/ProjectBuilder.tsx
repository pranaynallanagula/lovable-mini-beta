// frontend/src/pages/ProjectBuilder.tsx - MODERN BEAUTIFUL VERSION WITH FIXES
import React, { useState, useEffect } from "react";
import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

type Plan = {
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
};

type GeneratedComponent = {
  name: string;
  code: string;
  explanation?: string;
  filename?: string;
  dependencies?: string[];
  usage_example?: string;
  generated_at?: number;
  validation_notes?: string[];
};

type ProgressStats = {
  total_components: number;
  generated_count: number;
  remaining_count: number;
  progress_percentage: number;
  estimated_time_remaining: string;
  session_duration: number;
};

type Template = {
  id: string;
  name: string;
  description: string;
  features: string[];
  stack: string;
};

export default function ProjectBuilder() {
  const [idea, setIdea] = useState<string>(
    "Create a modern portfolio website to showcase my software development skills and projects"
  );
  const [complexity, setComplexity] = useState<string>("medium");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [generatedList, setGeneratedList] = useState<GeneratedComponent[]>([]);
  const [remaining, setRemaining] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressStats | null>(null);
  const [activeTab, setActiveTab] = useState<
    "idea" | "plan" | "components" | "preview"
  >("idea");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [stylePreference, setStylePreference] = useState<string>("modern");

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Update progress when session changes
  useEffect(() => {
    if (sessionId) {
      updateProgress();
    }
  }, [sessionId, generatedList]);

  const loadTemplates = async () => {
    try {
      const resp = await axios.get(`${BACKEND}/templates`);
      setTemplates(resp.data.templates);
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  };

  const updateProgress = async () => {
    if (!sessionId) return;
    try {
      const resp = await axios.get(`${BACKEND}/session/${sessionId}`);
      setProgress(resp.data.progress);
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const applyTemplate = async (templateId: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`${BACKEND}/apply-template/${templateId}`, {
        customizations: { industry: "software development" },
      });
      setSessionId(resp.data.session_id);
      setPlan(resp.data.plan);
      setRemaining(resp.data.plan.components_sequence || []);
      setGeneratedList([]);
      setSelectedTemplate(templateId);
      setActiveTab("plan");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const startProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`${BACKEND}/start-project`, {
        idea,
        complexity,
        template_id: selectedTemplate,
      });
      setSessionId(resp.data.session_id);
      setPlan(resp.data.plan);
      setRemaining(resp.data.plan.components_sequence || []);
      setGeneratedList([]);
      setActiveTab("plan");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateNext = async (componentName?: string) => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`${BACKEND}/generate-step`, {
        session_id: sessionId,
        component: componentName,
        include_explanation: true,
        include_tests: false,
      });

      const newComponent: GeneratedComponent = {
        name: resp.data.component_name,
        code: resp.data.code,
        explanation: resp.data.explanation,
        validation_notes: resp.data.validation_notes,
        generated_at: Date.now(),
      };

      setGeneratedList((prev) => [...prev, newComponent]);
      setRemaining(resp.data.remaining);

      if (activeTab === "idea" || activeTab === "plan") {
        setActiveTab("components");
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    if (!idea.trim()) return;
    setPreviewLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`${BACKEND}/generate-preview`, {
        prompt: idea,
        style_preference: stylePreference,
      });
      setPreviewHtml(resp.data.preview_html);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const downloadCode = (name: string, code: string) => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.tsx`;
    a.click();
  };

  const downloadAllCode = () => {
    if (generatedList.length === 0) return;

    const zip = generatedList
      .map((comp) => `// ${comp.filename || comp.name}\n${comp.code}`)
      .join("\n\n// ==========================================\n\n");

    const blob = new Blob([zip], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${plan?.title || "project"}-components.tsx`;
    a.click();
  };

  const downloadPreview = () => {
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${plan?.title || "preview"}.html`;
    a.click();
  };

  const getTemplateIcon = (templateId: string) => {
    const icons = {
      portfolio: "👨‍💻",
      dashboard: "📊",
      ecommerce: "🛒",
      blog: "📝",
    };
    return icons[templateId as keyof typeof icons] || "🚀";
  };

  const getComplexityColor = (complexity: string) => {
    const colors = {
      simple: "from-green-400 to-emerald-500",
      medium: "from-blue-400 to-cyan-500",
      complex: "from-purple-400 to-pink-500",
    };
    return colors[complexity as keyof typeof colors] || colors.medium;
  };

  const renderProjectStructure = (fileStructure: string[]) => {
    return (
      <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
        <pre className="text-sm text-green-400 font-mono leading-relaxed">
          <code>
            {fileStructure.map((line, idx) => (
              <div key={idx} className="hover:bg-gray-800 px-2 py-0.5 rounded">
                {line}
              </div>
            ))}
          </code>
        </pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              ✨ AI Project Builder
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Transform your ideas into beautiful applications with the power of
              AI
            </p>

            {/* Progress Bar */}
            {progress && (
              <div className="max-w-md mx-auto bg-white/20 backdrop-blur-sm rounded-full p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-white">
                    Progress
                  </span>
                  <span className="text-sm text-blue-100">
                    {progress.generated_count} of {progress.total_components}{" "}
                    components
                  </span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress.progress_percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-blue-100 mt-1">
                  <span>
                    {progress.progress_percentage.toFixed(1)}% complete
                  </span>
                  <span>{progress.estimated_time_remaining} remaining</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-white/5 to-transparent rounded-full translate-x-48 translate-y-48"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-8">
          <nav className="flex space-x-1">
            {[
              {
                id: "idea",
                label: "Project Idea",
                icon: "💡",
                color: "from-yellow-400 to-orange-500",
              },
              {
                id: "plan",
                label: "Project Plan",
                icon: "📋",
                color: "from-blue-400 to-cyan-500",
              },
              {
                id: "components",
                label: "Components",
                icon: "🧩",
                color: "from-purple-400 to-pink-500",
              },
              {
                id: "preview",
                label: "Preview",
                icon: "👀",
                color: "from-green-400 to-emerald-500",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl text-sm font-medium transition-all duration-200 flex-1 justify-center ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <div className="text-red-500 text-2xl mr-4">⚠️</div>
              <div>
                <h3 className="text-red-800 font-semibold">
                  Something went wrong
                </h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "idea" && (
          <div className="space-y-8">
            {/* Templates Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  🚀 Quick Start Templates
                </h2>
                <p className="text-gray-600">
                  Choose a template to get started quickly, or describe your own
                  idea below
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`group cursor-pointer transition-all duration-300 ${
                      selectedTemplate === template.id
                        ? "transform scale-105"
                        : "hover:transform hover:scale-105"
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                        selectedTemplate === template.id
                          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-4">
                          {getTemplateIcon(template.id)}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {template.description}
                        </p>

                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {template.features
                              .slice(0, 3)
                              .map((feature, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                                >
                                  {feature}
                                </span>
                              ))}
                          </div>
                          <div className="text-xs text-blue-600 font-medium">
                            {template.stack}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTemplate && (
                <div className="text-center">
                  <button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
                    onClick={() => applyTemplate(selectedTemplate)}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Applying Template...</span>
                      </div>
                    ) : (
                      "✨ Use This Template"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Custom Idea Section */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  💭 Or Describe Your Own Idea
                </h2>
                <p className="text-gray-600">
                  Tell us about your dream application and we'll bring it to
                  life
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    📝 Describe your application idea
                  </label>
                  <textarea
                    rows={4}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="I want to build a modern portfolio website that showcases my projects, skills, and experience with a clean, professional design..."
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    ⚡ Project Complexity
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        value: "simple",
                        label: "Simple",
                        desc: "3-5 components",
                        time: "4-6 hours",
                      },
                      {
                        value: "medium",
                        label: "Medium",
                        desc: "6-8 components",
                        time: "8-12 hours",
                      },
                      {
                        value: "complex",
                        label: "Complex",
                        desc: "9+ components",
                        time: "16-24 hours",
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setComplexity(option.value)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          complexity === option.value
                            ? `border-transparent bg-gradient-to-br ${getComplexityColor(
                                option.value
                              )} text-white shadow-lg transform scale-105`
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-bold">{option.label}</div>
                          <div
                            className={`text-sm ${
                              complexity === option.value
                                ? "text-white/90"
                                : "text-gray-600"
                            }`}
                          >
                            {option.desc}
                          </div>
                          <div
                            className={`text-xs ${
                              complexity === option.value
                                ? "text-white/80"
                                : "text-gray-500"
                            }`}
                          >
                            ~{option.time}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={startProject}
                    disabled={loading || !idea.trim()}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Plan...</span>
                      </div>
                    ) : (
                      "🚀 Start Project"
                    )}
                  </button>

                  <button
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105 disabled:opacity-50"
                    onClick={() => generateNext()}
                    disabled={!sessionId || loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </div>
                    ) : (
                      "⚡ Generate Next Component"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "plan" && plan && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                📋 Project Plan:{" "}
                <span className="text-blue-600">{plan.title}</span>
              </h2>
              <p className="text-gray-600 text-lg">{plan.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <span className="text-2xl mr-2">🛠️</span>
                    Technology Stack
                  </h3>
                  <p className="text-gray-700 font-medium">{plan.stack}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <span className="text-2xl mr-2">✨</span>
                    Key Features
                  </h3>
                  <div className="space-y-2">
                    {plan.features?.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center text-gray-700"
                      >
                        <span className="text-green-500 mr-2">✅</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Structure Section */}
                {plan.file_structure && plan.file_structure.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                      <span className="text-2xl mr-2">📁</span>
                      Project Structure
                    </h3>
                    {renderProjectStructure(plan.file_structure)}
                  </div>
                )}
              </div>

              <div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <span className="text-2xl mr-2">🧩</span>
                    Components to Build
                  </h3>
                  <div className="space-y-3">
                    {plan.components_sequence?.map((component, idx) => {
                      const isGenerated = generatedList.some(
                        (g) => g.name === component
                      );
                      const isNext = remaining[0] === component;

                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                            isGenerated
                              ? "bg-gradient-to-r from-green-100 to-emerald-100 border-green-300"
                              : isNext
                              ? "bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-300 shadow-md"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <span className="font-medium flex items-center">
                            <span className="text-xl mr-3">
                              {isGenerated ? "✅" : isNext ? "🔄" : "⏳"}
                            </span>
                            {component}
                          </span>
                          <button
                            onClick={() => generateNext(component)}
                            disabled={loading || isGenerated}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                              isGenerated
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50"
                            }`}
                          >
                            {isGenerated ? "Already Generated" : "Generate"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "components" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">
                🧩 Generated Components
              </h2>
              {generatedList.length > 0 && (
                <button
                  onClick={downloadAllCode}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
                >
                  📥 Download All Components
                </button>
              )}
            </div>

            {generatedList.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-16 text-center shadow-xl">
                <div className="text-6xl mb-6">🧩</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No components generated yet
                </h3>
                <p className="text-gray-600 mb-8">
                  Start building your application by generating your first
                  component!
                </p>
                <button
                  onClick={() => generateNext()}
                  disabled={!sessionId || loading}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105 disabled:opacity-50"
                >
                  🚀 Generate First Component
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {generatedList.map((component, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">
                            {component.name}
                          </h3>
                          {component.explanation && (
                            <p className="text-blue-100">
                              {component.explanation}
                            </p>
                          )}
                          {component.validation_notes &&
                            component.validation_notes.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {component.validation_notes.map(
                                  (note, noteIdx) => (
                                    <span
                                      key={noteIdx}
                                      className="bg-yellow-500/20 text-yellow-100 text-xs px-3 py-1 rounded-full border border-yellow-300/30"
                                    >
                                      {note}
                                    </span>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                        <button
                          onClick={() =>
                            downloadCode(component.name, component.code)
                          }
                          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium backdrop-blur-sm"
                        >
                          📥 Download
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                        <pre className="text-sm text-gray-100">
                          <code>{component.code}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "preview" && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  🎨 Live Preview
                </h2>
                <p className="text-gray-600 mb-6">
                  Generate a live preview of your application
                </p>

                <div className="max-w-2xl mx-auto">
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      🎨 Style Preference
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {["modern", "classic", "minimal", "dark"].map((style) => (
                        <button
                          key={style}
                          onClick={() => setStylePreference(style)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 capitalize ${
                            stylePreference === style
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={generatePreview}
                      disabled={previewLoading || !idea.trim()}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105 disabled:opacity-50"
                    >
                      {previewLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Generating Preview...</span>
                        </div>
                      ) : (
                        "✨ Generate Preview"
                      )}
                    </button>

                    {previewHtml && (
                      <button
                        onClick={downloadPreview}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
                      >
                        📥 Download HTML
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {previewHtml ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        🖥️ Live Preview
                      </h3>
                      <div className="text-sm text-gray-500">
                        Interactive preview of your application
                      </div>
                    </div>
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg border">
                      <iframe
                        title="App Preview"
                        className="w-full h-96 border-0"
                        srcDoc={previewHtml}
                        sandbox="allow-same-origin allow-scripts"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        📝 Generated HTML Code
                      </h3>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(previewHtml);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        📋 Copy Code
                      </button>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto max-h-96">
                      <pre className="text-sm text-gray-100">
                        <code>{previewHtml}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-16 text-center border-2 border-dashed border-gray-300">
                  <div className="text-6xl mb-6">🎨</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Generate Preview
                  </h3>
                  <p className="text-gray-600">
                    Click "Generate Preview" to see your application come to
                    life!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Spacing */}
      <div className="h-16"></div>
    </div>
  );
}
