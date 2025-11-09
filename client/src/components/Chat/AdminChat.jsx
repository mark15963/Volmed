import useChat from "../../hooks/useChat";
import AdminChatWindow from "./components/AdminChatWindow";

const AdminChat = () => {
  const {
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
  } = useChat(null, "admin")

  return (
    <AdminChatWindow
      activeChats={activeChats}
      currentRoom={currentRoom}
      showChat={showChat}
      isLoading={isLoading}
      messages={messages}
      message={message}
      setMessage={setMessage}
      joinRoom={joinRoom}
      handleSendMessage={handleSendMessage}
      deleteChat={deleteChat}
    />
  )
}

export default AdminChat