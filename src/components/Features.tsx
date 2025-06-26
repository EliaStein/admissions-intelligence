import React from 'react';
import { Brain, Target, Clock, Sparkles, Shield, BarChart } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze your essay's structure, clarity, and impact",
      color: "primary"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Personalized Feedback",
      description: "Get specific suggestions tailored to your essay and writing style",
      color: "secondary"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24-Hour Turnaround",
      description: "Receive comprehensive feedback within 24 hours of submission",
      color: "primary"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Writing Enhancement",
      description: "Improve clarity, coherence, and emotional resonance",
      color: "secondary"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Originality Check",
      description: "Ensure your essay remains authentic and plagiarism-free",
      color: "primary"
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: "Progress Tracking",
      description: "Monitor your essay's improvement across multiple revisions",
      color: "secondary"
    }
  ];

  return (
    <section className="py-20 bg-gray-50" id="features">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-secondary-500 font-semibold mb-2 inline-block">Features</span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Features for Perfect Essays
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform combines advanced technology with admissions expertise
            to help you craft the perfect college essay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-transparent hover:border-t-4 hover:border-t-secondary-500"
            >
              <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                <div className={`text-${feature.color}-600`}>{feature.icon}</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}