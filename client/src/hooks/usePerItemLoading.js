//#region ===== Usage =====
//
// 1. "setItemLoading" gets id and boolean (id, true/false)
// 2. sets boolean of "loadingState"
// 3. using useUsers() of /context/UsersDataContext
//    gets user.id
//
//-----------------------------------------
// example from UserList.jsx
//
// import { usePerItemLoading } from '../../../hooks/usePerItemLoading'
//
//  const { users, loading, fetchUsers } = useUsers()
//
// const {
//   loadingStates: deleteLoading,
//   setItemLoading: setDeleteLoading   <-----
// } = usePerItemLoading()
//
// const {
//   loadingStates: statusLoading,
//   setItemLoading: setStatusLoading   <-----
// } = usePerItemLoading()
//
//
// setStatusLoading(id, true)
// setDeleteLoading(id, true)
//
// <>
//   {users.map((user) => (
//     ...
//     loading={deleteLoading[user.id]}
//     ...
//   }
// </>
//
//#endregion

import { useCallback, useState } from "react";

export const usePerItemLoading = () => {
  const [loadingStates, setLoadingStates] = useState({});
  const setItemLoading = useCallback((itemId, isLoading) => {
    setLoadingStates((prev) => ({
      ...prev,
      [itemId]: isLoading,
    }));
  }, []);

  const isItemLoading = useCallback(
    (itemId) => {
      return !!loadingStates[itemId];
    },
    [loadingStates]
  );

  const clearLoadingStates = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    loadingStates,
    setItemLoading,
    isItemLoading,
    clearLoadingStates,
  };
};
