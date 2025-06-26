'use client';

import React, { useState } from 'react';
import { FileUp, CheckCircle, RefreshCw, ArrowRight, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs';

export function Journey() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [prompt, setPrompt] = useState('');
  const [wordLimit, setWordLimit] = useState('');
  const [essayText, setEssayText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEmailForm) {
      setShowEmailForm(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          from_email: email,
          prompt: prompt,
          word_limit: wordLimit,
          essay_text: essayText
        },
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting essay:', error);
      alert('There was an error submitting your essay. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your Essay Journey
          </h2>
          <p className="text-lg text-gray-600">
            Submit your essay and get expert feedback
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Essay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}