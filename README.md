# 🧠 AI Chatbot

This is the **Node.js + Express backend** for an AI chatbot application powered by the OpenAI API. It exposes a `/api/chat` endpoint that receives a conversation (array of messages) and responds with a GPT-generated reply.

---

## 📦 Tech Stack

- Node.js
- Express.js
- OpenAI SDK
- dotenv for environment management
- CORS for cross-origin requests

---

## 🚀 Getting Started

### 1. Clone the Repo

```
git clone https://github.com/your-username/ai-chatbot-backend.git
cd ai-chatbot-backend
```

### 2. Install Dependencies

```
npm install
```

### 3. Create a `.env` File

Create a file named `.env` in the root directory:

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
```

> ❗ **Important:** `.env` is ignored by Git using `.gitignore`, so make sure you create it locally with your API key.

### 4. Start the Server

```
node index.js
```

Your server will start on [http://localhost:5000](http://localhost:5000)

---

## 📡 API Endpoint

### `POST /api/chat`

**Request Body:**
```
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ]
}
```

**Response:**
```
{
  "response": {
    "role": "assistant",
    "content": "Hi there! How can I help you today?"
  }
}
```

---

## 🌐 Frontend (Coming Soon)

This backend is designed to be connected to a **React + TypeScript frontend** that will:

- Allow users to type messages
- Display chat bubbles (user + assistant)
- Handle loading states and errors
- Possibly store chat history locally or remotely

The frontend will make POST requests to this backend's `/api/chat` endpoint.

