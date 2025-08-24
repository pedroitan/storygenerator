# PopStories - Pop Music News to Instagram Stories

🎵 **Automatically transform Pop Music news into beautiful Instagram Stories**

PopStories is a web application that searches for trending Pop Music news and automatically generates visually appealing Instagram Stories that you can post to your account.

## ✨ Features

- **🔍 Smart News Search**: Find the latest Pop Music news using NewsAPI
- **🎨 Automatic Story Generation**: Create beautiful 1080x1920 Instagram Stories with Canvas
- **📱 Instagram Integration**: Post directly to your Instagram Stories
- **📺 Feed Display**: View your Instagram feed within the app
- **🎯 Popular Artists**: Quick search for trending artists like Taylor Swift, Billie Eilish, etc.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Instagram Developer Account
- NewsAPI Key
- Unsplash API Key (optional, for background images)

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd BEAR
npm install
cd client && npm install --legacy-peer-deps
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
NEWS_API_KEY=your_news_api_key_here
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3001/auth/instagram/callback
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
SESSION_SECRET=your_session_secret_here
```

3. **Start the application**:
```bash
# Start backend server
npm run dev

# In another terminal, start React frontend
npm run client
```

4. **Open your browser**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🔧 API Setup Guide

### NewsAPI Setup
1. Visit [NewsAPI.org](https://newsapi.org/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env` file

### Instagram API Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app and add Instagram Basic Display
3. Configure OAuth redirect URI: `http://localhost:3001/auth/instagram/callback`
4. Get your Client ID and Client Secret
5. Add them to your `.env` file

**Note**: For posting Stories, you need an Instagram Business account and additional Graph API permissions.

### Unsplash API (Optional)
1. Visit [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application
3. Get your Access Key
4. Add it to your `.env` file

## 🏗️ Architecture

```
PopStories/
├── server.js              # Express server
├── routes/
│   ├── news.js           # NewsAPI integration
│   ├── stories.js        # Canvas story generation
│   └── instagram.js      # Instagram OAuth & API
├── client/               # React frontend
│   └── src/
│       ├── components/   # React components
│       └── App.tsx       # Main application
└── PRD.md               # Product Requirements Document
```

## 🎨 Story Templates

The app includes several story templates:
- **Pop Gradient**: Purple gradient with clean typography
- **Neon Vibes**: Bright neon colors with retro aesthetic
- **Minimal Clean**: Clean white background with bold text

## 📱 Usage

1. **Login**: Click "Login with Instagram" to authenticate
2. **Search**: Enter an artist name or music topic
3. **Select**: Click on a news article from the results
4. **Generate**: The app automatically creates an Instagram Story
5. **Post**: Click "Post to Instagram Stories" to share
6. **Download**: Save the generated image locally

## 🔒 Privacy & Security

- OAuth tokens are stored securely in sessions
- No user data is permanently stored
- All API calls are made server-side to protect keys
- Images are generated on-demand and not cached

## 🚧 Development Status

- ✅ Backend API with news search
- ✅ Canvas-based story generation
- ✅ Instagram OAuth integration
- ✅ React frontend with modern UI
- ✅ Instagram feed display
- ⏳ Production deployment
- ⏳ Advanced story templates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Common Issues

**"News API key not configured"**
- Make sure your `.env` file has the correct `NEWS_API_KEY`

**"Instagram login fails"**
- Check your Instagram app configuration
- Verify the redirect URI matches exactly
- Ensure your app is in Development mode

**"Canvas errors"**
- Install canvas dependencies: `npm install canvas`
- On macOS, you may need: `brew install pkg-config cairo pango libpng jpeg giflib librsvg`

**"Story posting fails"**
- Instagram Story posting requires a Business account
- Additional Graph API permissions are needed
- Check the Instagram Graph API documentation

### Getting Help

- Check the [PRD.md](PRD.md) for detailed requirements
- Review the API documentation for each service
- Open an issue on GitHub for bugs or feature requests

---

**Built with ❤️ for the Pop Music community**
