import React, { useState } from 'react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg">
          <div className="py-1 px-6 sm:px-8 lg:px-12">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-3xl font-bold text-indigo-600">iNotes</h1>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:block">
                <div className="flex items-center space-x-8">
                  <a
                    href="#features"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-lg font-medium transition-colors duration-200"
                  >
                    Features
                  </a>
                  <a
                    href="#about"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-lg font-medium transition-colors duration-200"
                  >
                    About
                  </a>
                  <a
                    href="#contact"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-lg font-medium transition-colors duration-200"
                  >
                    Contact
                  </a>
                </div>
              </nav>

              {/* CTA Buttons */}
              <div className="hidden md:flex items-center space-x-4">
                <button className="text-gray-700 hover:text-indigo-600 px-4 py-2 text-lg font-medium transition-colors duration-200">
                  Sign In
                </button>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                  Get Started
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-700 hover:text-indigo-600 p-2"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-2">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg p-4">
              <div className="space-y-3">
                <a
                  href="#features"
                  className="block text-gray-700 hover:text-indigo-600 px-3 py-2 text-base font-medium transition-colors duration-200"
                >
                  Features
                </a>
                <a
                  href="#about"
                  className="block text-gray-700 hover:text-indigo-600 px-3 py-2 text-base font-medium transition-colors duration-200"
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="block text-gray-700 hover:text-indigo-600 px-3 py-2 text-base font-medium transition-colors duration-200"
                >
                  Contact
                </a>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex flex-col space-y-2">
                    <button className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-base font-medium text-left transition-colors duration-200">
                      Sign In
                    </button>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-base font-medium transition-all duration-200">
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
