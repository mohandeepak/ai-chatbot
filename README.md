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

# Prompt Engineering

**Prompt Engineering** is the practice of designing and refining input prompts to large language models (LLMs) like GPT to elicit accurate, relevant, and well-structured responses. Effective prompt engineering is crucial for integrating AI models into applications reliably and efficiently.

---

## Key Concepts

1. **Message Roles & Structure**  
   - **System message:** Sets global assistant behavior, tone, and rules.  
   - **User message:** Contains the user’s query or input.  
   - **Assistant message:** The model’s reply.

  <pre lang="markdown"><code>### Example: Message Roles in Chat API
   const messages = [ 
    { role: "system", content: "You are a helpful assistant." }, 
   {
     role: "user", content: "Explain prompt engineering." }, ];</code></pre>

const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages,
});

2. **Explicit Output Formatting**  
   - Instruct the model to respond in strict formats (e.g., JSON, XML) for easy parsing.  
   - Use schemas or templates and delimiters to ensure consistency.

3. **Temperature Control**  
   - Lower temperature (e.g., 0) for deterministic, factual responses.  
   - Higher temperature (0.7–1.0) for creative or exploratory answers.

4. **Chain-of-Thought Prompting (CoT)**  
   - Ask the model to reason step-by-step before answering.  
   - Improves accuracy on complex, multi-step problems.

5. **Few-shot Learning**  
   - Provide examples of desired input-output pairs in prompts to guide model behavior.

6. **Function Calling Integration**  
   - Define function schemas and let GPT autonomously decide when to call backend functions.  
   - Parse and execute these calls, then feed results back to GPT for final responses.

7. **Error Handling & Robustness**  
   - Validate and sanitize user inputs before injecting into prompts.  
   - Implement fallback logic for unexpected or malformed model outputs.

8. **Dynamic Prompt Assembly**  
   - Combine static instructions (system prompt) with dynamic context (user info, conversation history) efficiently.  
   - Manage token limits by summarizing or truncating context as needed.

---

## Best Practices

- Always use a **clear system prompt** to set assistant behavior and constraints.  
- Enforce **structured output** for seamless frontend/backend integration.  
- Use **Chain-of-Thought** prompts for improved reasoning tasks.  
- Employ **official function calling APIs** for robust multi-tool orchestration.  
- Balance prompt detail and length with **token usage** to optimize costs.  
- Continuously **test and refine prompts** based on application needs.

---


# Retreival Augmented Generation (RAG) [GPT +  external knowledge retreival system (private pfd, docucments)]

        ┌────────────────────────────────────────────┐
        │           🔍 User asks a question          │
        │     e.g. "What does our refund policy say?"│
        └────────────────────────────────────────────┘
                             │
                             ▼
                ┌────────────────────────┐
                │ Convert query to       │
                │  embedding vector      │
                │ using OpenAI Embedding │
                └────────────────────────┘
                             │
                             ▼
         ┌──────────────────────────────────────┐
         │ Search vector DB (e.g. Chroma, 
         | pinecone)                            │
         │ for most similar document chunks     │
         └──────────────────────────────────────┘
                             │
                             ▼
       ┌─────────────────────────────────────────────┐
       │ Inject retrieved chunks as context in prompt│
       │ e.g. “Use this context to answer: [...]”    │
       └─────────────────────────────────────────────┘
                             │
                             ▼
               ┌──────────────────────────────┐
               │  Send final prompt to GPT  │
               │  using Chat Completion API   │
               └──────────────────────────────┘
                             │
                             ▼
         ┌─────────────────────────────────────────────┐
         │ GPT generates final answer, grounded in docs│
         └─────────────────────────────────────────────┘


