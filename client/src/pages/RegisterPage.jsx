import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import OAuthButtons from '../components/OAuthButtons';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  PaintBrushIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  UsersIcon,
  RocketLaunchIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { register } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(formData.name, formData.email, formData.password);
      
      if (result.success) {
        toast.success('Account created successfully!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Tools',
      description: 'Smart suggestions and automated workflows to boost productivity'
    },
    {
      icon: UsersIcon,
      title: 'Team Collaboration',
      description: 'Real-time collaboration with unlimited team members'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Lightning Fast',
      description: 'Built for speed with modern web technologies'
    },
    {
      icon: StarIcon,
      title: 'Premium Features',
      description: 'Access to advanced tools and unlimited storage'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager',
      content: 'WhiteBoard has transformed how our team collaborates. The real-time features are incredible!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Design Lead',
      content: 'The drawing tools are so smooth and intuitive. It feels like working on paper but better.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-blue-50 flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className={`text-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-r from-brand-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <PaintBrushIcon className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-3xl text-gray-900">WhiteBoard</span>
            </Link>
          </div>

          <Card className={`shadow-2xl border-0 bg-white/80 backdrop-blur-sm transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <CardHeader className="space-y-1 text-center pb-6">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-blue-600 bg-clip-text text-transparent">
                Create your account
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Start collaborating with your team today
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="h-12 text-base pr-12 transition-all duration-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="h-12 text-base pr-12 transition-all duration-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-brand-600 hover:text-brand-500 font-semibold transition-colors">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-brand-600 hover:text-brand-500 font-semibold transition-colors">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Creating account...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Create Account
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>

              {/* OAuth Login Buttons */}
              <OAuthButtons />

              <div className="text-center pt-4">
                <span className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">
                    Sign in
                  </Link>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-blue-600 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <div className="max-w-lg">
            <div className={`text-white transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-4xl font-bold mb-6">
                Join thousands of teams
              </h2>
              <p className="text-xl text-brand-100 mb-12 leading-relaxed">
                Start your collaborative journey with WhiteBoard and experience the power of real-time teamwork.
              </p>

              <div className="space-y-6 mb-12">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div 
                      key={index} 
                      className={`flex items-start space-x-4 transition-all duration-700 delay-${index * 200} ${
                        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                      }`}
                    >
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{benefit.title}</h3>
                        <p className="text-brand-100">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Testimonials */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">What our users say</h3>
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={index} 
                    className={`bg-white/10 rounded-xl p-4 backdrop-blur-sm transition-all duration-700 delay-${800 + index * 200} ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-brand-100 text-sm mb-2">"{testimonial.content}"</p>
                    <div className="text-white/80 text-sm font-medium">
                      {testimonial.name}, {testimonial.role}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-brand-100 text-sm">Free forever plan</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-brand-100 text-sm">No credit card required</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
