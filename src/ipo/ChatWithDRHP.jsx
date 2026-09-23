import { useState } from 'react';
import { Send, Bot, User, MessageCircle, Loader2 } from 'lucide-react';
import { sendChatQuestion } from '../services/ipoApi';

const SUGGESTIONS = [
  'What does this company do?',
  'What are the key risks?',
  'Should I apply for this IPO?',
];

export default function ChatWithDRHP({ ipo }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Hi! Ask me anything about ${ipo.name}'s business, financials, or risks — I'll answer from the company's filings and available data.` },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (text) => {
    const q = (text || input).trim();
    if (!q || sending) return;

    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setInput('');
    setSending(true);

    try {
      const { answer } = await sendChatQuestion(ipo.id, q);
      setMessages(prev => [...prev, { role: 'bot', text: answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: `Sorry, I couldn't get an answer right now (${err.message}). Try again in a moment.` }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="ipo-section-block" id="chat">
      <div className="section-label-tag">19</div>
      <h2 className="section-title">Chat with DRHP 🤖</h2>
      <p className="section-subtitle">Ask questions — answered by AI from the company's filings and available data</p>
      <div className="chat-container glass-card">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.role}`}>
              <div className="chat-avatar">{msg.role === 'bot' ? <Bot size={16} /> : <User size={16} />}</div>
              <div className="chat-bubble">{msg.text}</div>
            </div>
          ))}
          {sending && (
            <div className="chat-msg bot">
              <div className="chat-avatar"><Bot size={16} /></div>
              <div className="chat-bubble"><Loader2 size={14} className="spinning" /> Thinking…</div>
            </div>
          )}
        </div>
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="chat-suggestion" onClick={() => handleSend(s)} disabled={sending}>
              <MessageCircle size={12} /> {s}
            </button>
          ))}
        </div>
        <div className="chat-input-bar">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about this IPO..." disabled={sending}
            onKeyDown={e => e.key === 'Enter' && handleSend()} />
          <button className="chat-send" onClick={() => handleSend()} disabled={sending}><Send size={18} /></button>
        </div>
      </div>
    </section>
  );
}
