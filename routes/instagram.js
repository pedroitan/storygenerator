const express = require('express');
const passport = require('passport');
const InstagramStrategy = require('passport-instagram').Strategy;
const axios = require('axios');
const router = express.Router();

// Configure Instagram OAuth strategy (only if credentials are provided)
if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
  passport.use(new InstagramStrategy({
      clientID: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      callbackURL: process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:3001/auth/instagram/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      // Store user profile and tokens
      const user = {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        accessToken: accessToken,
        refreshToken: refreshToken
      };
      return done(null, user);
    }
  ));
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Instagram OAuth routes
router.get('/auth', passport.authenticate('instagram'));

router.get('/auth/callback', 
  passport.authenticate('instagram', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    res.redirect(process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:3000');
  }
);

// Get user profile
router.get('/profile', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.displayName
    }
  });
});

// Get user's Instagram media
router.get('/media', async (req, res) => {
  try {
    if (!req.user || !req.user.accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const response = await axios.get(`https://graph.instagram.com/me/media`, {
      params: {
        fields: 'id,caption,media_type,media_url,thumbnail_url,timestamp,permalink',
        access_token: req.user.accessToken
      }
    });

    res.json({
      success: true,
      media: response.data.data
    });

  } catch (error) {
    console.error('Instagram media fetch error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch Instagram media',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Post story to Instagram (requires Instagram Graph API)
router.post('/story', async (req, res) => {
  try {
    if (!req.user || !req.user.accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { imageUrl, caption } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Note: Instagram Graph API requires a business account and additional permissions
    // This is a placeholder for the actual implementation
    const response = await axios.post(`https://graph.instagram.com/me/media`, {
      image_url: imageUrl,
      caption: caption,
      media_type: 'STORIES',
      access_token: req.user.accessToken
    });

    res.json({
      success: true,
      mediaId: response.data.id,
      message: 'Story posted successfully'
    });

  } catch (error) {
    console.error('Instagram story post error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to post story',
      details: error.response?.data?.error?.message || error.message,
      note: 'Instagram Story posting requires a Business account and additional API permissions'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  res.json({
    authenticated: !!req.user,
    user: req.user ? {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.displayName
    } : null
  });
});

module.exports = router;
