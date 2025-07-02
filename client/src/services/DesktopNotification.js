// USE IN REACT
// import notification from '../../services/DesktopNotification';
// notification.show("TITLE", "BODY", time)

import { useEffect } from "react";

const premPerms = () => {
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);
};

export default {
  show: (title, body, time = 2000) => {
    if (Notification.permission === "granted") {
      var options = {
        body,
        icon: "../../../public/герб_ямала.png",
        dir: "ltr",
      };
    }
    const notification = new Notification(title, options);

    setTimeout(() => notification.close(), time);
  },
};
