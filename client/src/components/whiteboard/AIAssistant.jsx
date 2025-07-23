import React, { useState, useRef } from 'react';
import { 
  SparklesIcon, 
  XMarkIcon, 
  LightBulbIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PaintBrushIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import axios from 'axios';
import { toast } from 'sonner';

const AIAssistant = ({ 
  isOpen, 
  onClose, 
  onApplySuggestion, 
  boardTitle = '', 
  elements = [],
  onApplyFlowchart,
  onApplyColorScheme 
}) => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [flowchart, setFlowchart] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [colorScheme, setColorScheme] = useState(null);
  const [textSuggestions, setTextSuggestions] = useState([]);
  
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [boardType, setBoardType] = useState('general');

  const tabs = [
    { id: 'suggestions', label: 'Suggestions', icon: LightBulbIcon },
    { id: 'flowchart', label: 'Flowchart', icon: ChartBarIcon },
    { id: 'analyze', label: 'Analyze', icon: MagnifyingGlassIcon },
    { id: 'text', label: 'Text Help', icon: DocumentTextIcon },
    { id: 'colors', label: 'Colors', icon: PaintBrushIcon }
  ];

  // Generate drawing suggestions
  const generateSuggestions = async () => {
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('api/ai/suggestions', {
        description: description.trim(),
        boardContext: boardTitle
      });

      setSuggestions(response.data.data.suggestions || []);
      toast.success('Suggestions generated!');
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  // Generate flowchart
  const generateFlowchart = async () => {
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('api/ai/flowchart', {
        description: description.trim()
      });

      setFlowchart(response.data.data);
      toast.success('Flowchart generated!');
    } catch (error) {
      console.error('Error generating flowchart:', error);
      toast.error('Failed to generate flowchart');
    } finally {
      setLoading(false);
    }
  };

  // Analyze board content
  const analyzeBoard = async () => {
    if (elements.length === 0) {
      toast.error('No elements to analyze');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('api/ai/analyze', {
        elements: elements,
        boardTitle: boardTitle
      });

      setAnalysis(response.data.data.analysis);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Error analyzing board:', error);
      toast.error('Failed to analyze board');
    } finally {
      setLoading(false);
    }
  };

  // Generate text suggestions
  const generateTextSuggestions = async () => {
    if (!context.trim()) {
      toast.error('Please enter context');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('api/ai/text-suggestions', {
        context: context.trim(),
        currentText: currentText.trim()
      });

      setTextSuggestions(response.data.data.suggestions || []);
      toast.success('Text suggestions generated!');
    } catch (error) {
      console.error('Error generating text suggestions:', error);
      toast.error('Failed to generate text suggestions');
    } finally {
      setLoading(false);
    }
  };

  // Generate color scheme
  const generateColorScheme = async () => {
    setLoading(true);
    try {
      const response = await axios.post('api/ai/color-scheme', {
        boardType: boardType
      });

      setColorScheme(response.data.data);
      toast.success('Color scheme generated!');
    } catch (error) {
      console.error('Error generating color scheme:', error);
      toast.error('Failed to generate color scheme');
    } finally {
      setLoading(false);
    }
  };

  // Apply suggestion to board
  const applySuggestion = (suggestion) => {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion);
      toast.success('Suggestion applied!');
    }
  };

  // Apply flowchart to board
  const applyFlowchart = () => {
    if (flowchart && onApplyFlowchart) {
      onApplyFlowchart(flowchart);
      toast.success('Flowchart applied!');
    }
  };

  // Apply color scheme
  const applyColorScheme = () => {
    if (colorScheme && onApplyColorScheme) {
      onApplyColorScheme(colorScheme.colorScheme);
      toast.success('Color scheme applied!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to add to your whiteboard?
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Add a decision diamond for user authentication flow"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <Button
                onClick={generateSuggestions}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LightBulbIcon className="w-4 h-4 mr-2" />
                )}
                Generate Suggestions
              </Button>

              {suggestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Suggestions:</h3>
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2">{suggestion.explanation}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Type: {suggestion.type} | Position: ({suggestion.x}, {suggestion.y})
                          {suggestion.text && ` | Text: "${suggestion.text}"`}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => applySuggestion(suggestion)}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Flowchart Tab */}
          {activeTab === 'flowchart' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe the process for your flowchart
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., User registration process with email verification"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <Button
                onClick={generateFlowchart}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                )}
                Generate Flowchart
              </Button>

              {flowchart && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">Generated Flowchart:</h3>
                    <Button size="sm" onClick={applyFlowchart}>
                      Apply to Board
                    </Button>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(flowchart, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analyze Tab */}
          {activeTab === 'analyze' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  AI will analyze your current whiteboard and provide insights and suggestions.
                </p>
                <Button
                  onClick={analyzeBoard}
                  disabled={loading || elements.length === 0}
                  className="w-full"
                >
                  {loading ? (
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                  )}
                  Analyze Board
                </Button>
              </div>

              {analysis && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Analysis Results:</h3>
                  
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Board Type:</h4>
                    <p className="text-sm text-gray-600 capitalize">{analysis.type}</p>
                  </div>

                  {analysis.suggestions && analysis.suggestions.length > 0 && (
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Suggestions:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {analysis.suggestions.map((suggestion, index) => (
                          <li key={index}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.missingElements && analysis.missingElements.length > 0 && (
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Missing Elements:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {analysis.missingElements.map((element, index) => (
                          <li key={index}>• {element}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.organization && (
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Organization:</h4>
                      <p className="text-sm text-gray-600">{analysis.organization}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Text Help Tab */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Context for text suggestions
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g., Button label for user login"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current text (optional)
                </label>
                <input
                  type="text"
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  placeholder="Current text to improve"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <Button
                onClick={generateTextSuggestions}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                )}
                Generate Text Suggestions
              </Button>

              {textSuggestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Text Suggestions:</h3>
                  {textSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        {suggestion.text}
                      </p>
                      <p className="text-xs text-gray-600">{suggestion.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Board Type
                </label>
                <select
                  value={boardType}
                  onChange={(e) => setBoardType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="business">Business</option>
                  <option value="technical">Technical</option>
                  <option value="creative">Creative</option>
                  <option value="education">Education</option>
                </select>
              </div>
              
              <Button
                onClick={generateColorScheme}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <PaintBrushIcon className="w-4 h-4 mr-2" />
                )}
                Generate Color Scheme
              </Button>

              {colorScheme && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">Color Scheme:</h3>
                    <Button size="sm" onClick={applyColorScheme}>
                      Apply to Board
                    </Button>
                  </div>
                  
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">{colorScheme.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(colorScheme.colorScheme).map(([key, color]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm text-gray-700 capitalize">{key}</span>
                          <span className="text-xs text-gray-500">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant; 