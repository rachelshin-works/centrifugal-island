# ISS Live Background

A real-time dynamic web background that extracts colors from the International Space Station (ISS) live stream and creates an immersive visual experience.

🌍 **Live Demo**: [https://centrifugal-island.nyc](https://centrifugal-island.nyc)

## Features

- **Real-time Color Extraction**: Captures and analyzes colors from the ISS live stream
- **Dynamic Background**: Smooth color transitions based on actual ISS footage
- **Adaptive Text**: Text color automatically adjusts based on background brightness
- **Live Stream Integration**: Automatically opens the ISS live stream in a new tab
- **WebSocket Real-time Updates**: Instant color updates every 5 seconds
- **Responsive Design**: Works on all devices and screen sizes

## How It Works

1. **Stream Capture**: Uses FFmpeg and yt-dlp to capture frames from ISS live streams
2. **Color Analysis**: Analyzes the captured frames to extract dominant colors
3. **Real-time Updates**: Sends color data via WebSocket to connected clients
4. **Dynamic Background**: Smoothly transitions the background color based on ISS footage
5. **Smart Text**: Automatically switches text color (white/black) based on background brightness

## Technology Stack

- **Backend**: Node.js, Express, WebSocket
- **Frontend**: HTML5, CSS3, JavaScript, p5.js
- **Stream Processing**: FFmpeg, yt-dlp
- **Image Analysis**: Canvas API
- **Deployment**: GitHub Pages

## Installation

### Prerequisites

- Node.js (v14 or higher)
- FFmpeg
- yt-dlp

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rachelshin-works/centrifugal-island.git
   cd centrifugal-island
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install system dependencies**
   ```bash
   # macOS (using Homebrew)
   brew install ffmpeg yt-dlp
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install ffmpeg
   pip install yt-dlp
   ```

4. **Run the server**
   ```bash
   # For simulation mode (basic)
   npm start
   
   # For advanced mode (real ISS stream capture)
   node advanced-server.js
   ```

5. **Open in browser**
   - Navigate to `http://localhost:3000`
   - The ISS live stream will automatically open in a new tab

## Usage

### Basic Mode (Simulation)
- Runs `server.js` for color simulation based on time of day
- No external dependencies required
- Perfect for testing and development

### Advanced Mode (Real Stream)
- Runs `advanced-server.js` for actual ISS stream capture
- Requires FFmpeg and yt-dlp
- Extracts real colors from ISS live feeds

## API Endpoints

- `GET /` - Main web interface
- `GET /status` - Server status and client count
- `GET /average-color` - Current average color (JSON)
- `WebSocket ws://localhost:8080` - Real-time color updates

## ISS Stream Sources

The application tries multiple ISS live stream sources:
- [ISS Live: Earth from Space](https://www.youtube.com/watch?v=fO9e9jnhYK8)
- [ISS Live: NASA Earth Views](https://www.youtube.com/watch?v=86YLFOog4GM)
- [ISS Live: Space Station](https://www.youtube.com/watch?v=4jKokxPRtck)

## Customization

### Color Transition Speed
Modify the lerp factor in `public/index.html`:
```javascript
currentColor.r = lerp(currentColor.r, targetColor.r, 0.05); // 0.05 = slow, 0.2 = fast
```

### Update Interval
Change the update frequency in `advanced-server.js`:
```javascript
setInterval(async () => {
    // ... color analysis
}, 5000); // 5 seconds
```

### Text Color Threshold
Adjust brightness threshold in `public/index.html`:
```javascript
function getTextColor(r, g, b) {
    const brightness = getBrightness(r, g, b);
    return brightness > 128 ? '#000000' : '#ffffff'; // 128 = medium brightness
}
```

## Deployment

### GitHub Pages

1. **Enable GitHub Pages**
   - Go to repository Settings > Pages
   - Select source: "Deploy from a branch"
   - Choose branch: "main" and folder: "/ (root)"

2. **Custom Domain Setup**
   - Add custom domain: `centrifugal-island.nyc`
   - Create CNAME file in repository root
   - Configure DNS settings with your domain provider

3. **DNS Configuration**
   ```
   Type: CNAME
   Name: @
   Value: rachelshin-works.github.io
   ```

### Local Development

For local development without stream capture:
```bash
npm start
```

For full ISS stream integration:
```bash
node advanced-server.js
```

## Troubleshooting

### Common Issues

1. **"yt-dlp 실패" (yt-dlp failure)**
   - Ensure yt-dlp is installed: `pip install yt-dlp`
   - Update yt-dlp: `pip install --upgrade yt-dlp`

2. **"FFmpeg 캡처 실패" (FFmpeg capture failure)**
   - Verify FFmpeg installation: `ffmpeg -version`
   - Check network connectivity

3. **Black frames detected**
   - ISS stream might be offline or restricted
   - System automatically falls back to simulation mode

4. **WebSocket connection issues**
   - Ensure port 8080 is available
   - Check firewall settings

### Performance Optimization

- Reduce update frequency for better performance
- Lower image resolution for faster processing
- Use simulation mode for development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- NASA for providing ISS live streams
- YouTube for hosting the live feeds
- p5.js community for the creative coding framework

---

**Experience the Earth from space in real-time colors** 🌍✨

Visit: [https://centrifugal-island.nyc](https://centrifugal-island.nyc) 