'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How is this any different from ChatGPT or other AI tools?",
    answer: "Other AI tools give great advice for essay writing, but Admissions Intelligence has been trained by the people reviewing applications at the most selective schools in the US, knowing exactly what makes a student's essay stand out and what is valued in the process."
  },
  {
    question: "Are you sure AI is allowed in the admissions process?",
    answer: "Only when delivering feedback! You are not allowed to write your essay with AI, but colleges have been clear that you are allowed to get feedback from AI in this process, in the same way you might from a parent, friend, or teacher."
  },
  {
    question: "Do you guarantee admission to the schools that I'm applying to?",
    answer: "There are no guarantees in college admissions, so while we will help you present yourself in the best way possible, the final decision will rest with each college."
  },
  {
    question: "Is my information secure and confidential?",
    answer: "Yes. Your essays are encrypted and are never shared with others, and we do not sell or share your information."
  },
  {
    question: "Is this trained for all colleges or just the top ones?",
    answer: "All colleges look for the same qualities in applicants; the top colleges just have the highest standards, which is why we've trained our AI model on how those schools evaluate essays."
  }
];

export function FAQ() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section className="py-20 bg-gray-50" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-secondary-500 font-semibold mb-2 inline-block">FAQ</span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our AI-powered essay feedback service.
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpen = openItems.has(index);
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
                >
                  <h3 className="text-lg font-medium text-gray-900 pr-4">
                    {item.question}
                  </h3>
                  <div className="flex-shrink-0 transition-transform duration-200">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-primary-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-5">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-600 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help.
          </p>
          <a
            href="mailto:info@admissionsintelligence.ai"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}
