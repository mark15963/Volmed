import { memo, useEffect } from "react";

import styles from './header.module.scss'

import Title from "./components/Title";
import UserContainer from "./components/UserContainer";
import { useConfig } from "../../context";

export const Header = memo(() => {
  const { color } = useConfig()

  // Add error boundary
  if (!color) {
    return <div>Loading...</div>;
  }

  return (
    <header>
      <div style={{ backgroundColor: color.header }}
        className={styles.content}
      >

        <Title />

        <div style={{ width: "100%" }} />

        <UserContainer />

      </div>
    </header>
  )
})

export default Header
