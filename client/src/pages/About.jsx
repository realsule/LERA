import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, 
  Users, 
  Shield, 
  Heart, 
  Award, 
  Target,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Ticket,
      title: 'Easy Event Discovery',
      description: 'Find events that match your interests with our powerful search and filtering system.'
    },
    {
      icon: Users,
      title: 'Connect with Community',
      description: 'Join thousands of event enthusiasts and build meaningful connections.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data and transactions are protected with industry-standard security measures.'
    },
    {
      icon: Award,
      title: 'Trusted Platform',
      description: 'Join thousands of organizers and attendees who trust LERA for their events.'
    }
  ];

  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To make event discovery and booking seamless, accessible, and enjoyable for everyone.'
    },
    {
      icon: Heart,
      title: 'Our Vision',
      description: 'To become the world\'s most trusted platform for connecting people through amazing events.'
    }
  ];

  const stats = [
    { number: '18+', label: 'Events Listed' },
    { number: '5+', label: 'Active Users' },
    { number: '10+', label: 'Categories' },
    { number: '100%', label: 'Satisfaction' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">About LERA</h1>
            <p className="text-xl text-blue-100 mb-8">
              Your premier platform for discovering and booking amazing events. 
              From concerts to conferences, we connect people through unforgettable experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose LERA?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best event discovery and booking experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-indigo-100">
              Join thousands of users discovering amazing events every day
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center px-8 py-3 bg-white text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors duration-200 font-medium"
              >
                Browse Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-3 bg-transparent border-2 border-white text-white rounded-md hover:bg-white hover:text-indigo-600 transition-colors duration-200 font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
