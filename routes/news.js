const express = require('express');
const axios = require('axios');
const { spawn } = require('child_process');
const router = express.Router();

// Function to perform real web search using actual music news APIs
async function performRealWebSearch(query, limit = 5) {
  try {
    console.log(`Performing real web search for: ${query}`);
    
    let allArticles = [];
    const seenSources = new Set();
    
    // Try NewsAPI with music-specific search
    try {
      const newsApiKey = process.env.NEWS_API_KEY;
      if (newsApiKey && newsApiKey !== 'demo_key' && newsApiKey !== 'your_newsapi_key_here') {
        console.log('Trying NewsAPI with key:', newsApiKey.substring(0, 8) + '...');
        // Skip English sources - focusing only on Brazilian sources
        
        // Try multiple Brazilian source searches to get diversity
        let allBrazilianArticles = [];
        
        // Search 1: UOL sources (limit to 1)
        try {
          const uolResponse = await axios.get('https://newsapi.org/v2/everything', {
            params: {
              q: `"${query}" OR "${query} música" OR "${query} show"`,
              domains: 'uol.com.br,folha.uol.com.br',
              sortBy: 'publishedAt',
              pageSize: 5,
              apiKey: newsApiKey
            },
            timeout: 8000
          });
          if (uolResponse.data?.articles?.length) {
            allBrazilianArticles.push(uolResponse.data.articles[0]); // Only take first UOL article
            console.log(`UOL search returned ${uolResponse.data.articles.length} articles, taking 1`);
          }
        } catch (error) {
          console.log('UOL search failed:', error.message);
        }
        
        // Search 2: Globo sources
        try {
          const globoResponse = await axios.get('https://newsapi.org/v2/everything', {
            params: {
              q: `"${query}" OR "${query} música" OR "${query} show"`,
              domains: 'g1.globo.com,extra.globo.com,oglobo.globo.com',
              sortBy: 'publishedAt',
              pageSize: 5,
              apiKey: newsApiKey
            },
            timeout: 8000
          });
          if (globoResponse.data?.articles?.length) {
            allBrazilianArticles.push(...globoResponse.data.articles.slice(0, 3));
            console.log(`Globo search returned ${globoResponse.data.articles.length} articles, taking up to 3`);
          }
        } catch (error) {
          console.log('Globo search failed:', error.message);
        }
        
        // Search 3: Estadão
        try {
          const estadaoResponse = await axios.get('https://newsapi.org/v2/everything', {
            params: {
              q: `"${query}" OR "${query} música" OR "${query} show"`,
              domains: 'estadao.com.br',
              sortBy: 'publishedAt',
              pageSize: 3,
              apiKey: newsApiKey
            },
            timeout: 8000
          });
          if (estadaoResponse.data?.articles?.length) {
            allBrazilianArticles.push(...estadaoResponse.data.articles);
            console.log(`Estadão search returned ${estadaoResponse.data.articles.length} articles`);
          }
        } catch (error) {
          console.log('Estadão search failed:', error.message);
        }
        
        // Search 4: General Portuguese search as fallback
        if (allBrazilianArticles.length < 3) {
          try {
            const generalResponse = await axios.get('https://newsapi.org/v2/everything', {
              params: {
                q: `"${query}" AND (música OR show OR cantora OR cantor)`,
                language: 'pt',
                sortBy: 'publishedAt',
                pageSize: 10,
                apiKey: newsApiKey
              },
              timeout: 8000
            });
            if (generalResponse.data?.articles?.length) {
              // Filter out UOL if we already have it
              const nonUolArticles = generalResponse.data.articles.filter(
                article => !article.source.name.includes('Uol.com.br')
              );
              allBrazilianArticles.push(...nonUolArticles.slice(0, 5));
              console.log(`General Portuguese search returned ${generalResponse.data.articles.length} articles, added ${nonUolArticles.slice(0, 5).length} non-UOL`);
            }
          } catch (error) {
            console.log('General Portuguese search failed:', error.message);
          }
        }
        
        const portugueseResponse = { data: { articles: allBrazilianArticles } };
        
        // Use only Portuguese/Brazilian results
        const response = { data: { articles: portugueseResponse?.data?.articles || [] } };
        
        if (response.data && response.data.articles && response.data.articles.length > 0) {
          // Group articles by source and limit UOL to 1 article for diversity
          const sourceGroups = {};
          response.data.articles.forEach(article => {
            const sourceName = article.source.name;
            if (!sourceGroups[sourceName]) {
              sourceGroups[sourceName] = [];
            }
            sourceGroups[sourceName].push(article);
          });
          
          const musicArticles = [];
          Object.keys(sourceGroups).forEach(sourceName => {
            // Limit UOL.com.br to 1 article, others can have more
            const maxArticles = sourceName === 'Uol.com.br' ? 1 : 3;
            const articlesToAdd = sourceGroups[sourceName].slice(0, maxArticles);
            
            articlesToAdd.forEach(article => {
              musicArticles.push({
                title: article.title || article.description || 'Untitled Article',
                description: article.description || article.content?.substring(0, 200) + '...' || 'No description available',
                url: article.url,
                urlToImage: article.urlToImage || null,
                source: article.source.name,
                publishedAt: article.publishedAt
              });
            });
          });
          
          console.log(`Found ${musicArticles.length} music news articles from NewsAPI (UOL limited to 1)`);
          console.log('NewsAPI sources found:', musicArticles.map(a => a.source).join(', '));
          
          // Clear array and add NewsAPI articles FIRST to prioritize them
          allArticles.length = 0;
          allArticles.push(...musicArticles);
          console.log(`Added ${musicArticles.length} NewsAPI articles to results`);
        }
      }
    } catch (newsApiError) {
      console.log('NewsAPI failed:', newsApiError.message);
    }
    
    // Skip Guardian API - focusing only on Brazilian sources
    
    // Skip Reddit - focusing only on Brazilian sources
    
    // Return all articles without deduplication, limited to requested amount
    console.log(`Total articles before slicing: ${allArticles.length}`);
    console.log('All article sources before slicing:', allArticles.map(a => a.source).join(', '));
    const finalArticles = allArticles.slice(0, limit);
    console.log(`Returning ${finalArticles.length} articles (no deduplication applied)`);
    console.log('Final sources:', finalArticles.map(a => a.source).join(', '));
    console.log('Final article titles:', finalArticles.map(a => a.title.substring(0, 50)).join(' | '));
    return finalArticles;
    
  } catch (error) {
    console.log('All real web search attempts failed:', error.message);
  }
  
  console.log('No real web sources available, returning empty array');
  return [];
}

// Search for pop music news using web search
router.get('/search', async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Try to get real web search results first
    console.log(`Searching for real news about: ${query}`);
    
    try {
      const realResults = await performRealWebSearch(query, parseInt(limit));
      
      if (realResults && realResults.length > 0) {
        const articles = realResults.map(result => ({
          title: result.title,
          description: result.description,
          url: result.url,
          urlToImage: result.urlToImage || null,
          publishedAt: result.publishedAt,
          source: { name: result.source },
          content: result.description
        }));

        return res.json({
          success: true,
          articles: articles,
          totalResults: articles.length,
          source: 'real_web_search',
          note: 'Live news results from web search'
        });
      }
    } catch (searchError) {
      console.log('Real web search failed:', searchError.message);
    }
    
    // NO FALLBACK - Return error if real web search fails
    console.log('Real web search failed - no fallback available');
    return res.status(503).json({
      success: false,
      error: 'Real web search failed',
      message: 'Unable to fetch live news data. Real web search APIs are currently unavailable.',
      articles: [],
      totalResults: 0,
      source: 'no_fallback'
    });

  } catch (error) {
    console.error('News search error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      details: error.message
    });
  }
});

  // Get trending pop music topics
router.get('/trending', async (req, res) => {
  try {
    const newsApiKey = process.env.NEWS_API_KEY;
    
    // NO MOCK DATA - Only real API results
    if (!newsApiKey || newsApiKey === 'demo_key') {
      return res.status(503).json({
        success: false,
        error: 'No API key configured',
        message: 'Real NewsAPI key required for trending news. No mock data available.',
        articles: [],
        totalResults: 0
      });
    }

    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: 'entertainment',
        language: 'en',
        pageSize: 10,
        apiKey: newsApiKey
      }
    });

    // Filter for music-related headlines
    const musicArticles = response.data.articles.filter(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      return text.includes('music') || text.includes('singer') || 
             text.includes('album') || text.includes('concert') || 
             text.includes('pop') || text.includes('artist');
    });

    res.json({
      success: true,
      articles: musicArticles.slice(0, 5),
      totalResults: musicArticles.length
    });

  } catch (error) {
    console.error('Trending news error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch trending news',
      details: error.response?.data?.message || error.message
    });
  }
});

module.exports = router;
