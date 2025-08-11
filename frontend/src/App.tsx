import React, { useState } from "react";
import "./index.css";
import ProjectBuilder from "./pages/ProjectBuilder";

function App() {
  const [signedIn, setSignedIn] = useState(true);

  return (
    <div className="app min-h-screen">
      {/* this is my Nav bar */}
      <header className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 border-b border-gray-200/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">✨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Lovable-mini
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 ml-2">
                    (Beta)
                  </span>
                </h1>
                <p className="text-gray-400 text-sm">
                  AI-Powered Development Platform
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-6">
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Templates
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Docs
                </a>
              </div>

              <div className="flex items-center space-x-3">
                {" "}
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      </header>

      {/* TODO: sign in page for logging */}
      <main className="relative">
        {!signedIn ? (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-2xl">🚀</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome Back
                </h2>
                <p className="text-gray-600 mb-6">
                  Sign in to continue building amazing applications
                </p>

                <button
                  onClick={() => setSignedIn(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
                >
                  Continue as Demo User
                </button>

                <p className="text-xs text-gray-500 mt-4">
                  Demo mode - Full auth integration coming soon
                </p>
              </div>
            </div>
          </div>
        ) : (
          // here we are showing the main page directly
          <div className="page-transition">
            <ProjectBuilder />
          </div>
        )}
      </main>

      {/* this is my Footer */}
      <footer className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 border-t border-gray-200/20 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">✨</span>
                </div>
                <span className="text-xl font-bold text-white">
                  Lovable-mini (Beta)
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Transform your ideas into beautiful web applications with the
                power of AI. No coding experience required.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-gray-400">📧</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-gray-400">🐙</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-gray-400">🐦</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Templates
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Lovable-mini (Beta). Built with ❤️ and AI.
            </p>
            <p className="text-gray-500 text-sm mt-4 md:mt-0">
              Beta version with modern design
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
