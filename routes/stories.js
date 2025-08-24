const express = require('express');
const axios = require('axios');
const router = express.Router();

// Generate Instagram Story from news article (Mock implementation)
router.post('/generate', async (req, res) => {
  try {
    const { article, template = 'default' } = req.body;
    
    if (!article || !article.title) {
      return res.status(400).json({ error: 'Article data is required' });
    }

    // Mock story generation - in production, this would use Canvas API
    // For now, return a placeholder image with article data
    const mockStoryData = {
      title: article.title,
      description: article.description,
      source: article.source,
      publishedAt: article.publishedAt,
      template: template
    };

    // Create a simple SVG-based story as placeholder
    const svgContent = `
      <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad1)"/>
        <text x="540" y="200" font-family="Arial, sans-serif" font-size="60" fill="white" text-anchor="middle">🎵</text>
        <foreignObject x="80" y="400" width="920" height="600">
          <div xmlns="http://www.w3.org/1999/xhtml" style="color: white; font-family: Arial, sans-serif; text-align: center;">
            <h1 style="font-size: 48px; margin: 0; line-height: 1.2; font-weight: bold;">${article.title}</h1>
          </div>
        </foreignObject>
        <text x="540" y="1800" font-family="Arial, sans-serif" font-size="24" fill="#cccccc" text-anchor="middle">${article.source} • ${new Date(article.publishedAt).toLocaleDateString()}</text>
        <text x="980" y="200" font-family="Arial, sans-serif" font-size="60" fill="white" text-anchor="middle">🎵</text>
      </svg>
    `;

    // Convert SVG to base64
    const base64Image = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

    res.json({
      success: true,
      image: base64Image,
      metadata: {
        title: article.title,
        source: article.source,
        publishedAt: article.publishedAt,
        note: 'This is a mock implementation. Install Canvas dependencies for full functionality.'
      }
    });

  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate story',
      details: error.message
    });
  }
});

// Get available templates
router.get('/templates', (req, res) => {
  const templates = [
    {
      id: 'default',
      name: 'Pop Gradient',
      description: 'Purple gradient background with clean typography',
      preview: '/templates/default-preview.png'
    },
    {
      id: 'neon',
      name: 'Neon Vibes',
      description: 'Bright neon colors with retro aesthetic',
      preview: '/templates/neon-preview.png'
    },
    {
      id: 'minimal',
      name: 'Minimal Clean',
      description: 'Clean white background with bold text',
      preview: '/templates/minimal-preview.png'
    }
  ];

  res.json({
    success: true,
    templates
  });
});

module.exports = router;
