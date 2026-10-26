import { createContext, useContext } from "react";

const AdminDataContext = createContext(void 0);

const useAdminDataContext = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminDataContext must be used within AdminDataProvider");
  }
  return context;
};

export {
  AdminDataContext,
  useAdminDataContext
};
