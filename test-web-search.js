const axios = require('axios');

// Simple test to verify web search functionality
async function testWebSearch() {
  console.log('🔍 Testing web search functionality...\n');
  
  try {
    // Test the news search endpoint
    const response = await axios.get('http://localhost:3001/api/news/search', {
      params: {
        query: 'Taylor Swift',
        limit: 3
      },
      timeout: 15000
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Response Data:');
    console.log('- Success:', response.data.success);
    console.log('- Total Results:', response.data.totalResults);
    console.log('- Source:', response.data.source);
    console.log('- Note:', response.data.note);
    
    if (response.data.articles && response.data.articles.length > 0) {
      console.log('\n📰 Articles Found:');
      response.data.articles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`   Source: ${typeof article.source === 'string' ? article.source : article.source.name}`);
        console.log(`   URL: ${article.url}`);
        console.log(`   Description: ${article.description.substring(0, 100)}...`);
      });
      
      // Check if we got real web search results
      if (response.data.source === 'real_web_search') {
        console.log('\n🎉 SUCCESS: Real web search is working!');
      } else {
        console.log('\n⚠️  FALLBACK: Using mock data (web search failed)');
      }
    } else {
      console.log('\n❌ No articles found');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

// Run the test
testWebSearch();
