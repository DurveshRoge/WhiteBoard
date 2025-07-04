import axios from 'axios';

// Export board data from server
export const exportBoardData = async (boardId, format = 'png') => {
  try {
    const response = await axios.get(`/boards/${boardId}/export?format=${format}`, {
      responseType: format === 'json' ? 'blob' : 'json'
    });
    
    return response.data;
  } catch (error) {
    console.error('Export error:', error);
    throw new Error(`Failed to export board: ${error.response?.data?.message || error.message}`);
  }
};

// Convert canvas to PNG blob
export const canvasToPNG = (canvas, filename = 'whiteboard.png') => {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png', 1.0);
    } catch (error) {
      reject(error);
    }
  });
};

// Convert canvas to PDF using jsPDF
export const canvasToPDF = async (canvas, filename = 'whiteboard.pdf', title = 'Whiteboard') => {
  try {
    // Dynamic import to avoid bundling jsPDF in main bundle
    const { jsPDF } = await import('jspdf');
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    
    // Calculate dimensions to fit the canvas in the PDF
    const imgWidth = 297; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add title
    pdf.setFontSize(16);
    pdf.text(title, 14, 20);
    
    // Add the image
    pdf.addImage(imgData, 'PNG', 10, 30, imgWidth - 20, imgHeight - 20);
    
    // Add metadata
    pdf.setFontSize(10);
    pdf.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, imgHeight + 35);
    
    // Save the PDF
    pdf.save(filename);
    
    return pdf;
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to create PDF. Please install jsPDF: npm install jspdf');
  }
};

// Download JSON data
export const downloadJSON = (data, filename = 'whiteboard.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Render board elements to canvas for export
export const renderBoardToCanvas = (boardData, canvas, options = {}) => {
  const ctx = canvas.getContext('2d');
  const { width = 1920, height = 1080, scale = 1 } = options;
  
  // Set canvas size
  canvas.width = width;
  canvas.height = height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Set background
  if (boardData.background) {
    ctx.fillStyle = boardData.background;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  
  // Apply scale
  ctx.scale(scale, scale);
  
  // Render elements
  if (boardData.elements && Array.isArray(boardData.elements)) {
    boardData.elements.forEach(element => {
      renderElement(ctx, element, scale);
    });
  }
};

// Render individual element
const renderElement = (ctx, element, scale) => {
  ctx.save();
  
  // Set common properties
  if (element.stroke) {
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = (element.strokeWidth || 2) * scale;
  }
  
  if (element.fill && element.fill !== 'transparent') {
    ctx.fillStyle = element.fill;
  }
  
  if (element.opacity !== undefined) {
    ctx.globalAlpha = element.opacity;
  }
  
  // Render based on element type
  switch (element.type) {
    case 'pen':
      renderPenElement(ctx, element, scale);
      break;
    case 'rectangle':
      renderRectangleElement(ctx, element, scale);
      break;
    case 'circle':
      renderCircleElement(ctx, element, scale);
      break;
    case 'text':
      renderTextElement(ctx, element, scale);
      break;
    case 'line':
      renderLineElement(ctx, element, scale);
      break;
    case 'arrow':
      renderArrowElement(ctx, element, scale);
      break;
    default:
      console.warn('Unknown element type:', element.type);
  }
  
  ctx.restore();
};

const renderPenElement = (ctx, element, scale) => {
  if (!element.points || element.points.length < 4) return;
  
  ctx.beginPath();
  ctx.moveTo(element.points[0], element.points[1]);
  
  for (let i = 2; i < element.points.length; i += 2) {
    ctx.lineTo(element.points[i], element.points[i + 1]);
  }
  
  ctx.stroke();
};

const renderRectangleElement = (ctx, element, scale) => {
  ctx.beginPath();
  ctx.rect(element.x, element.y, element.width, element.height);
  
  if (element.fill && element.fill !== 'transparent') {
    ctx.fill();
  }
  
  if (element.stroke) {
    ctx.stroke();
  }
};

const renderCircleElement = (ctx, element, scale) => {
  const radius = element.radius || Math.min(element.width, element.height) / 2;
  const centerX = element.x + (element.width || radius * 2) / 2;
  const centerY = element.y + (element.height || radius * 2) / 2;
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  
  if (element.fill && element.fill !== 'transparent') {
    ctx.fill();
  }
  
  if (element.stroke) {
    ctx.stroke();
  }
};

const renderTextElement = (ctx, element, scale) => {
  if (!element.text) return;
  
  ctx.font = `${(element.fontSize || 16) * scale}px ${element.fontFamily || 'Arial'}`;
  ctx.fillStyle = element.fill || element.stroke || '#000000';
  
  // Handle text wrapping
  const maxWidth = element.width || 200;
  const words = element.text.split(' ');
  const lines = [];
  let currentLine = words[0];
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  
  // Draw lines
  lines.forEach((line, index) => {
    ctx.fillText(line, element.x, element.y + (element.fontSize || 16) * scale * (index + 1));
  });
};

const renderLineElement = (ctx, element, scale) => {
  if (!element.points || element.points.length < 4) return;
  
  ctx.beginPath();
  ctx.moveTo(element.x + element.points[0], element.y + element.points[1]);
  ctx.lineTo(element.x + element.points[2], element.y + element.points[3]);
  ctx.stroke();
};

const renderArrowElement = (ctx, element, scale) => {
  if (!element.points || element.points.length < 4) return;
  
  const x1 = element.x + element.points[0];
  const y1 = element.y + element.points[1];
  const x2 = element.x + element.points[2];
  const y2 = element.y + element.points[3];
  
  // Draw line
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  
  // Draw arrowhead
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowLength = 10 * scale;
  const arrowAngle = Math.PI / 6;
  
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - arrowLength * Math.cos(angle - arrowAngle),
    y2 - arrowLength * Math.sin(angle - arrowAngle)
  );
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - arrowLength * Math.cos(angle + arrowAngle),
    y2 - arrowLength * Math.sin(angle + arrowAngle)
  );
  ctx.stroke();
}; 