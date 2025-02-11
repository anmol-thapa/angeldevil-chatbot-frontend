import { useState, useRef, useEffect } from 'react';
import './App.css';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

const MAX_TEXT_LIMIT = 1000;

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [messageLength, setMessageLength] = useState(0);
  const endMessageRef = useRef(null);


  async function backendReq() {
    const response = await fetch('https://angeldevil-chatbot-backend-643dfacf3e6b.herokuapp.com/chat', {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: inputMessage
    });

    const aiResponse = await response.json();
    const angelResponse = aiResponse.angel;
    const devilResponse = aiResponse.devil;

    newMessage(angelResponse, 'angel');
    newMessage(devilResponse, 'devil');
  }

  const newMessage = (message, sender) => {
    if (!message || message === '')
      return;

    const messageObj = {
      content: message,
      sender: sender,
      time: new Date()
    }
    setMessages(prevMessages => [...prevMessages, messageObj]);
  }

  const handleMessageSend = async (e) => {
    e.preventDefault();

    if (inputMessage.length === 0)
      return;

    if (inputMessage.length > MAX_TEXT_LIMIT)
      return;

    newMessage(inputMessage, 'user');
    backendReq();
    setInputMessage('');
    setMessageLength(0);
  }

  const handleMessageUpdate = (e) => {
    const messageValue = e.target.value;
    setMessageLength(messageValue.length);
    setInputMessage(messageValue);
  }

  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <p className='startAskingText'>Start Asking!</p>
      )
    }

    const mappedMessages = messages.map((message, index) => {
      // Figures out whether the message is from user, angel, or devil
      const messageStyle = message.sender === 'user' ? 'userMessage' : 'aiMessage';
      let responseStyle = '';
      if (messageStyle === 'aiMessage') {
        responseStyle = message.sender === 'angel' ? 'angelMessage' : 'devilMessage';
      }
      const time = dayjs(message.date).format('h:mm A');
      
      return (
        <div className={`messageBox ${messageStyle} ${responseStyle}`} key={index}>
          <p>{message.content}</p>
          {/* Prints the ai response's timestamp only under the devil's message  */}
          {responseStyle === 'devilMessage' && <p className={`timestamp ${messageStyle}`}>{time}</p>}
        </div>
      )
    });

    return mappedMessages;
  }

  // Automaticlaly scroll to the bottom of the chat
  useEffect(() => {
    if (endMessageRef.current) {
      endMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <>
      <div className={'messagesContainer'}>
        {renderMessages()}
        <div ref={endMessageRef} />
      </div>

      <form className='inputContainer' onSubmit={handleMessageSend}>
        <div className='inputBoxContainer'>
          <input className='messageInput' maxLength={MAX_TEXT_LIMIT} value={inputMessage} onChange={handleMessageUpdate} placeholder='Ask a question!' />
          <p className={`textLimitText ${messageLength >= MAX_TEXT_LIMIT ? 'textLimitReached' : ''}`}>{messageLength}/{MAX_TEXT_LIMIT}</p>
        </div>
        <button className={'sendButton'} type='submit'>Send</button>
      </form>
    </>
  )
}