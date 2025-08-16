# Goodminton 🏸 - AI-Powered Badminton Tracking System

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4+-black.svg)](https://nextjs.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.8+-green.svg)](https://opencv.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Revolutionizing badminton with real-time AI-powered shuttlecock tracking and physics simulation**

## 🚀 Overview

Goodminton is an innovative computer vision system that combines AI inference, motion detection, and physics calculations to track badminton shuttlecocks in real-time. The system provides 3D coordinate tracking, velocity estimation, and a beautiful web interface for monitoring game data.

## Features

- **Real-time Shuttlecock Detection**: AI-powered object detection using custom trained models
- **3D Coordinate Tracking**: X, Y, Z position tracking with timestamp data
- **Motion Analysis**: Advanced motion detection with configurable thresholds
- **Physics Simulation**: Velocity estimation and position prediction
- **Live Web Interface**: Real-time WebSocket communication with React frontend
- **Responsive Design**: Modern UI built with Next.js and Tailwind CSS
- **Multi-source Support**: Camera and video file input support

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Camera/Video  │───▶│  Motion Detection│───▶│  AI Inference   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Web Interface  │◀───│  WebSocket API   │◀───│ Physics Engine  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Tech Stack

### Backend
- **Python 3.8+** - Core application logic
- **OpenCV** - Computer vision and video processing
- **Inference SDK** - AI model inference
- **WebSockets** - Real-time communication
- **NumPy** - Numerical computations

### Frontend
- **Next.js 15** - React framework
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **WebSocket API** - Real-time data streaming

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 18 or higher
- Webcam or video file for testing

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ignitionhacks-v6.git
   cd ignitionhacks-v6
   ```

2. **Install Python dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Configure AI model**
   - Ensure you have access to the badminton detection model
   - Update the model path in `main.py` if needed

### Frontend Setup

1. **Install Node.js dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

## Usage

### Starting the System

1. **Launch the backend**
   ```bash
   cd backend
   python main.py
   ```
   The backend will start on port 6767 and begin processing video input.

2. **Launch the frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`.

3. **Connect your camera** or provide a video file path in the backend code.

### Configuration

- **Motion Threshold**: Adjust sensitivity in `motion.py` (default: 60)
- **AI Confidence**: Modify detection confidence in `main.py` (default: 0.2)
- **WebSocket Port**: Change port in `main.py` if needed (default: 6767)

## API Reference

### WebSocket Endpoint
- **URL**: `ws://localhost:6767`
- **Protocol**: WebSocket
- **Data Format**: JSON

### Data Structure
```json
{
  "x": 123.45,
  "y": 67.89,
  "z": 10.11,
  "timestamp": 1640995200.123
}
```

## Customization

### Adding New AI Models
1. Update the model path in `main.py`
2. Ensure compatibility with the inference SDK
3. Adjust confidence thresholds as needed

### Modifying Physics Parameters
- Edit gravitational constants in `physics.py`
- Adjust timeout values for position prediction
- Modify velocity calculation algorithms

### UI Customization
- Modify components in `frontend/src/components/`
- Update styling in `frontend/src/app/globals.css`
- Add new features to the main page

## Testing

### Test Videos
The project includes several test videos:
- `test badminton 1.mp4` - Basic badminton gameplay
- `testdepth2.mp4` - Depth-aware testing
- `Output_25 - fixed.mp4` - Processed output example

### Running Tests
```bash
# Test motion detection
cd backend
python motion.py

# Test physics calculations
python physics.py
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **IgnitionHacks v6** - Hackathon project
- **OpenCV** - Computer vision library
- **Next.js** - React framework
- **Tailwind CSS** - CSS framework

## Next Steps

- [ ] **Multi-camera support** for comprehensive court coverage
- [ ] **Player tracking** and movement analysis
- [ ] **Shot classification** (smash, drop, clear, etc.)
- [ ] **Performance analytics** and statistics
- [ ] **Mobile app** for real-time coaching
- [ ] **Cloud deployment** for remote access

---

<div align="center">
  <p>Made with ❤️ for the badminton community</p>
  <p>🏸 <strong>Goodminton</strong> - Where AI meets athletics</p>
</div>