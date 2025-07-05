import React, { useState } from 'react';
import { 
  XMarkIcon,
  DocumentTextIcon,
  ChartBarIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  LightBulbIcon,
  CogIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';

// FONT SIZE POLICY FOR BOARD TEMPLATES:
// - Use fontSize: 12 for small shapes (nodes, sticky-notes, diamonds, small rectangles/circles)
// - Use fontSize: 14 for medium shapes
// - Use fontSize: 18-24 and fontWeight: 'bold' for headers
// - Always use align: 'center', verticalAlign: 'middle', fontFamily: 'Arial'
// - Use fill: '#000' for light backgrounds, '#fff' for dark backgrounds
// - All text elements' x, y, width, height must match their parent shape
// - No manual offsetting of text
// - All text must be perfectly centered and never overflow its parent shape
//
// If you add new templates, follow this policy for all text elements.

const BoardTemplates = ({ isOpen, onClose, onApplyTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = [
    {
      id: 'blank',
      name: 'Blank Canvas',
      description: 'Start with a clean slate',
      category: 'general',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjZGRkIi8+Cjwvc3ZnPgo=',
      elements: []
    },
    {
      id: 'mindmap',
      name: 'Mind Map',
      description: 'Organize ideas in a hierarchical structure',
      category: 'brainstorming',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSI3NSIgcj0iMjAiIGZpbGw9IiM2MGE2ZjEiLz4KPGNpcmNsZSBjeD0iNjAiIGN5PSI0MCIgcj0iMTUiIGZpbGw9IiM5Y2EzYWYiLz4KPGNpcmNsZSBjeD0iMTQwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjOWNhM2FmIi8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iMTEwIiByPSIxNSIgZmlsbD0iIzljYTNhZiIvPgo8Y2lyY2xlIGN4PSIxNDAiIGN5PSIxMTAiIHI9IjE1IiBmaWxsPSIjOWNhM2FmIi8+CjxsaW5lIHgxPSI4MCIgeTE9IjU1IiB4Mj0iNzUiIHkyPSI0MCIgc3Ryb2tlPSIjNjZhNmYxIiBzdHJva2Utd2lkdGg9IjIiLz4KPGxpbmUgeDE9IjEyMCIgeTE9IjU1IiB4Mj0iMTI1IiB5Mj0iNDAiIHN0cm9rZT0iIzY2YTZmMSIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxsaW5lIHgxPSI4MCIgeTE9Ijk1IiB4Mj0iNzUiIHkyPSIxMTAiIHN0cm9rZT0iIzY2YTZmMSIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxsaW5lIHgxPSIxMjAiIHkxPSI5NSIgeDI9IjEyNSIgeTI9IjExMCIgc3Ryb2tlPSIjNjZhNmYxIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+Cg==',
      elements: [
        {
          id: 'center',
          type: 'circle',
          x: 1000,
          y: 500,
          width: 120,
          height: 120,
          fill: '#60a6f1',
          stroke: '#3b82f6',
          strokeWidth: 2
        },
        {
          id: 'center-text',
          type: 'text',
          x: 1000,
          y: 500,
          width: 120,
          height: 120,
          text: 'Main Topic',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'node1',
          type: 'circle',
          x: 800,
          y: 300,
          width: 100,
          height: 100,
          fill: '#9ca3af',
          stroke: '#6b7280',
          strokeWidth: 2
        },
        {
          id: 'node1-text',
          type: 'text',
          x: 800,
          y: 300,
          width: 100,
          height: 100,
          text: 'Idea 1',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'node2',
          type: 'circle',
          x: 1200,
          y: 300,
          width: 100,
          height: 100,
          fill: '#9ca3af',
          stroke: '#6b7280',
          strokeWidth: 2
        },
        {
          id: 'node2-text',
          type: 'text',
          x: 1200,
          y: 300,
          width: 100,
          height: 100,
          text: 'Idea 2',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'node3',
          type: 'circle',
          x: 800,
          y: 700,
          width: 100,
          height: 100,
          fill: '#9ca3af',
          stroke: '#6b7280',
          strokeWidth: 2
        },
        {
          id: 'node3-text',
          type: 'text',
          x: 800,
          y: 700,
          width: 100,
          height: 100,
          text: 'Idea 3',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'node4',
          type: 'circle',
          x: 1200,
          y: 700,
          width: 100,
          height: 100,
          fill: '#9ca3af',
          stroke: '#6b7280',
          strokeWidth: 2
        },
        {
          id: 'node4-text',
          type: 'text',
          x: 1200,
          y: 700,
          width: 100,
          height: 100,
          text: 'Idea 4',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'connector1',
          type: 'connector',
          x: 1060,
          y: 560,
          endX: 850,
          endY: 350,
          stroke: '#60a6f1',
          strokeWidth: 2
        },
        {
          id: 'connector2',
          type: 'connector',
          x: 1140,
          y: 560,
          endX: 1150,
          endY: 350,
          stroke: '#60a6f1',
          strokeWidth: 2
        },
        {
          id: 'connector3',
          type: 'connector',
          x: 1060,
          y: 440,
          endX: 850,
          endY: 750,
          stroke: '#60a6f1',
          strokeWidth: 2
        },
        {
          id: 'connector4',
          type: 'connector',
          x: 1140,
          y: 440,
          endX: 1150,
          endY: 750,
          stroke: '#60a6f1',
          strokeWidth: 2
        }
      ]
    },
    {
      id: 'flowchart',
      name: 'Flowchart',
      description: 'Create process flows and decision trees',
      category: 'process',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSI4MCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2YzZjRmNiIgc3Ryb2tlPSIjZGRkIi8+CjxyZWN0IHg9IjgwIiB5PSI1MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZmVmM2M3IiBzdHJva2U9IiNkZGQiLz4KPHJlY3QgeD0iODAiIHk9IjgwIiB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIGZpbGw9IiNmM2Y0ZjYiIHN0cm9rZT0iI2RkZCIvPgo8cmVjdCB4PSI4MCIgeT0iMTEwIiB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIGZpbGw9IiNmZWYzYzciIHN0cm9rZT0iI2RkZCIvPgo8bGluZSB4MT0iMTAwIiB5MT0iMzAiIHgyPSIxMDAiIHkyPSI1MCIgc3Ryb2tlPSIjNjZhNmYxIiBzdHJva2Utd2lkdGg9IjIiLz4KPGxpbmUgeDE9IjEwMCIgeTE9IjcwIiB4Mj0iMTAwIiB5Mj0iODAiIHN0cm9rZT0iIzY2YTZmMSIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxsaW5lIHgxPSIxMDAiIHkxPSIxMDAiIHgyPSIxMDAiIHkyPSIxMTAiIHN0cm9rZT0iIzY2YTZmMSIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo=',
      elements: [
        {
          id: 'start',
          type: 'flowchart',
          flowchartType: 'start',
          x: 1000,
          y: 100,
          width: 120,
          height: 60,
          fill: '#f3f4f6',
          stroke: '#d1d5db',
          strokeWidth: 2
        },
        {
          id: 'start-text',
          type: 'text',
          x: 1000,
          y: 100,
          width: 120,
          height: 60,
          text: 'Start',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'process1',
          type: 'flowchart',
          flowchartType: 'process',
          x: 1000,
          y: 200,
          width: 120,
          height: 60,
          fill: '#fef3c7',
          stroke: '#d1d5db',
          strokeWidth: 2
        },
        {
          id: 'process1-text',
          type: 'text',
          x: 1000,
          y: 200,
          width: 120,
          height: 60,
          text: 'Process 1',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'decision',
          type: 'flowchart',
          flowchartType: 'decision',
          x: 1000,
          y: 300,
          width: 120,
          height: 80,
          fill: '#fef3c7',
          stroke: '#d1d5db',
          strokeWidth: 2
        },
        {
          id: 'decision-text',
          type: 'text',
          x: 1000,
          y: 300,
          width: 120,
          height: 80,
          text: 'Decision?',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'process2',
          type: 'flowchart',
          flowchartType: 'process',
          x: 1000,
          y: 420,
          width: 120,
          height: 60,
          fill: '#fef3c7',
          stroke: '#d1d5db',
          strokeWidth: 2
        },
        {
          id: 'process2-text',
          type: 'text',
          x: 1000,
          y: 420,
          width: 120,
          height: 60,
          text: 'Process 2',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'end',
          type: 'flowchart',
          flowchartType: 'end',
          x: 1000,
          y: 520,
          width: 120,
          height: 60,
          fill: '#f3f4f6',
          stroke: '#d1d5db',
          strokeWidth: 2
        },
        {
          id: 'end-text',
          type: 'text',
          x: 1000,
          y: 520,
          width: 120,
          height: 60,
          text: 'End',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'connector1',
          type: 'connector',
          x: 1060,
          y: 160,
          endX: 1060,
          endY: 200,
          stroke: '#60a6f1',
          strokeWidth: 2
        },
        {
          id: 'connector2',
          type: 'connector',
          x: 1060,
          y: 260,
          endX: 1060,
          endY: 300,
          stroke: '#60a6f1',
          strokeWidth: 2
        },
        {
          id: 'connector3',
          type: 'connector',
          x: 1060,
          y: 380,
          endX: 1060,
          endY: 420,
          stroke: '#60a6f1',
          strokeWidth: 2
        },
        {
          id: 'connector4',
          type: 'connector',
          x: 1060,
          y: 480,
          endX: 1060,
          endY: 520,
          stroke: '#60a6f1',
          strokeWidth: 2
        }
      ]
    },
    {
      id: 'kanban',
      name: 'Kanban Board',
      description: 'Organize tasks and track progress',
      category: 'project',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSIxMzAiIGZpbGw9IiNmM2Y0ZjYiIHN0cm9rZT0iI2RkZCIvPgo8cmVjdCB4PSI3MCIgeT0iMTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSIxMzAiIGZpbGw9IiNmZWYzYzciIHN0cm9rZT0iI2RkZCIvPgo8cmVjdCB4PSIxMzAiIHk9IjEwIiB3aWR0aD0iNTAiIGhlaWdodD0iMTMwIiBmaWxsPSIjZGRmYmNiIiBzdHJva2U9IiNkZGQiLz4KPHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iMzAiIGhlaWdodD0iMjAiIGZpbGw9IiNmZWYzYzciIHN0cm9rZT0iI2RkZCIvLz4KPHJlY3QgeD0iODAiIHk9IjIwIiB3aWR0aD0iMzAiIGhlaWdodD0iMjAiIGZpbGw9IiNmZWYzYzciIHN0cm9rZT0iI2RkZCIvLz4KPHJlY3QgeD0iMTQwIiB5PSIyMCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZGRmYmNiIiBzdHJva2U9IiNkZGQiLz4KPC9zdmc+Cg==',
      elements: [
        {
          id: 'todo-col',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 200,
          height: 800,
          fill: '#f3f4f6',
          stroke: '#d1d5db',
          strokeWidth: 2
        },
        {
          id: 'todo-text',
          type: 'text',
          x: 100,
          y: 120,
          width: 200,
          height: 40,
          text: 'To Do',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#374151',
          align: 'center',
          verticalAlign: 'middle',
          fontWeight: 'bold'
        },
        {
          id: 'inprogress-col',
          type: 'rectangle',
          x: 350,
          y: 100,
          width: 200,
          height: 800,
          fill: '#fef3c7',
          stroke: '#d1d5db',
          strokeWidth: 2
        },
        {
          id: 'inprogress-text',
          type: 'text',
          x: 350,
          y: 120,
          width: 200,
          height: 40,
          text: 'In Progress',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#374151',
          align: 'center',
          verticalAlign: 'middle',
          fontWeight: 'bold'
        },
        {
          id: 'done-col',
          type: 'rectangle',
          x: 600,
          y: 100,
          width: 200,
          height: 800,
          fill: '#dcfce7',
          stroke: '#d1d5db',
          strokeWidth: 2
        },
        {
          id: 'done-text',
          type: 'text',
          x: 600,
          y: 120,
          width: 200,
          height: 40,
          text: 'Done',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#374151',
          align: 'center',
          verticalAlign: 'middle',
          fontWeight: 'bold'
        },
        {
          id: 'task1',
          type: 'sticky-note',
          x: 120,
          y: 150,
          width: 160,
          height: 80,
          fill: '#fef3c7',
          stroke: '#d1d5db',
          strokeWidth: 1
        },
        {
          id: 'task1-text',
          type: 'text',
          x: 120,
          y: 150,
          width: 160,
          height: 80,
          text: 'Task 1',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'task2',
          type: 'sticky-note',
          x: 370,
          y: 150,
          width: 160,
          height: 80,
          fill: '#fef3c7',
          stroke: '#d1d5db',
          strokeWidth: 1
        },
        {
          id: 'task2-text',
          type: 'text',
          x: 370,
          y: 150,
          width: 160,
          height: 80,
          text: 'Task 2',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'task3',
          type: 'sticky-note',
          x: 620,
          y: 150,
          width: 160,
          height: 80,
          fill: '#dcfce7',
          stroke: '#d1d5db',
          strokeWidth: 1
        },
        {
          id: 'task3-text',
          type: 'text',
          x: 620,
          y: 150,
          width: 160,
          height: 80,
          text: 'Task 3',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'center',
          verticalAlign: 'middle'
        }
      ]
    },
    {
      id: 'meeting',
      name: 'Meeting Notes',
      description: 'Structure for meeting agendas and notes',
      category: 'business',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxODAiIGhlaWdodD0iMzAiIGZpbGw9IiM2MGE2ZjEiIHN0cm9rZT0iI2RkZCIvPgo8cmVjdCB4PSIxMCIgeT0iNTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2YzZjRmNiIgc3Ryb2tlPSIjZGRkIi8+CjxyZWN0IHg9IjEwMCIgeT0iNTAiIHdpZHRoPSI5MCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2YzZjRmNiIgc3Ryb2tlPSIjZGRkIi8+CjxyZWN0IHg9IjEwIiB5PSI4MCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSI2MCIgZmlsbD0iI2Z3ZiIgc3Ryb2tlPSIjZGRkIi8+Cjwvc3ZnPgo=',
      elements: [
        {
          id: 'header',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 2800,
          height: 120,
          fill: '#60a6f1',
          stroke: '#3b82f6',
          strokeWidth: 2
        },
        {
          id: 'header-text',
          type: 'text',
          x: 100,
          y: 100,
          width: 2800,
          height: 120,
          text: 'Meeting Title',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          verticalAlign: 'middle',
          fontWeight: 'bold'
        },
        {
          id: 'agenda',
          type: 'rectangle',
          x: 100,
          y: 250,
          width: 1350,
          height: 600,
          fill: '#f3f4f6',
          stroke: '#d1d5db',
          strokeWidth: 2
        },
        {
          id: 'agenda-text',
          type: 'text',
          x: 100,
          y: 270,
          width: 1350,
          height: 40,
          text: 'Agenda',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#374151',
          align: 'center',
          verticalAlign: 'middle',
          fontWeight: 'bold'
        },
        {
          id: 'notes',
          type: 'rectangle',
          x: 1550,
          y: 250,
          width: 1350,
          height: 600,
          fill: '#ffffff',
          stroke: '#d1d5db',
          strokeWidth: 2
        },
        {
          id: 'notes-text',
          type: 'text',
          x: 1550,
          y: 270,
          width: 1350,
          height: 40,
          text: 'Notes',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#374151',
          align: 'center',
          verticalAlign: 'middle',
          fontWeight: 'bold'
        },
        {
          id: 'agenda-item1',
          type: 'sticky-note',
          x: 150,
          y: 300,
          width: 300,
          height: 80,
          fill: '#fef3c7',
          stroke: '#d1d5db',
          strokeWidth: 1
        },
        {
          id: 'agenda-item1-text',
          type: 'text',
          x: 150,
          y: 300,
          width: 300,
          height: 80,
          text: 'Agenda Item 1',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'agenda-item2',
          type: 'sticky-note',
          x: 150,
          y: 400,
          width: 300,
          height: 80,
          fill: '#fef3c7',
          stroke: '#d1d5db',
          strokeWidth: 1
        },
        {
          id: 'agenda-item2-text',
          type: 'text',
          x: 150,
          y: 400,
          width: 300,
          height: 80,
          text: 'Agenda Item 2',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'agenda-item3',
          type: 'sticky-note',
          x: 150,
          y: 500,
          width: 300,
          height: 80,
          fill: '#fef3c7',
          stroke: '#d1d5db',
          strokeWidth: 1
        },
        {
          id: 'agenda-item3-text',
          type: 'text',
          x: 150,
          y: 500,
          width: 300,
          height: 80,
          text: 'Agenda Item 3',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'center',
          verticalAlign: 'middle'
        }
      ]
    },
    {
      id: 'education',
      name: 'Lesson Plan',
      description: 'Structure for educational content and activities',
      category: 'education',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxODAiIGhlaWdodD0iMzAiIGZpbGw9IiM2MGE2ZjEiIHN0cm9rZT0iI2RkZCIvPgo8cmVjdCB4PSIxMCIgeT0iNTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2YzZjRmNiIgc3Ryb2tlPSIjZGRkIi8+CjxyZWN0IHg9IjEwMCIgeT0iNTAiIHdpZHRoPSI5MCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2YzZjRmNiIgc3Ryb2tlPSIjZGRkIi8+CjxyZWN0IHg9IjEwIiB5PSI4MCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSI2MCIgZmlsbD0iI2Z3ZiIgc3Ryb2tlPSIjZGRkIi8+Cjwvc3ZnPgo=',
      elements: [
        {
          id: 'title',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 2800,
          height: 120,
          fill: '#60a6f1',
          stroke: '#3b82f6',
          strokeWidth: 2
        },
        {
          id: 'title-text',
          type: 'text',
          x: 100,
          y: 100,
          width: 2800,
          height: 120,
          text: 'Lesson Title',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          verticalAlign: 'middle',
          fontWeight: 'bold'
        },
        {
          id: 'objectives',
          type: 'rectangle',
          x: 100,
          y: 250,
          width: 900,
          height: 400,
          fill: '#f3f4f6',
          stroke: '#d1d5db',
          strokeWidth: 2
        },
        {
          id: 'objectives-text',
          type: 'text',
          x: 100,
          y: 270,
          width: 900,
          height: 40,
          text: 'Learning Objectives',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#374151',
          align: 'center',
          verticalAlign: 'middle',
          fontWeight: 'bold'
        },
        {
          id: 'activities',
          type: 'rectangle',
          x: 1050,
          y: 250,
          width: 900,
          height: 400,
          fill: '#fef3c7',
          stroke: '#d1d5db',
          strokeWidth: 2
        },
        {
          id: 'activities-text',
          type: 'text',
          x: 1050,
          y: 270,
          width: 900,
          height: 40,
          text: 'Activities',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#374151',
          align: 'center',
          verticalAlign: 'middle',
          fontWeight: 'bold'
        },
        {
          id: 'assessment',
          type: 'rectangle',
          x: 2000,
          y: 250,
          width: 900,
          height: 400,
          fill: '#dcfce7',
          stroke: '#d1d5db',
          strokeWidth: 2
        },
        {
          id: 'assessment-text',
          type: 'text',
          x: 2000,
          y: 270,
          width: 900,
          height: 40,
          text: 'Assessment',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#374151',
          align: 'center',
          verticalAlign: 'middle',
          fontWeight: 'bold'
        },
        {
          id: 'obj1',
          type: 'sticky-note',
          x: 150,
          y: 300,
          width: 200,
          height: 60,
          fill: '#ffffff',
          stroke: '#d1d5db',
          strokeWidth: 1
        },
        {
          id: 'obj1-text',
          type: 'text',
          x: 150,
          y: 300,
          width: 200,
          height: 60,
          text: 'Objective 1',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'obj2',
          type: 'sticky-note',
          x: 150,
          y: 380,
          width: 200,
          height: 60,
          fill: '#ffffff',
          stroke: '#d1d5db',
          strokeWidth: 1
        },
        {
          id: 'obj2-text',
          type: 'text',
          x: 150,
          y: 380,
          width: 200,
          height: 60,
          text: 'Objective 2',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'act1',
          type: 'sticky-note',
          x: 1100,
          y: 300,
          width: 200,
          height: 60,
          fill: '#ffffff',
          stroke: '#d1d5db',
          strokeWidth: 1
        },
        {
          id: 'act1-text',
          type: 'text',
          x: 1100,
          y: 300,
          width: 200,
          height: 60,
          text: 'Activity 1',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'center',
          verticalAlign: 'middle'
        },
        {
          id: 'act2',
          type: 'sticky-note',
          x: 1100,
          y: 380,
          width: 200,
          height: 60,
          fill: '#ffffff',
          stroke: '#d1d5db',
          strokeWidth: 1
        },
        {
          id: 'act2-text',
          type: 'text',
          x: 1100,
          y: 380,
          width: 200,
          height: 60,
          text: 'Activity 2',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'center',
          verticalAlign: 'middle'
        }
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', icon: DocumentTextIcon },
    { id: 'brainstorming', name: 'Brainstorming', icon: LightBulbIcon },
    { id: 'process', name: 'Process', icon: CogIcon },
    { id: 'project', name: 'Project Management', icon: ChartBarIcon },
    { id: 'business', name: 'Business', icon: BuildingOfficeIcon },
    { id: 'education', name: 'Education', icon: AcademicCapIcon }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const handleApplyTemplate = (template) => {
    onApplyTemplate(template);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
            <p className="text-gray-600 mt-1">Start with a pre-built layout or create from scratch</p>
          </div>
          <Button
            variant="ghost"
            size="iconLg"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </Button>
        </div>

        {/* Categories */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleApplyTemplate(template)}
              >
                {/* Thumbnail */}
                <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {template.category}
                    </span>
                    <Button
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardTemplates; 