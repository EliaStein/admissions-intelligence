import React from 'react';
import { GraduationCap, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="w-6 h-6 text-primary-500" />
              <span className="text-xl font-bold text-white">(A)dmissions (I)ntelligence</span>
            </div>
            <p className="text-sm">
              Empowering students to craft compelling college essays through AI-powered feedback.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="hover:text-primary-400 transition-colors">Home</a>
              </li>
              <li>
                <a href="#features" className="hover:text-primary-400 transition-colors">Features</a>
              </li>
              <li>
                <a href="#journey" className="hover:text-primary-400 transition-colors">Get Started</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-4">
              <a href="mailto:info@admissionsintelligence.ai" 
                 className="flex items-center space-x-2 hover:text-primary-400 transition-colors">
                <Mail className="w-5 h-5" />
                <span>info@admissionsintelligence.ai</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} (A)dmissions (I)ntelligence. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}