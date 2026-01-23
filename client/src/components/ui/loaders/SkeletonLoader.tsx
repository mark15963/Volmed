import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import styles from "./SkeletonLoader.module.scss";

interface SkeletonLoaderProps {
  lines?: number | string;
}
export const SkeletonLoader = ({ lines = 5 }: SkeletonLoaderProps) => {
  const lineCount = Number(lines) || 5;
  return (
    <SkeletonTheme customHighlightBackground="linear-gradient(90deg, var(--table-row) 40%, var(--table-row-loading) 50%, var(--table-row) 60%)">
      {Array.from({ length: lineCount }).map((_, i) => (
        <tr key={i} className={styles.rowsLoading}>
          <td>
            <Skeleton borderRadius={5} />
          </td>
        </tr>
      ))}
    </SkeletonTheme>
  );
};
