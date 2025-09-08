
import './SplashPage.css'; // Make sure to create a corresponding CSS file
import TopNavbar from '../../components/TopNavbar/TopNavbar';
import logo from "../../assets/logo.png"

import { useNavigate } from 'react-router-dom';

import LogInForm from '../../components/LogInForm/LogInForm';
function SplashPage() {

  return (
    <div className="splash-container">
      <TopNavbar title={"Snapcode"} leftimage={false}/>
      <div className="content">
        <h1 className='heading'>Welcome to <b>SnapCode</b>!</h1>
        <div className="code-icon">
          <img src={logo} alt="Snapcode Logo" />
        </div>
          <LogInForm/>
      </div>
    </div>
  );
}

export default SplashPage;
