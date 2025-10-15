import { useEffect } from 'react';
import { useConfig } from '../context';

export const usePageTitle = (title) => {
  const config = useConfig()
  const { title } = config

  useEffect(() => {
    const baseTitle = `${title.top} ${title.bottom}`;

    document.title = title ? `${title} | ${baseTitle}` : baseTitle;

    return () => {
      document.title = baseTitle;
    };
  }, [title]);
};