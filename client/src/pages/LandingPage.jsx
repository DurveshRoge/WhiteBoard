import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  PencilIcon, 
  UsersIcon, 
  CloudIcon, 
  BoltIcon,
  CheckIcon,
  ArrowRightIcon,
  SparklesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  StarIcon,
  PlayIcon,
  RocketLaunchIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  PaintBrushIcon,
  LightBulbIcon,
  ClockIcon,
  CursorArrowRaysIcon,
  UserGroupIcon,
  BookOpenIcon,
  LifebuoyIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    
    const testimonialInterval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    
    return () => {
      clearInterval(interval);
      clearInterval(testimonialInterval);
    };
  }, []);

  const features = [
    {
      icon: PaintBrushIcon,
      title: 'Intuitive Drawing Tools',
      description: 'Professional-grade drawing tools with smooth performance, pressure sensitivity, and precise control for every creative need.',
      color: 'from-blue-500 to-cyan-500',
      benefits: ['Pressure-sensitive pen support', 'Vector & raster drawing modes', '50+ brush presets']
    },
    {
      icon: UsersIcon,
      title: 'Real-time Collaboration',
      description: 'Work together seamlessly with your team in real-time. See cursors, edits, and changes as they happen.',
      color: 'from-brand-500 to-blue-500',
      benefits: ['Live cursor tracking', 'Voice & video chat', 'Unlimited team members']
    },
    {
      icon: CloudIcon,
      title: 'Cloud Sync & Storage',
      description: 'Your work is automatically saved and synced across all your devices with enterprise-grade security.',
      color: 'from-green-500 to-emerald-500',
      benefits: ['Auto-save every 30 seconds', 'Version history', '99.9% uptime SLA']
    },
    {
      icon: LightBulbIcon,
      title: 'Smart Templates',
      description: 'Start faster with intelligent templates for brainstorming, planning, design, and collaboration workflows.',
      color: 'from-orange-500 to-red-500',
      benefits: ['100+ ready templates', 'AI-powered suggestions', 'Custom template creation']
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager',
      company: 'TechFlow',
      content: 'WhiteBoard has revolutionized how our distributed team collaborates. The real-time features feel magical!',
      avatar: 'SJ',
      rating: 5,
      bgColor: 'bg-gradient-to-br from-pink-500 to-rose-500'
    },
    {
      name: 'Mike Chen',
      role: 'Design Lead',
      company: 'CreativeStudio',
      content: 'The drawing tools are incredibly smooth and intuitive. It feels like working on paper but with superpowers.',
      avatar: 'MC',
      rating: 5,
      bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-500'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Team Lead',
      company: 'InnovateCorp',
      content: 'Perfect for remote brainstorming sessions. We use it for everything from wireframes to strategy planning.',
      avatar: 'ER',
      rating: 5,
      bgColor: 'bg-gradient-to-br from-blue-500 to-brand-500'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Users', icon: UsersIcon },
    { number: '2M+', label: 'Whiteboards Created', icon: PencilIcon },
    { number: '99.9%', label: 'Uptime', icon: ClockIcon },
    { number: '150+', label: 'Countries', icon: GlobeAltIcon }
  ];

  const useCases = [
    {
      title: 'Design & Prototyping',
      description: 'Create wireframes, mockups, and design systems',
      icon: PaintBrushIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Brainstorming',
      description: 'Ideate and collaborate on new concepts',
      icon: LightBulbIcon,
      color: 'bg-yellow-500'
    },
    {
      title: 'Project Planning',
      description: 'Map out workflows and project timelines',
      icon: ChartBarIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Team Meetings',
      description: 'Visual collaboration during remote meetings',
      icon: UserGroupIcon,
      color: 'bg-brand-500'
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-brand-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <PaintBrushIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-gray-900">WhiteBoard</span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Features</a>
              <a href="#solutions" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Solutions</a>
              <a href="#testimonials" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Reviews</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Button asChild>
                <Link to="/register">
                  Get Started Free
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 via-white to-blue-50">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-400/30 to-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-brand-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-brand-300/20 to-blue-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="secondary" className="mb-6 px-4 py-2">
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Trusted by 50,000+ creative teams worldwide
                </Badge>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
              >
                Where Ideas
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-blue-600 to-brand-700">
                  Come to Life
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed"
              >
                Transform your team's creativity with our intuitive collaborative whiteboard. Draw, brainstorm, and innovate together in real-time, no matter where you are.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <Button asChild size="lg" className="text-lg">
                  <Link to="/register">
                    Start Creating Free
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg">
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex items-center space-x-6 text-sm text-gray-500"
              >
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-8 h-8 bg-gradient-to-r from-brand-400 to-blue-400 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="ml-3">Join 50,000+ creators</span>
                </div>
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[1,2,3,4,5].map(i => (
                      <StarIcon key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2">4.9/5 rating</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Interactive Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl p-8 hover:shadow-3xl transition-all duration-500">
                {/* Mock Whiteboard */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl h-96 relative overflow-hidden border border-gray-200">
                  {/* Grid Background */}
                  <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `
                      linear-gradient(rgb(156 163 175 / 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgb(156 163 175 / 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}></div>
                  
                  {/* Animated Drawing Elements */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute top-8 left-8 w-24 h-16 bg-gradient-to-r from-brand-400 to-blue-400 rounded-lg opacity-80 shadow-lg"
                  />
                  
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      delay: 1
                    }}
                    className="absolute top-16 right-12 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-70 shadow-lg"
                  />
                  
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      x: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 5,
                      repeat: Infinity,
                      delay: 2
                    }}
                    className="absolute bottom-8 left-12 w-32 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-80 shadow-lg"
                  />

                  {/* User Cursors */}
                  <motion.div
                    animate={{ x: [50, 200, 100, 50], y: [100, 80, 150, 100] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-6 h-6 pointer-events-none z-10"
                  >
                    <div className="w-4 h-4 bg-brand-500 rounded-full shadow-lg transform -rotate-45"></div>
                    <Badge variant="secondary" className="absolute -top-8 left-4 text-xs">
                      Sarah
                    </Badge>
                  </motion.div>

                  <motion.div
                    animate={{ x: [200, 50, 180, 200], y: [80, 120, 60, 80] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute w-6 h-6 pointer-events-none z-10"
                  >
                    <div className="w-4 h-4 bg-brand-500 rounded-full shadow-lg transform -rotate-45"></div>
                    <Badge variant="secondary" className="absolute -top-8 left-4 text-xs">
                      Mike
                    </Badge>
                  </motion.div>
                </div>

                {/* Floating Action Buttons */}
                <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 space-y-4">
                  {[PencilIcon, ChatBubbleLeftRightIcon, UsersIcon].map((Icon, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:shadow-xl transition-all"
                    >
                      <Icon className="w-6 h-6 text-brand-600" />
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group cursor-pointer"
                >
                  <div className="flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-brand-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-gray-50 via-white to-brand-50/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <BoltIcon className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600">
                collaborate effectively
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive suite of tools empowers your team to brainstorm, design, and innovate together seamlessly.
            </p>
          </motion.div>

          {/* Features Grid - Horizontal Layout */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="h-full bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-6">
                        {/* Icon Section */}
                        <div className="flex-shrink-0">
                          <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        
                        {/* Content Section */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors">
                            {feature.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed mb-4">
                            {feature.description}
                          </p>
                          
                          {/* Benefits List */}
                          <ul className="space-y-2">
                            {feature.benefits.map((benefit, benefitIndex) => (
                              <li key={benefitIndex} className="flex items-center text-sm text-gray-500">
                                <CheckIcon className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>


        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 bg-gradient-to-br from-brand-600 via-brand-700 to-blue-700 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-8 right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-8 left-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30">
              <RocketLaunchIcon className="w-4 h-4 mr-2" />
              Solutions
            </Badge>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-6">
              Built for every team
              <span className="block text-brand-300">
                and workflow
              </span>
            </h2>
            <p className="text-xl text-brand-100 max-w-3xl mx-auto leading-relaxed">
              From design sprints to strategic planning, WhiteBoard adapts to your team's unique needs with powerful collaboration features.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Solution Categories */}
            <div className="text-white">
              <h3 className="text-3xl font-bold mb-8">
                Perfect for any
                <span className="block text-brand-300">workflow or team</span>
              </h3>
              
              {/* Solution Grid - 2x2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  {
                    icon: PaintBrushIcon,
                    title: 'Design & Creative',
                    features: ['Design Systems', 'Wireframing', 'User Journey Maps', 'Brand Guidelines']
                  },
                  {
                    icon: LightBulbIcon,
                    title: 'Strategy & Planning', 
                    features: ['Strategic Planning', 'Roadmaps', 'SWOT Analysis', 'Goal Setting']
                  },
                  {
                    icon: UserGroupIcon,
                    title: 'Team Collaboration',
                    features: ['Remote Workshops', 'Team Meetings', 'Retrospectives', 'Daily Standups']
                  },
                  {
                    icon: ChartBarIcon,
                    title: 'Project Management',
                    features: ['Project Planning', 'Task Management', 'Timeline Views', 'Progress Tracking']
                  }
                ].map((solution, index) => {
                  const Icon = solution.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm mb-2 group-hover:text-brand-300 transition-colors">
                            {solution.title}
                          </h4>
                          <div className="space-y-1">
                            {solution.features.slice(0, 2).map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center text-xs text-brand-200">
                                <CheckIcon className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                                <span className="truncate">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <Button size="lg" variant="glass" className="text-white border-white/30 hover:bg-white/10">
                <PlayIcon className="w-5 h-5 mr-2" />
                Explore All Solutions
              </Button>
            </div>

            {/* Right: Interactive Demo */}
            <div className="relative">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl overflow-hidden">
                <CardContent className="p-6">
                  {/* Mock Whiteboard */}
                  <div className="bg-white rounded-2xl h-64 relative overflow-hidden">
                    {/* Grid Background */}
                    <div 
                      className="absolute inset-0 opacity-20" 
                      style={{
                        backgroundImage: `
                          linear-gradient(rgb(156 163 175 / 0.3) 1px, transparent 1px),
                          linear-gradient(90deg, rgb(156 163 175 / 0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px'
                      }}
                    ></div>
                    
                    {/* Animated Shapes */}
                    <motion.div
                      animate={{ 
                        x: [20, 120, 60, 20],
                        y: [30, 80, 140, 30],
                        rotate: [0, 45, -45, 0]
                      }}
                      transition={{ 
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-lg"
                    />
                    
                    <motion.div
                      animate={{ 
                        x: [160, 60, 140, 160],
                        y: [50, 120, 40, 50],
                        scale: [1, 1.2, 0.8, 1]
                      }}
                      transition={{ 
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                      className="absolute w-8 h-16 bg-gradient-to-r from-brand-500 to-pink-500 rounded-full shadow-lg"
                    />

                    <motion.div
                      animate={{ 
                        x: [80, 180, 40, 80],
                        y: [120, 60, 100, 120]
                      }}
                      transition={{ 
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                      }}
                      className="absolute w-16 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg"
                    />

                    {/* Live User Cursors */}
                    <motion.div
                      animate={{ x: [40, 160, 80, 40], y: [80, 40, 160, 80] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute pointer-events-none"
                    >
                      <div className="w-4 h-4 bg-brand-500 rounded-full shadow-lg transform -rotate-45"></div>
                      <Badge variant="secondary" className="absolute -top-8 left-4 text-xs bg-brand-500 text-white">
                        Alex
                      </Badge>
                    </motion.div>

                    <motion.div
                      animate={{ x: [140, 60, 180, 140], y: [120, 180, 60, 120] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                      className="absolute pointer-events-none"
                    >
                      <div className="w-4 h-4 bg-brand-500 rounded-full shadow-lg transform -rotate-45"></div>
                      <Badge variant="secondary" className="absolute -top-8 left-4 text-xs bg-brand-500 text-white">
                        Sam
                      </Badge>
                    </motion.div>
                  </div>

                  {/* Status Bar */}
                  <div className="flex items-center justify-between mt-4 text-white/80">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm">2 users online</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Auto-saved</span>
                      <CheckIcon className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-white via-brand-50/30 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <HeartIcon className="w-4 h-4 mr-2" />
              Customer Stories
            </Badge>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Loved by teams
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600">
                worldwide
              </span>
            </h2>
          </motion.div>

          {/* Featured Testimonial */}
          <motion.div
            key={activeTestimonial}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-white/20 shadow-2xl">
              <CardContent className="p-12 text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <StarIcon key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-2xl text-gray-700 mb-8 leading-relaxed font-medium">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center space-x-4">
                  <div className={`w-16 h-16 ${testimonials[activeTestimonial].bgColor} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-xl font-bold">
                      {testimonials[activeTestimonial].avatar}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 text-lg">{testimonials[activeTestimonial].name}</div>
                    <div className="text-gray-600">{testimonials[activeTestimonial].role}</div>
                    <div className="text-brand-600 font-medium">{testimonials[activeTestimonial].company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Testimonial Navigation */}
          <div className="flex justify-center space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeTestimonial 
                    ? 'bg-brand-500 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => setActiveTestimonial(index)}
              />
            ))}
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-gray-500 mb-8">Trusted by innovative teams at</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Tesla'].map((company, index) => (
                <div key={index} className="text-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors">
                  {company}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to transform your collaboration?
            </h2>
            <p className="text-xl text-brand-100 mb-8 max-w-3xl mx-auto">
              Join thousands of teams already using WhiteBoard to bring their ideas to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="glass" className="text-lg">
                <Link to="/register">
                  Start Creating Free
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg border-white/30 hover:bg-white/10">
                <PlayIcon className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative">
          {/* Newsletter Section */}
          <div className="border-b border-gray-700/50 py-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center max-w-3xl mx-auto"
              >
                <h3 className="text-3xl font-bold text-white mb-4">
                  Stay updated with WhiteBoard
                </h3>
                <p className="text-gray-400 mb-8 text-lg">
                  Get the latest features, tips, and insights delivered to your inbox
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  <Button className="px-8 py-3 bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700">
                    Subscribe
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <p className="text-gray-500 text-sm mt-4">
                  No spam, unsubscribe at any time
                </p>
              </motion.div>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="py-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="grid lg:grid-cols-5 gap-12 mb-12">
                {/* Brand Section */}
                <div className="lg:col-span-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-brand-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <PaintBrushIcon className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-heading font-bold text-2xl text-white">WhiteBoard</span>
                    </div>
                    <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                      The most intuitive collaborative whiteboard for modern teams. Transform ideas into reality with seamless collaboration.
                    </p>
                    
                    {/* Social Links */}
                    <div className="flex space-x-4 mb-6">
                      {[
                        { name: 'Twitter', icon: 'T', color: 'hover:bg-blue-600' },
                        { name: 'GitHub', icon: 'G', color: 'hover:bg-gray-600' },
                        { name: 'LinkedIn', icon: 'L', color: 'hover:bg-blue-700' },
                        { name: 'Discord', icon: 'D', color: 'hover:bg-indigo-600' }
                      ].map((social) => (
                        <motion.a
                          key={social.name}
                          href="#"
                          whileHover={{ scale: 1.1, y: -2 }}
                          className={`w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 ${social.color}`}
                        >
                          <span className="sr-only">{social.name}</span>
                          <span className="font-bold text-lg">{social.icon}</span>
                        </motion.a>
                      ))}
                    </div>

                    {/* Awards/Recognition */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span>4.9/5 on G2</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <span>99.9% Uptime</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Product Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-white font-semibold mb-6 flex items-center">
                    <CodeBracketIcon className="w-5 h-5 mr-2 text-brand-400" />
                    Product
                  </h3>
                  <ul className="space-y-4">
                    {['Features', 'Templates', 'Integrations', 'API Docs', 'What\'s New'].map((item) => (
                      <li key={item}>
                        <a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 flex items-center group">
                          <ArrowRightIcon className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
                
                {/* Company Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-white font-semibold mb-6 flex items-center">
                    <UserGroupIcon className="w-5 h-5 mr-2 text-brand-400" />
                    Company
                  </h3>
                  <ul className="space-y-4">
                    {['About Us', 'Blog', 'Careers', 'Press Kit', 'Contact'].map((item) => (
                      <li key={item}>
                        <a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 flex items-center group">
                          <ArrowRightIcon className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {item}
                          {item === 'Careers' && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              We're hiring!
                            </Badge>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
                
                {/* Resources Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-white font-semibold mb-6 flex items-center">
                    <BookOpenIcon className="w-5 h-5 mr-2 text-brand-400" />
                    Resources
                  </h3>
                  <ul className="space-y-4">
                    {[
                      { name: 'Help Center', badge: null },
                      { name: 'Documentation', badge: null },
                      { name: 'Community', badge: 'Active' },
                      { name: 'System Status', badge: null },
                      { name: 'Security', badge: null }
                    ].map((item) => (
                      <li key={item.name}>
                        <a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 flex items-center group">
                          <ArrowRightIcon className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {item.name}
                          {item.badge && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
              
              <Separator className="bg-gray-700/50 mb-8" />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0"
              >
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="text-gray-400 text-sm">
                    © 2025 WhiteBoard. All rights reserved.
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <span>Made with</span>
                    <HeartIcon className="w-4 h-4 text-red-500 fill-current" />
                    <span>for creative teams</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-6">
                  {[
                    'Privacy Policy',
                    'Terms of Service',
                    'Cookie Policy',
                    'GDPR'
                  ].map((item, index) => (
                    <a
                      key={item}
                      href="#"
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
