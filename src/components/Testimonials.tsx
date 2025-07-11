import React from 'react';
import { Quote } from 'lucide-react';
import Image from 'next/image';

export function Testimonials() {
  const testimonials = [
    {
      quote: "The feedback I received was incredibly detailed and helped me craft an essay that got me into Stanford. It was like having a personal admissions officer guiding me.",
      author: "Sarah Chen",
      status: "Accepted to Stanford '28",
      image: "/image/testemonials/5.jpg"
    },
    {
      quote: "Admissions Intelligence helped me understand exactly what admissions officers are looking for. The AI feedback was spot-on and helped me tell my story in a compelling way.",
      author: "Michael Rodriguez",
      status: "Accepted to Harvard '26",
      image: "/image/testemonials/6.jpg"
    },
    {
      quote: "The platform's feedback was invaluable in helping me craft a unique and authentic essay. It's like having a team of admissions officers reviewing your work.",
      author: "Emily Thompson",
      status: "Accepted to Yale '27",
      image: "/image/testemonials/1.jpg"
    }
  ];

  return (
    <section className="py-20 bg-gray-50" id="testimonials">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-secondary-500 font-semibold mb-2 inline-block">Success Stories</span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Success Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of students who have improved their college essays with our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-secondary-500">
              <Quote className="w-8 h-8 text-secondary-500 mb-4" />
              <p className="text-gray-600 mb-6">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center">
                <Image
                  src={testimonial.image}
                  alt={testimonial.author}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                  priority={false}
                  loading="lazy"
                  unoptimized
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                  <p className="text-sm text-secondary-600">{testimonial.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}