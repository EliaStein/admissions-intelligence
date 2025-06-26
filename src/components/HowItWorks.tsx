'use client';

import React from 'react';
import { FileText, MessageSquare, Pen, Send } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Submit Your Draft",
      description: "Upload your essay draft and provide the prompt requirements"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Receive Expert Analysis",
      description: "Our AI analyzes your essay for structure, content, and impact"
    },
    {
      icon: <Pen className="w-8 h-8" />,
      title: "Make Improvements",
      description: "Use our detailed feedback to enhance your essay"
    },
    {
      icon: <Send className="w-8 h-8" />,
      title: "Perfect Your Essay",
      description: "Submit revisions for additional feedback until you're satisfied"
    }
  ];

  const scrollToEssayForm = () => {
    const heroSection = document.querySelector('.essay-form-section');
    heroSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const scrollToTestimonials = () => {
    const testimonialsSection = document.getElementById('testimonials');
    testimonialsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-white" id="how-it-works">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-secondary-500 font-semibold mb-2 inline-block">How It Works</span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How Essay Wizard Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            A simple, four-step process to transform your college essay from good to exceptional.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={scrollToEssayForm}
              className="bg-primary-600 text-white px-6 py-3 rounded-full hover:bg-primary-700 transition-colors"
            >
              Improve Your Essay Now
            </button>
            <button
              onClick={scrollToTestimonials}
              className="bg-white text-secondary-500 border-2 border-secondary-500 px-6 py-3 rounded-full hover:bg-secondary-50 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-primary-100 via-secondary-100 to-primary-100 -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-6 rounded-xl text-center group hover:border-secondary-500 border-2 border-transparent transition-colors">
                  <div className="w-16 h-16 bg-linear-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-primary-200 group-hover:to-secondary-200 transition-colors">
                    <div className="text-primary-600 group-hover:text-primary-700">{step.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}