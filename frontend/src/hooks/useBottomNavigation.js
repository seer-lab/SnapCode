import { useNavigate } from "react-router-dom";

/**
 * Hook to manage bottom navigation
 * @returns {Object} Functions to handle navigation
 */
export const useBottomNavigation = () => {
  const navigate = useNavigate();

  const handleTabChange = (newTab) => {
    if (newTab === "home") {
      navigate("/dashboard");
    } else if (newTab === "account") {
      navigate("/account");
    }
  };

  return {
    handleTabChange
  };
};