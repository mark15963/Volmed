import { useEffect, useState } from "react"
import Graph from "../../searchResults/tabs/Components/Graph"
import { debug } from "../../../utils"
import { SpinLoader } from "../../../components/ui/loaders/SpinLoader"

export const UserData = ({ user, onClose }) => {

  const handleClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        display: 'flex',
        top: "0px",
        left: "0px",
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#00000090',
        zIndex: 10
      }}
      onClick={handleClick}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'start',
          padding: "20px",
          width: 'fit-content',
          height: 'fit-content',
          background: 'aliceblue',
          borderRadius: '8px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Данные пользователя: <span>№{user.id}</span></h2>
        <p>ФИО: <span>{user.lastName} {user.firstName} {user.patr}</span></p>
        <p>Должность: <span>{user.displayStatus}</span></p>

      </div>
    </div>
  )
}