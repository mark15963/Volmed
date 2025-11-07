// Used in
// - AccessDenied.jsx
// - UserList.jsx
//
// makes displayStatus from status

export const statusDisplayMap = {
  admin: "Администратор",
  tester: " Тестировщик",
  doctor: "Врач",
  nurse: "Медсестра",
};

export const displayStatusMap = Object.fromEntries(
  Object.entries(statusDisplayMap).map(([k, v]) => [v, k])
);
// statusDisplayMap: backend → display
// displayStatusMap: display → backend
