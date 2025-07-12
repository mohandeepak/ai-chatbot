# 🧠 MoCha AI

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

## 🌐 Frontend

This backend is designed to be connected to a **React + TypeScript frontend** that will:

- Allow users to type messages
- Display chat bubbles (user + assistant)
- Handle loading states and errors
- Possibly store chat history locally or remotely

The frontend will make POST requests to this backend's `/api/chat` endpoint.

## AI Integration Concepts: Function Calling & Real-Time Data(getStockPrice)

- **Function Calling in LLMs**  
  GPT models can call external functions dynamically based on user input, enabling real-time data fetching and task execution.

- **Structured Function Schemas**  
  Defining clear function names, parameters, and descriptions guides the AI to invoke the right function with valid inputs.

- **Contextual Message Passing**  
  Conversation history includes user messages, assistant replies, and function responses, allowing multi-turn reasoning and coherent interactions.

- **Hybrid AI-System Architecture**  
  AI handles language understanding and response generation; backend functions handle domain-specific logic and data retrieval.

- **Error Handling & Fallback**  
  Real-world AI apps must handle incomplete or invalid AI requests, backend errors, and rate limits gracefully.

- **Latency Management**  
  External function calls introduce latency; optimize with caching and efficient API usage to maintain smooth UX.

- **Security Best Practices**  
  Store sensitive API keys and credentials in environment variables; keep AI and backend components separate to protect secrets.


