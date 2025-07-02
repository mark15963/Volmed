// USE IN REACT
// import notification from '../../services/DesktopNotification';
// notification.show("TITLE", "BODY", time)

import { useEffect } from "react";

// const premPerms = () => {
//   useEffect(() => {
//     if ("Notification" in window && Notification.permission !== "granted") {
//       Notification.requestPermission();
//       console.log("Permissions has to be agreed to");
//     }
//   }, []);
// };

export default {
  requestPermission: () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  },

  show: (title, body, time = 2000) => {
    console.log("Notification permission status:", Notification.permission);

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
        icon: "/герб_ямала.png",
        dir: "ltr",
      };

      const notification = new Notification(title, options);

      setTimeout(() => notification.close(), time);
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  },
};
