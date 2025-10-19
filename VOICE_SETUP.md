# 🎤 Real-Time Voice Assistant Setup

## Quick Setup (2 minutes)

### 1. Get Free Groq API Key
1. Go to: https://console.groq.com/
2. Sign up for free account
3. Get your API key
4. Copy the key

### 2. Add API Key to Environment
1. Open `.env.local` file in your project
2. Find the line: `GROQ_API_KEY=your_groq_api_key_here`
3. Replace `your_groq_api_key_here` with your actual API key
4. Save the file

### 3. Restart the Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 4. Test the Voice Assistant
1. Go to: http://localhost:3000/voice
2. Click "Start Real-Time Chat"
3. Allow microphone access
4. Start talking about dental health!

## What You'll Get

✅ **Real-time voice conversation** - talk naturally like a phone call  
✅ **Ultra-fast AI responses** - powered by Groq's lightning-fast models  
✅ **Dental-focused AI** - specialized dental assistant with concise responses  
✅ **Live transcript** - see what you're saying as you speak  
✅ **Multiple free models** - choose from different AI models  
✅ **No API costs** - free tier covers normal usage  
✅ **Smart fallbacks** - automatic mode switching on network issues

## 🎤 Voice Modes

### **Automatic Mode (Default)**
- Continuous speech recognition
- Real-time transcript
- Auto-restarts every 30 seconds to prevent timeouts
- Switches to manual mode on network errors

### **Manual Mode (Fallback)**
- Push and hold to talk
- Works without network issues
- More reliable for poor connections
- No Google Speech API dependency

## Troubleshooting

### If you get "network" errors:
- ✅ **Auto-fix**: System automatically switches to manual mode
- ✅ **Manual mode**: Push and hold to talk (works offline)
- ✅ **Text input**: Always works perfectly

### For best results:
- **Use HTTPS**: `npx localtunnel --port 3000` (not localhost)
- **Chrome/Edge/Safari**: Best speech recognition support
- **Stable internet**: For automatic mode
- **Allow microphone**: When prompted

### If you get the same response every time:
- Make sure `GROQ_API_KEY` is set in `.env.local`
- Restart the server after adding the API key
- Check the browser console for any errors

## Free Tier Limits

- **Groq**: 14,400 requests per day (plenty for testing)
- **No credit card required**
- **No time limits**

## Need Help?

1. Check the browser console for error messages
2. Make sure the API key is correctly set
3. Try the text input - it works without network issues
4. Restart the server after making changes

---

**That's it!** You now have a real-time voice assistant that works like Vapi but uses free APIs! 🎉
