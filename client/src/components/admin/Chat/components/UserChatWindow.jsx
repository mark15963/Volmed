import { useEffect, useRef } from "react";
import Input from "../../../Input";
import Button from "../../../Button";
import styles from '../styles/Chat.module.scss'

export const UserChatWindow = ({ messages, onSendMessage, message, setMessage, currentUserId, displayName }) => {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className={styles.container}>
      <div className={styles.screen}>
        <div className={styles.messageRows}>
          <div className={styles.generalInfo}>
            <span className={styles.info}>
              Служба поддержки
            </span>
          </div>

          {messages.map((msg, i) => (
            <div
              key={i}
              className={styles.messageBox}
              style={{
                textAlign: msg.sender === currentUserId
                  ? 'right'
                  : 'left',
                color: msg.type === 'system'
                  ? 'gray'
                  : 'inherit',
                backgroundColor: msg.sender === currentUserId
                  ? '#68eb269e'
                  : '#bfbfbf9e',
                alignSelf: msg.sender === currentUserId
                  ? 'flex-end'
                  : 'flex-start',
              }}
            >
              {msg.type !== "system" && (
                <div style={{
                  fontSize: '0.8em'
                }}>
                  {msg.sender === currentUserId
                    ? displayName
                    : msg.senderName || "Unknown"} - {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              <div>{msg.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
      </div>

      <div className={styles.messageInputs}>
        <Input
          placeholder="Сообщение"
          className={styles.input}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSendMessage()
          }}
        />
        <Button
          text="Отправить"
          style={{
            width: 'fit-content'
          }}
          size="s"
          className={styles.button}
          onClick={onSendMessage}
        />
      </div>
    </div>
  )
}

export default UserChatWindow