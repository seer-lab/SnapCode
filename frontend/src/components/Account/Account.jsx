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
  const { setTriggerUpdateAuthContext, user } = useAuthContext();
  const { settings, updateSetting } = useSettingsContext();
  const navigate = useNavigate();

  console.log(user);

  const logout = async () => {
    signOut(auth);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        setTriggerUpdateAuthContext((prev) => prev + 1);
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="account-page">
      <div className="account-info">
        <h2>Welcome {user.email}!</h2>
      </div>
      
      {/* Code Settings Accordion */}
      <Accordion title="Code Settings" defaultOpen={false}>
        <CodeSettings settings={settings} updateSetting={updateSetting} />
      </Accordion>

      {/* About This Project Accordion */}
      <Accordion title="About This Project" defaultOpen={false}>
        <AboutProject compact={true} showLogos={true} />
      </Accordion>

      <SolidButton onClick={logout} color="#FFBF00">
        <FiLogOut size={20} style={{ marginRight: '8px' }} />
        Logout
      </SolidButton>
    </div>
  );
};

export default Account;