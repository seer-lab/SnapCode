import React from 'react';
import './SplashPage.css'; // Make sure to create a corresponding CSS file
import TopNavbar from '../../components/TopNavbar/TopNavbar';
import logo from "../../assets/logo.png"
import { Link } from 'react-router-dom';
import LongButton from '../../components/LongButton/LongButton';
import SolidButton from '../../components/buttons/Solid/SolidButton';
import { useNavigate } from 'react-router-dom';
import OutlineButton from '../../components/buttons/Outline/OutlineButton';
import LogInForm from '../../components/LogInForm/LogInForm';
function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="splash-container">
      <TopNavbar title={"Snapcode"} leftimage={false}/>
      <div className="content">
        <h1 className='heading'>Welcome to <b>Snapcode</b>!</h1>
        <div className="code-icon">
          <img src={logo} alt="Snapcode Logo" />
        </div>
        
          <LogInForm/>


        
      </div>
    </div>
  );
}

export default SplashPage;
