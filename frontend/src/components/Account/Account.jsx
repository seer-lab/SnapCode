import React from "react";
import "./Account.css"; 
import LongButton from "../LongButton/LongButton";
import { auth } from '../../config/firebase';
import { useAuthContext } from "../../contexts/authContext";
import { useSettingsContext } from "../../contexts/settingsContext";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import SolidButton from "../buttons/Solid/SolidButton";
import { FiLogOut } from "react-icons/fi";
import SimpleSyntaxHighlighter from "../SimpleSyntaxHighlighter/SimpleSyntaxHighlighter";

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
  }

  const handleFontSizeChange = (event) => {
    updateSetting('codeFontSize', event.target.value);
  };

  const handleSyntaxChange = (event) => {
    updateSetting('syntaxHighlight', event.target.value === 'true');
  };

  const fontSizeOptions = [
    { value: '1rem', label: 'Small' },
    { value: '1.25rem', label: 'Medium' },
    { value: '1.5rem', label: 'Large' }
  ];

  const syntaxOptions = [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' }
  ];

  // Safely get the syntaxHighlight value with fallback
  const syntaxHighlightValue = settings.syntaxHighlight !== undefined ? settings.syntaxHighlight : true;

  return (
    <div className="account-page">
      <div className="account-info">
        <h2>Welcome {user.email}!</h2>
      </div>
      
      <div className="settings-section">
        <h3>Code Settings</h3>
        
        <div className="setting-item">
          <label htmlFor="font-size-selector">Choose Code Font Size:</label>
          <select 
            id="font-size-selector"
            className="font-size-selector"
            value={settings.codeFontSize || '1rem'} 
            onChange={handleFontSizeChange}
          >
            {fontSizeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="setting-item">
          <label htmlFor="syntax-selector">Activate Syntax Highlighting?</label>
          <select 
            id="syntax-selector"
            className="syntax-selector"
            value={syntaxHighlightValue.toString()} 
            onChange={handleSyntaxChange}
          >
            {syntaxOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="preview-section">
          <p>Preview:</p>
          <div className="code-preview">
            <SimpleSyntaxHighlighter 
              code={'<h1>Hello</h1>'}
              language="markup"
              syntaxHighlight={syntaxHighlightValue}
              style={{ fontSize: settings.codeFontSize || '1rem' }}
            />
          </div>
        </div>
      </div>

      <SolidButton onClick={logout} color="#FFBF00">
        <FiLogOut size={20} style={{ marginRight: '8px' }} />
        Logout
      </SolidButton>
    </div>
  );
};

export default Account;