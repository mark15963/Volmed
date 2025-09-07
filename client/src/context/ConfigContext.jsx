import { createContext, useCallback, useContext, useEffect, useState } from "react";

import api from "../services/api";

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
    const [title, setTitleState] = useState({
        top: "",
        bottom: ""
    });
    const [color, setColorState] = useState({
        header: '',
        content: '',
    })

    const fetchTitle = useCallback(async () => {
        try {
            const { data } = await api.getTitle();
            setTitleState({
                top: data.topTitle,
                bottom: data.bottomTitle,
            })
        } catch (error) {
            setTitleState({
                top: 'DEFAULT',
                bottom: 'DEFAULT',
            })
            console.error("Cannot fetch title")
        }
    })
    useEffect(() => {
        fetchTitle()
    }, [])
    const setTitle = useCallback(async ({ top, bottom }) => {
        try {
            const { data } = await api.updateTitle({
                topTitle: top,
                bottomTitle: bottom
            })
            setTitleState({
                top: data.topTitle,
                bottom: data.bottomTitle
            })
        } catch (err) {
            console.error("Failed to update title:", err)
        }
    })

    const fetchColor = useCallback(async () => {
        try {
            const { data } = await api.getColor();
            setColorState({
                header: data.headerColor,
                content: data.contentColor
            })
        } catch (error) {
            setColorState({
                header: '#3c97e6',
                content: '#a5c6e2'
            })
            console.error("Cannot fetch color")
        }
    })
    useEffect(() => {
        fetchColor()
    }, [])
    const setColor = useCallback(async ({ header, content }) => {
        try {
            const { data } = await api.updateColor({
                headerColor: header,
                contentColor: content,
            })
            setColorState({
                header: data.headerColor,
                content: data.contentColor,
            })
        } catch (err) {
            console.error("Failed to update Color:", err)
        }
    })

    return (
        <ConfigContext.Provider value={{ title, setTitle, color, setColor }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => useContext(ConfigContext);