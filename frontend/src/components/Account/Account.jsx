import React from "react";
import "./Account.css"; 
import { auth } from '../../config/firebase';
import { useAuthContext } from "../../contexts/authContext";
import { useSettingsContext } from "../../contexts/settingsContext";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import SolidButton from "../buttons/Solid/SolidButton";
import { FiLogOut } from "react-icons/fi";
import CodeSettings from "../CodeSettings/CodeSettings";
import AboutProject from "../AboutProject/AboutProject";
import Accordion from "../Accordion/Accordion";

const Account = () => {
  // ✅ CAMBIO: usar 'currentUser' en lugar de 'user'
  const { currentUser, logout: contextLogout } = useAuthContext();
  const { settings, updateSetting } = useSettingsContext();
  const navigate = useNavigate();

  console.log(currentUser);

  
  const handleLogout = async () => {
    try {
      await contextLogout(); 
      navigate("/");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

 
  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="account-page">
      <div className="account-info">
        <h2>Welcome {currentUser.email || currentUser.displayName || 'User'}!</h2>
      </div>
      
      {/* Code Settings Accordion */}
      <Accordion title="Code Settings" defaultOpen={false}>
        <CodeSettings settings={settings} updateSetting={updateSetting} />
      </Accordion>

      {/* About This Project Accordion */}
      <Accordion title="About This Project" defaultOpen={false}>
        <AboutProject compact={true} showLogos={true} />
      </Accordion>

      <SolidButton onClick={handleLogout} color="#FFBF00">
        <FiLogOut size={20} style={{ marginRight: '8px' }} />
        Logout
      </SolidButton>
    </div>
  );
};

export default Account;