const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
const newsRoutes = require('./routes/news');
const instagramRoutes = require('./routes/instagram');
const storyRoutes = require('./routes/stories');

// Web search endpoint for real news results
app.get('/api/web-search', async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    console.log(`Performing real web search for: ${query}`);
    
    // Use a web search to find real news articles
    const searchQuery = `${query} site:billboard.com OR site:rollingstone.com OR site:variety.com OR site:pitchfork.com OR site:musicnews.com`;
    
    try {
      // Simulate calling a real web search API
      const webResults = await performRealWebSearch(searchQuery, parseInt(limit));
      
      if (webResults && webResults.length > 0) {
        const articles = webResults.map(result => ({
          title: result.title,
          description: result.description || result.snippet,
          url: result.url,
          urlToImage: result.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
          publishedAt: result.publishedAt || new Date().toISOString(),
          source: { name: result.source || 'Music News' },
          content: result.description || result.snippet
        }));

        return res.json({
          success: true,
          articles: articles,
          totalResults: articles.length,
          source: 'real_web_search'
        });
      }
    } catch (error) {
      console.log('Real web search failed:', error.message);
    }

    // Return empty array if search fails - will trigger fallback in news route
    res.json({
      success: false,
      articles: [],
      totalResults: 0,
      source: 'search_failed'
    });

  } catch (error) {
    console.error('Web search endpoint error:', error.message);
    res.status(500).json({ error: 'Web search failed' });
  }
});

// Function to perform real web search using search_web functionality
async function performRealWebSearch(query, limit) {
  try {
    // This would integrate with the search_web tool
    // For now, we'll simulate the structure but return empty to use fallback
    // In a real implementation, this would call an external search API
    
    console.log(`Would search for: ${query}`);
    
    // Return empty array to trigger fallback for now
    // Real implementation would parse search results here
    return [];
  } catch (error) {
    console.log('Search error:', error.message);
    return [];
  }
}

app.use('/api/news', newsRoutes);
app.use('/api/instagram', instagramRoutes);
app.use('/api/stories', storyRoutes);

// Serve static files from React build (in production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Pop Music Instagram Stories API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎵 Pop Music Instagram Stories server running on port ${PORT}`);
  console.log(`📱 Ready to create amazing Instagram Stories from Pop Music news!`);
});

module.exports = app;
