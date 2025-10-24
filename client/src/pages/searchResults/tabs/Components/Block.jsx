import styles from '../../searchResults.module.css';

export const Block = ({ text, content }) => {
  return (
    <div className={styles.title}>

      {`${text} `}

      <br />

      <span className={styles.data}>
        {content}
      </span>

    </div>
  )
}