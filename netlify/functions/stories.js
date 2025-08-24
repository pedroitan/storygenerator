const { createCanvas, loadImage } = require('canvas');

// Netlify Function for story generation
exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { article } = JSON.parse(event.body);
    
    if (!article) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Article data is required' })
      };
    }

    // Create canvas for Instagram Story (1080x1920)
    const canvas = createCanvas(1080, 1920);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Load and draw article image if available
    if (article.urlToImage) {
      try {
        const image = await loadImage(article.urlToImage);
        const imgWidth = 1080;
        const imgHeight = 600;
        ctx.drawImage(image, 0, 200, imgWidth, imgHeight);
        
        // Add overlay for text readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 200, 1080, 600);
      } catch (error) {
        console.log('Error loading image:', error.message);
      }
    }

    // Title text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    
    const title = article.title || 'Music News';
    const words = title.split(' ');
    let line = '';
    let y = 900;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > 950 && n > 0) {
        ctx.fillText(line, 540, y);
        line = words[n] + ' ';
        y += 60;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 540, y);

    // Source text
    ctx.font = '32px Arial';
    ctx.fillStyle = '#f0f0f0';
    const sourceName = typeof article.source === 'string' ? article.source : article.source.name;
    ctx.fillText(`📰 ${sourceName}`, 540, y + 100);

    // Date
    const date = new Date(article.publishedAt).toLocaleDateString('pt-BR');
    ctx.fillText(`📅 ${date}`, 540, y + 150);

    // Convert canvas to base64
    const imageBuffer = canvas.toBuffer('image/png');
    const base64Image = imageBuffer.toString('base64');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        image: `data:image/png;base64,${base64Image}`,
        message: 'Story generated successfully'
      })
    };

  } catch (error) {
    console.error('Story generation error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate story',
        details: error.message
      })
    };
  }
};
