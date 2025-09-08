import React from 'react';
import './ForgotPasswordPage.css';
import TopNavbar from '../../components/TopNavbar/TopNavbar';
import ForgotPasswordForm from '../../components/ForgotPasswordForm/ForgotPasswordForm';

function ForgotPasswordPage() {
  return (
    <div className="forgot-password-container">
      <TopNavbar title={"Snapcode"} leftimage={true}/>
      <ForgotPasswordForm/>
    </div>
  );
}

export default ForgotPasswordPage;