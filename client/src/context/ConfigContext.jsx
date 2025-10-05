import { createContext, useCallback, useContext, useEffect, useState } from "react";

import api from "../services/api";

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
    const [title, setTitleState] = useState({
        top: "",
        bottom: ""
    });
    const [color, setColorState] = useState({
        header: '#3c97e6',
        content: '#a5c6e2',
    })
    const [logo, setLogoState] = useState(null)

    const fetchTitle = useCallback(async () => {
        try {
            const { data } = await api.getTitle();
            setTitleState({
                top: data.topTitle,
                bottom: data.bottomTitle,
            })
        } catch (error) {
            setTitleState({
                top: '',
                bottom: '',
            })
            console.error("Cannot fetch title")
        }
    }, [])
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
    }, [])
    const fetchLogo = useCallback(async () => {
        try {
            const { data } = await api.getLogo()
            setLogoState(data.logoUrl)
            console.log("Get logo from:", data.logoUrl);

        } catch (err) {
            console.error("Cannon fetch logo")
            setLogoState(null)
        }
    }, [])

    useEffect(() => {
        fetchTitle()
        fetchColor()
        fetchLogo()
    }, [fetchTitle, fetchColor, fetchLogo])

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
    }, [])
    const setLogo = useCallback(async (fileUrl) => {
        setLogoState(fileUrl)
    }, [])

    return (
        <ConfigContext.Provider value={{
            title,
            setTitle,
            color,
            setColor,
            logo,
            setLogo
        }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => useContext(ConfigContext);