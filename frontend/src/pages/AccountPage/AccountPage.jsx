import TopNavbar from "../../components/TopNavbar/TopNavbar";
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar";
import Account from "../../components/Account/Account";
import { useBottomNavigation } from "../../hooks/useBottomNavigation";
import "./AccountPage.css";

const AccountPage = () => {
  const { handleTabChange } = useBottomNavigation();

  return (
    <div className="account-page-container">
      <TopNavbar 
        title="Account" 
        // Uses navigate(-1) by default - goes back to previous page
      />
      <div className="account-content-container">
        <Account />
      </div>
      <BottomNavbar 
        handleChange={handleTabChange}
        selectedValue="account" // Always "account" since we're on account page
      />
    </div>
  );
};

export default AccountPage;