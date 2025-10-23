'use client';

import { DollarSign, TrendingUp, Target, Shield } from 'lucide-react';

interface HeroProps {
  userName?: string;
  isLoggedIn?: boolean;
}

export default function Hero({ userName, isLoggedIn = false }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 gradient-animate">
      {/* Animated background circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animate-delay-300"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center">
          {/* Main heading with animation */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 animate-slide-down">
            {isLoggedIn ? (
              <>
                Welcome Back,{' '}
                <span className="text-yellow-300">
                  {userName || 'User'}
                </span>
              </>
            ) : (
              <>
                Track Your{' '}
                <span className="text-yellow-300">Finances</span>
              </>
            )}
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto animate-slide-up animate-delay-200">
            {isLoggedIn
              ? 'Manage your money with powerful tools and insightful analytics'
              : 'Take control of your money with our powerful, easy-to-use finance tracker'}
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover-lift animate-scale-in animate-delay-300">
              <div className="bg-yellow-400 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-blue-900" size={28} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Track Expenses</h3>
              <p className="text-blue-100 text-sm">Monitor every dollar you spend</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover-lift animate-scale-in animate-delay-400">
              <div className="bg-green-400 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-blue-900" size={28} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Visualize Data</h3>
              <p className="text-blue-100 text-sm">Beautiful charts and insights</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover-lift animate-scale-in animate-delay-500">
              <div className="bg-purple-400 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <Target className="text-blue-900" size={28} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Set Budgets</h3>
              <p className="text-blue-100 text-sm">Stay on track with your goals</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover-lift animate-scale-in animate-delay-500">
              <div className="bg-pink-400 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <Shield className="text-blue-900" size={28} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Secure & Private</h3>
              <p className="text-blue-100 text-sm">Your data is safe with us</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16 md:h-24" viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 74L60 67.8C120 61.7 240 49.3 360 43.2C480 37 600 37 720 39.8C840 43.7 960 49.3 1080 51.2C1200 53 1320 51 1380 49.8L1440 48.7V74H1380C1320 74 1200 74 1080 74C960 74 840 74 720 74C600 74 480 74 360 74C240 74 120 74 60 74H0Z" fill="#F9FAFB"/>
        </svg>
      </div>
    </div>
  );
}
