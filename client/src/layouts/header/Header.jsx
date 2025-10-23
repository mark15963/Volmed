import { memo, useEffect } from "react";

import styles from '../styles/header.module.scss'

import Title from "./components/Title";
import UserContainer from "./components/UserContainer";
import { useConfig } from "../../context";

import debug from "../../utils/debug";

export const Header = memo(() => {
  const { color } = useConfig()

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
