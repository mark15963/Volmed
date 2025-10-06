import { message } from "antd";
import { createContext, useContext } from "react";

const MessageContext = createContext(null)

export const useMessageApi = () => useContext(MessageContext)

export const MessageProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage()

  return (
    <MessageContext.Provider value={messageApi}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  )
}