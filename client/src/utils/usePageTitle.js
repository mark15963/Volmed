import { useEffect } from "react";
import { useConfig } from "../context";
import { matchPath, useLocation } from "react-router";

const pageTitleConfig = {
  "/": {
    title: "Главная",
    dynamic: false,
  },
  "/patients": {
    title: "Список пациентов",
    dynamic: false,
  },
  "/search/:id": {
    title: "Результаты поиска",
    dynamic: true,
  },
  "/register": {
    title: "Регистрация пациента",
    dynamic: false,
  },
  "/edit/:id": {
    title: "Редактирование пациента",
    dynamic: true, // This page might want to show patient name
  },
  "/login": {
    title: "Вход в систему",
    dynamic: false,
  },
  "/administered": {
    title: "Введенные препараты",
    dynamic: false,
  },
  "/discharged": {
    title: "Выписанные пациенты",
    dynamic: false,
  },
  "/hospitalized": {
    title: "Госпитализированные",
    dynamic: false,
  },
  "/dashboard": {
    title: "Панель управления",
    dynamic: false,
  },
};

export const usePageTitle = (customTitle = null, dynamicData = null) => {
  const config = useConfig();
  const location = useLocation();

  useEffect(() => {
    const baseTitle =
      config.title?.title || "ГБУ «Городская больница Волновахского района»";

    let finalTitle;

    if (customTitle) {
      finalTitle = customTitle;
    } else {
      let pageTitle = "Страница";
      let isDynamic = false;
      let matchedRoute = null;

      for (const [route, routeConfig] of Object.entries(pageTitleConfig)) {
        const match = matchPath(route, location.pathname);
        if (match) {
          pageTitle = routeConfig.title;
          isDynamic = routeConfig.dynamic;
          matchedRoute = route;
          break;
        }
      }

      // Handle dynamic titles with patient data
      if (isDynamic && dynamicData) {
        if (matchedRoute === "/search/:id" || matchedRoute === "/edit/:id") {
          const patientName = `${dynamicData.lastName} ${
            dynamicData.firstName
          } ${dynamicData.patr || ""}`.trim();
          pageTitle = `${pageTitle}: ${patientName}`;
        }
      }

      if (location.pathname === "/*") {
        pageTitle = "Страница не найдена";
      }

      finalTitle = pageTitle;
    }

    document.title = `${finalTitle} | ${baseTitle}`;

    return () => {};
  }, [location.pathname, config.title?.title, customTitle, dynamicData]);

  const setCustomTitle = (title) => {
    const baseTitle =
      config.title?.title || "ГБУ «Городская больница Волновахского района»";
    document.title = `${title} | ${baseTitle}`;
  };

  return { setCustomTitle };
};
