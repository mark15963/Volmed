import { useEffect, useRef } from "react"

import Button from "../../Button"
import Input from "../../Input"
import { SpinLoader } from "../../ui/loaders/SpinLoader"
import { formatChatTime } from "../../../utils/time"

import styles from '../styles/Chat.module.scss'
import debug from "../../../utils/debug"

export const AdminChatWindow = ({
  activeChats,
  currentRoom,
  showChat,
  isLoading,
  messages,
  message,
  setMessage,
  joinRoom,
  handleSendMessage,
  deleteChat
}) => {
  const messagesEndRef = useRef(null)

  const getUserNameFromRoom = (room) => {
    if (!room) return 'Unknown User';
    // Assuming room format is "chat_{userId}_admin"
    const parts = room.split('_');
    if (parts.length > 1) {
      return parts[1]
    }
    return room;
  }

  useEffect(() => {
    debug.log("Messages updated:", messages);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className={styles.adminContainer}>
      {/* Left: list of chats */}
      <div className={styles.leftSide}>
        <div className={styles.title}>
          Активные чаты
        </div>
        {activeChats.map((room) => (
          <div
            key={room}
            style={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Button
              text={getUserNameFromRoom(room)}
              style={{
                maxWidth: '100px',
                fontSize: '0.5em',
                wordBreak: 'break-word'
              }}
              onClick={() => joinRoom(room)}
            />
            <div
              style={{
                fontSize: '0.8em',
                fontWeight: '700',
                color: 'red',
                userSelect: 'none',
                cursor: 'pointer'
              }}
              onClick={() => deleteChat(room)}
              title="Удалить чат"
            >
              X
            </div>
          </div>
        ))}
      </div>

      {/* Right: current chat */}
      {showChat && (
        <div className={styles.rightSide}>
          <div className={styles.title}>
            {currentRoom ? `Чат с ${getUserNameFromRoom(currentRoom)}` : 'Выбрать чат'}
          </div>
          <div
            className={styles.screen}
            style={{
              background: !currentRoom ? '#bbb' : '#fff',
            }}
          >
            {isLoading ? (
              <div className={styles.loader}>
                <SpinLoader color="blue" size='30px' />
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={styles.message}
                  style={{
                    textAlign: m.senderName !== "Админ" ? 'left' : 'right',
                  }}
                >
                  <strong>{m.senderName}:</strong> {m.text}{" "}
                  <span className={styles.time}>
                    ({formatChatTime(m.timestamp)})
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {currentRoom && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Сообщение"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                text="Отправить"
                onClick={handleSendMessage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminChatWindow