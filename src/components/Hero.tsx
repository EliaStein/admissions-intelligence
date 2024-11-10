import React, { useState, useEffect } from 'react';
import { ArrowRight, GraduationCap, ShieldCheck, Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs';

export function Hero() {
  const [essayText, setEssayText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }, []);

  useEffect(() => {
    const words = essayText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [essayText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim() || !essayText.trim()) return;
    
    if (!showEmailForm) {
      setShowEmailForm(true);
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert('Please enter a valid email address');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      alert('Please enter both first and last name');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          email: email,
          first_name: firstName,
          last_name: lastName,
          essay_prompt: prompt,
          essay_text: essayText,
          word_count: wordCount.toString(),
          to_name: `${firstName} ${lastName}`,
          message: `Essay Prompt: ${prompt}\n\nEssay Text: ${essayText}\n\nWord Count: ${wordCount}`,
        }
      );
      
      setSubmitStatus('success');
      setShowEmailForm(false);
      setPrompt('');
      setEssayText('');
      setEmail('');
      setFirstName('');
      setLastName('');
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-white via-primary-50/30 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
            Transform Your College Essay with
            <span className="text-primary-600"> Expert-Trained AI Feedback</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Get personalized feedback powered by AI trained on insights from former admissions officers.
          </p>

          <div className="flex items-center justify-center space-x-2 mb-12">
            <ShieldCheck className="w-5 h-5 text-secondary-500" />
            <span className="text-gray-600">
              AI review is permitted in college applications when you implement the feedback yourself
            </span>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl p-6 mb-16 relative essay-form-section">
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Essay submitted successfully! We'll send detailed feedback to your email shortly.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 mr-2" />
                There was an error submitting your essay. Please try again.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!showEmailForm ? (
                <>
                  <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                      Essay Prompt *
                    </label>
                    <textarea
                      id="prompt"
                      required
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label htmlFor="essay" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Essay *
                    </label>
                    <textarea
                      id="essay"
                      required
                      value={essayText}
                      onChange={(e) => setEssayText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      rows={10}
                    />
                    <div className="mt-2 text-sm text-gray-500 text-right">
                      Word count: {wordCount}
                    </div>
                  </div>
                </>
              ) : (
                <div className="animate-fadeIn">
                  <div className="text-center mb-6">
                    <Mail className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Almost there!</h3>
                    <p className="text-sm text-gray-500">Please enter your information to receive your personalized feedback</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <button 
                  type="submit"
                  disabled={isSubmitting || (!showEmailForm && (!prompt.trim() || !essayText.trim()))}
                  className="flex items-center space-x-2 bg-primary-600 text-white px-8 py-3 rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>{showEmailForm ? 'Submit Essay' : 'Get Feedback'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-16">
            <p className="text-sm text-gray-500 mb-8">Trained by Former Admissions Officers From</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
              {['Harvard University', 'Stanford University', 'Yale University', 'MIT', 'Duke University'].map((school) => (
                <div 
                  key={school}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 text-center">{school}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}