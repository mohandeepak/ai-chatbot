import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [useRag, setUseRag] = useState(false)
  const [sources, setSources] = useState<any[]>([]) // For RAG metadata

  const sendMessage = async () => {
    if (!input.trim()) return

    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post('/api/chat', {
        messages: newMessages,
        useRag, // ✅ Send RAG toggle
      })

      const response = res.data.response
      setMessages([...newMessages, response])

      if (res.data.sources) {
        setSources(res.data.sources)
      } else {
        setSources([])
      }
    } catch (err) {
      console.error(err)
      alert('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>MoCha AI</h1>

      <div className="input-box">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
        <label style={{ marginLeft: '1em' }}>
          <input
            type="checkbox"
            checked={useRag}
            onChange={(e) => setUseRag(e.target.checked)}
          />{' '}
          Use RAG (10-K)
        </label>
      </div>

      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
          </div>
        ))}
        {loading && <div className="message assistant">AI is typing...</div>}

        {sources.length > 0 && (
          <div className="sources">
            <h4>📚 Sources:</h4>
            <ul>
              {sources.map((src, i) => (
                <li key={i}>
                  Chunk: {src.symbol} - {src.year}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
