# 🏔️ Kumaoni Chatbot

An AI-powered conversational chatbot that speaks in authentic **Kumaoni language** (the regional language of Uttarakhand, India). Built with RAG (Retrieval Augmented Generation) architecture, it preserves and promotes the beautiful Kumaoni language through natural conversations.

![Kumaoni Chatbot](https://img.shields.io/badge/Language-Kumaoni-orange)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![React](https://img.shields.io/badge/React-18+-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- 🗣️ **Authentic Kumaoni Responses** - AI generates responses in Roman Kumaoni script
- 🎤 **Real-time Voice Chat** - Speak naturally and hear responses in voice
- 📚 **RAG-based Architecture** - Uses retrieved examples for authentic phrasing
- 💬 **Persistent Chat History** - Continue conversations across sessions
- 🔐 **User Authentication** - Secure sign up/sign in system
- 🎨 **Modern UI** - Beautiful amber-themed glassmorphism design

---

## 🏗️ Project Structure

```
kumaoni_chatbot/
│
├── backend/                    # FastAPI Backend Server
│   ├── api.py                  # Main API endpoints
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment variables (API keys)
│   │
│   ├── src/                    # Core chatbot logic
│   │   ├── chatbot.py          # Main chatbot orchestrator
│   │   ├── generator.py        # LLM response generation
│   │   ├── retriever.py        # RAG retrieval system
│   │   ├── normalizer.py       # Input normalization
│   │   ├── context_manager.py  # Conversation memory
│   │   ├── config.py           # Configuration settings
│   │   └── gemini_client.py    # Google Gemini API client
│   │
│   ├── database/               # SQLite database
│   │   ├── db.py               # Database operations
│   │   └── chatbot.db          # User & session data
│   │
│   ├── embeddings/             # Vector embeddings (gitignored)
│   │   └── embeddings.pkl      
│   │
│   └── data/                   # Dataset files (gitignored)
│       └── kumaoni_dataset.jsonl
│
├── frontend/                   # React + Vite Frontend
│   ├── index.html              # Entry HTML
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS config
│   │
│   └── src/
│       ├── App.jsx             # Main app with routing
│       ├── main.jsx            # React entry point
│       │
│       ├── pages/              # Page components
│       │   ├── LandingPage.jsx
│       │   ├── SignIn.jsx
│       │   ├── SignUp.jsx
│       │   ├── ChatPage.jsx
│       │   └── VoiceChatPage.jsx
│       │
│       ├── components/         # Reusable components
│       │   ├── Sidebar.jsx
│       │   ├── ChatWindow.jsx
│       │   ├── InputBox.jsx
│       │   ├── MessageBubble.jsx
│       │   └── TypingIndicator.jsx
│       │
│       ├── context/            # React context
│       │   └── AuthContext.jsx
│       │
│       └── services/           # API services
│           └── api.js
│
├── voice/                      # Voice Client (Optional)
│   ├── main.py                 # Voice app entry point
│   ├── config.py               # Voice settings
│   ├── audio_input.py          # Microphone + VAD
│   ├── stt.py                  # Speech-to-Text (Whisper)
│   ├── tts.py                  # Text-to-Speech (Edge TTS)
│   ├── voice_loop.py           # Voice conversation loop
│   ├── api_client.py           # Backend API client
│   └── requirements.txt        # Python dependencies
│
├── kumaoni_dataset_final.jsonl # Training dataset (gitignored)
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

---

## 🔄 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
├──────────────────────────┬──────────────────────────────────────┤
│     Web Frontend         │         Voice Client                 │
│     (React + Vite)       │    (Python + Whisper + TTS)          │
│                          │                                      │
│  ┌──────────────────┐    │    ┌─────────────────────────┐       │
│  │   ChatPage.jsx   │    │    │   Microphone Input      │       │
│  │   VoiceChatPage  │    │    │   ↓                     │       │
│  └────────┬─────────┘    │    │   Silero VAD            │       │
│           │              │    │   ↓                     │       │
│           ▼              │    │   Faster-Whisper STT    │       │
│  ┌──────────────────┐    │    └───────────┬─────────────┘       │
│  │   API Service    │    │                │                     │
│  └────────┬─────────┘    │                ▼                     │
└───────────┼──────────────┴────────────────┼─────────────────────┘
            │                               │
            └───────────────┬───────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                     BACKEND API (FastAPI)                      │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    /api/chat                            │   │
│  │                         │                               │   │
│  │    ┌────────────────────┼────────────────────┐          │   │
│  │    ▼                    ▼                    ▼          │   │
│  │ ┌──────────┐    ┌──────────────┐    ┌──────────────┐    │   │
│  │ │Normalizer│    │  Retriever   │    │Context Manager│   │   │
│  │ │(→English)│    │ (RAG Search) │    │   (Memory)   │    │   │
│  │ └────┬─────┘    └──────┬───────┘    └──────┬───────┘    │   │
│  │      │                 │                   │            │   │
│  │      └─────────────────┼───────────────────┘            │   │
│  │                        ▼                                │   │
│  │              ┌─────────────────┐                        │   │
│  │              │    Generator    │                        │   │
│  │              │ (Gemini LLM)    │                        │   │
│  │              │ → Kumaoni Reply │                        │   │
│  │              └─────────────────┘                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   SQLite DB  │    │  Embeddings  │    │   Dataset    │      │
│  │ (Users/Chats)│    │   (.pkl)     │    │   (.jsonl)   │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Google Gemini API Key** (free at [Google AI Studio](https://makersuite.google.com/))

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/kumaoni_chatbot.git
cd kumaoni_chatbot
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API key
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start the backend server
python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

### 3️⃣ Frontend Setup

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4️⃣ Access the App

Open your browser and go to: **http://localhost:5173**

---

## 🎤 Voice Mode (Optional)

The web app includes a built-in Voice Mode accessible from the chat page. For a standalone voice client:

```bash
# Navigate to voice directory
cd voice

# Install dependencies
pip install -r requirements.txt

# Ensure backend is running, then start voice client
python main.py
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

### Voice Client Settings

Edit `voice/config.py` to customize:
- `WHISPER_MODEL_SIZE` - STT model (tiny/base/small/medium)
- `VAD_THRESHOLD` - Voice detection sensitivity
- `EDGE_TTS_VOICE` - TTS voice selection

---

## 📱 Features Walkthrough

### Landing Page
Beautiful amber-themed landing with glass effects.

### Authentication
Secure sign up/sign in with persistent sessions.

### Chat Interface
- Send messages in Hindi/English
- Receive authentic Kumaoni responses
- View translation logic (expand "Show logic")
- Listen to responses (speaker icon)
- Access voice mode (waveform icon)

### Voice Mode
- Continuous voice conversation
- Auto-listen after bot speaks
- Tap to interrupt
- Visual status indicators

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, TailwindCSS |
| **Backend** | FastAPI, Python 3.10+ |
| **Database** | SQLite |
| **LLM** | Google Gemini 1.5 Flash |
| **Embeddings** | Sentence Transformers |
| **Voice STT** | Web Speech API / Faster-Whisper |
| **Voice TTS** | Web Speech API / Edge-TTS |
| **Voice VAD** | Silero-VAD |

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message, get Kumaoni response |
| POST | `/api/auth/signup` | Create new user |
| POST | `/api/auth/signin` | User login |
| GET | `/api/sessions` | List chat sessions |
| GET | `/api/sessions/{id}/history` | Get session messages |
| DELETE | `/api/sessions/{id}` | Delete a session |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Kumaoni Language Community** - For preserving this beautiful language
- **Google Gemini** - For powerful LLM capabilities
- **Open Source Community** - For amazing tools and libraries

---

<p align="center">
  Built with ❤️ for Kumaoni language preservation
</p>
