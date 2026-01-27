import { memo, useEffect } from "react";

import styles from './header.module.scss'

import Title from "./components/Title";
import UserContainer from "./components/UserContainer";
import { useConfig } from "../../context";

export const Header = memo(() => {
  const { color } = useConfig()

  return (
    <header>
      <div style={{ backgroundColor: color.header }}
        className={styles.content}
      >

        <Title />

        <div className={styles.space} />

        <UserContainer />

      </div>
    </header>
  )
})

export default Header
