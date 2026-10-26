import { useAdminDataContext } from "../context/adminDataContextCore";

/**
 * Hook to access admin data context.
 * Standardizes hook consumption to useAdminDataContext from adminDataContextCore.
 */
export const useAdminData = useAdminDataContext;

export default useAdminData;
