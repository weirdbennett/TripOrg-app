import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      {/* Hero Section */}
      <main className="px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8 animate-fade-in">
            <span className="text-lg">🌍</span>
            <span>Your travel companion for group adventures</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Plan Your Trips
            <br />
            <span className="text-primary-600 dark:text-primary-400">Together, Effortlessly</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            TripOrg brings everyone on the same page. Organize destinations, 
            track shared expenses, upload documents, chat with AI for tips — 
            all in one collaborative space.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto px-8 shadow-lg hover:shadow-xl transition-shadow">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 text-left">
            <div className="group bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 dark:border-gray-700/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                👥
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Real-Time Collaboration
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Invite friends and family to your trip. Everyone can view updates, 
                add expenses, and coordinate together in real-time.
              </p>
            </div>

            <div className="group bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 dark:border-gray-700/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                💰
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Smart Budget Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Log shared and personal expenses. Automatic cost splitting, 
                category breakdown, and per-person summaries — no spreadsheets needed.
              </p>
            </div>

            <div className="group bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 dark:border-gray-700/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🤖
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                AI Travel Assistant
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Ask questions about your destination. Get personalized recommendations, 
                local tips, and itinerary ideas based on your trip context.
              </p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-800/30">
              <span className="text-2xl">📄</span>
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white text-sm">Document Storage</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Upload tickets, PDFs</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-800/30">
              <span className="text-2xl">💬</span>
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white text-sm">Group Chat</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Discuss with your group</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-800/30">
              <span className="text-2xl">📍</span>
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white text-sm">Activity Planning</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Plan what to do</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-800/30">
              <span className="text-2xl">📊</span>
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white text-sm">Activity Log</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Track all changes</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 mt-12 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">© 2026 TripOrg. Plan smarter, travel better.</p>
        </div>
      </footer>
    </div>
  );
};
