import styles from "./styles.module.css"

const Administered = () => {
  return (
    <div className={styles.container}>
      <div className={styles.mainBlock}>
        СПИСОК ПОСТУПИВШИХ
        <table className={styles.table}>

          <thead className={styles.head}>
            <tr className={styles.rows}>
              <th>#</th>
              <th>Поступление/th>
              <th>ФИО</th>
              <th>Диагноз</th>
            </tr>
          </thead>

          <tbody className={styles.tbody}>
          {loading ? (
            <SkeletonTheme baseColor="#51a1da" highlightColor="#488ab9">
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className={styles.rowsLoading}>
                  <td>
                    <Skeleton borderRadius={5} />
                  </td>
                </tr>
              ))}
            </SkeletonTheme>
          ) : patients.length > 0 ? (
            patients.map(patient => (
              <tr
                key={patient.id}
                className={styles.rows}
                onClick={(e) => handlePatientClick(patient.id, e)}
                onKeyDown={(e) => handlePatientClick(patient.id, e)}
                tabIndex={0}
                role="button"
              >
                <td>
                  {patient.id}
                </td>
                <td>
                  {moment(patient.created_at).format('DD.MM.YYYY')}
                </td>
                <td>
                  {patient.lastName} {patient.firstName} {patient.patr}
                </td>
                <td>
                  {patient.diag}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className={styles.noData}>
                No data found!
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}

export default Administered
