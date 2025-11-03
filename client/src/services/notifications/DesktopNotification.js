//#region ===== USAGE (NOT WORKING ON MOBILE) =====
// Used in SideMenu
//
//---------------------------------------------------------------
//
// import notification from '../../services/DesktopNotification';
//
// useEffect(() => {
//   notification.requestPermisson()
// }, [])
//
// notification.show("TITLE", "BODY", time)
//
//---------------------------------------------------------------
//#endregion

import { debug } from "../../utils/debug";

export default {
  requestPermission: () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((perm) => {
        console.log("Notification permission:", perm);
      });
    }
  },

  show: (title, body, time = 2000) => {
    if (!("Notification" in window)) {
      console.error("This browser does not support notifications");
      return;
    }

    if (Notification.permission !== "granted") {
      console.warn("Notifications not granted");
      return;
    }

    try {
      const options = {
        body,
        icon: "/assets/images/logo.webp",
        dir: "ltr",
        yaServiceName: "Volmed",
        data: {},
        vibrate: [200, 100, 200],
        tag: "Notif", // allows to overwrite existing notification. Name for a spesific type of messages
      };

      const notification = new Notification(title, options);
      setTimeout(() => notification.close(), time);
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  },
};
