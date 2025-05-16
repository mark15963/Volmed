import { useEffect } from 'react';

export const usePageTitle = (title) => {
    useEffect(() => {
        const baseTitle = "ГБУ «Городская больница Волновахского района»";
        document.title = title ? `${title} | ${baseTitle}` : baseTitle;

        return () => {
            document.title = baseTitle;
        };
    }, [title]);
};