const axios = require('axios');

// Netlify Function for news search
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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { query, limit = 5 } = event.queryStringParameters || {};
    
    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query parameter is required' })
      };
    }

    const newsApiKey = process.env.NEWS_API_KEY;
    
    if (!newsApiKey || newsApiKey === 'demo_key' || newsApiKey === 'your_newsapi_key_here') {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No API key configured',
          message: 'Real NewsAPI key required for news search.',
          articles: [],
          totalResults: 0
        })
      };
    }

    // Perform real web search using NewsAPI with Brazilian sources
    const musicArticles = [];
    
    // Multiple NewsAPI calls for Brazilian sources
    const brazilianDomains = [
      'uol.com.br,folha.uol.com.br',
      'g1.globo.com,extra.globo.com,oglobo.globo.com',
      'estadao.com.br'
    ];

    for (const domains of brazilianDomains) {
      try {
        const response = await axios.get('https://newsapi.org/v2/everything', {
          params: {
            q: `"${query}" música OR music OR pop OR cantor OR cantora`,
            domains: domains,
            language: 'pt',
            sortBy: 'publishedAt',
            pageSize: 10,
            apiKey: newsApiKey
          },
          timeout: 10000
        });

        if (response.data.articles) {
          // Group by source and limit UOL to 1 article
          const sourceGroups = {};
          response.data.articles.forEach(article => {
            const sourceName = article.source.name;
            if (!sourceGroups[sourceName]) {
              sourceGroups[sourceName] = [];
            }
            sourceGroups[sourceName].push(article);
          });

          Object.keys(sourceGroups).forEach(sourceName => {
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
        }
      } catch (error) {
        console.log(`Error fetching from ${domains}:`, error.message);
      }
    }

    // General Portuguese search excluding UOL
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: `"${query}" música OR music OR pop OR cantor OR cantora -site:uol.com.br`,
          language: 'pt',
          sortBy: 'publishedAt',
          pageSize: 10,
          apiKey: newsApiKey
        },
        timeout: 10000
      });

      if (response.data.articles) {
        response.data.articles.forEach(article => {
          if (!article.source.name.includes('Uol.com.br')) {
            musicArticles.push({
              title: article.title || article.description || 'Untitled Article',
              description: article.description || article.content?.substring(0, 200) + '...' || 'No description available',
              url: article.url,
              urlToImage: article.urlToImage || null,
              source: article.source.name,
              publishedAt: article.publishedAt
            });
          }
        });
      }
    } catch (error) {
      console.log('Error in general Portuguese search:', error.message);
    }

    // Return results
    const finalArticles = musicArticles.slice(0, parseInt(limit));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        articles: finalArticles,
        totalResults: finalArticles.length,
        source: 'real_web_search',
        note: 'Live news results from web search'
      })
    };

  } catch (error) {
    console.error('News search error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch news',
        details: error.message
      })
    };
  }
};
