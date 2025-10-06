import React, { useState, useEffect } from "react";
import "./CloudSyncSection.css";
import { useCloudSync } from "../../hooks/useCloudSync";
import { useUserAnalytics } from "../../hooks/useUserAnalytics";
import { MdCloudSync, MdCloudUpload, MdCloudDownload } from "react-icons/md";
import SolidButton from "../buttons/Solid/SolidButton";

export default function CloudSyncSection({ className = "", compact = false }) {
  const {
    isSyncing,
    syncStatus,
    error,
    isAuthenticated,
    syncAll,
    forceUploadAll,
    forceDownloadAll,
    clearError
  } = useCloudSync();

  // Analytics setup
  const { logSmartSyncCloud, logUploadedCloud, logDownloadedCloud } = useUserAnalytics();

  useEffect(() => {
    const setNavHeightVar = () => {
      const nav = document.querySelector('.lower-nav');
      const h = nav ? nav.getBoundingClientRect().height : 64; // fallback
      document.documentElement.style.setProperty('--bottom-nav-height', `${h}px`);
    };
    setNavHeightVar();
    window.addEventListener('resize', setNavHeightVar);
    return () => window.removeEventListener('resize', setNavHeightVar);
  }, []);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successAction, setSuccessAction] = useState('');

  const handleSmartSync = async () => {
    const result = await syncAll();
    if (result.success) {
      setSuccessAction('Smart Sync');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      await logSmartSyncCloud();
    }
  };

  const handleUploadAll = async () => {
    if (window.confirm('This will overwrite all cloud data with your local data. Continue?')) {
      const result = await forceUploadAll();
      if (result.success) {
        setSuccessAction('Upload');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        await logUploadedCloud();
      }
    }
  };

  const handleDownloadAll = async () => {
    if (window.confirm('This will overwrite all local data with your cloud data. Continue?')) {
      const result = await forceDownloadAll();
      if (result.success) {
        setSuccessAction('Download');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        await logDownloadedCloud();
      }
    }
  };


  if (!isAuthenticated) {
    return (
      <div className={`sync-container ${className} ${compact ? "sync-compact" : ""}`}>
        <div className="sync-not-authenticated">
          <p>You need to be logged in to use cloud synchronization.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`sync-container ${className} ${compact ? "sync-compact" : ""}`}>
      {/* Header */}
      <header className="sync-header">
        <div className="sync-header-left">
          <p className="sync-subtitle">
            Keep your exercises synced across all your devices. Your data is stored securely in the cloud
            and automatically merges changes to ensure you never lose your progress.
          </p>
        </div>
      </header>

      <div className="sync-grid">
        <Section title="Smart Sync">
          Checks your device and the cloud, then keeps the newest version of your work.
          This is the best option to use every day because it saves your latest progress.
          <div className="sync-button-container">
            <SolidButton 
              onClick={handleSmartSync} 
              disabled={isSyncing}
              color="#667eea"
            >
              <MdCloudSync size={20} className={isSyncing ? 'spin' : ''} style={{ marginRight: '8px' }} />
              {isSyncing ? 'Syncing...' : 'Smart Sync'}
            </SolidButton>
          </div>
        </Section>

        <Section title="Upload All">
            Sends everything from your device to the cloud.
            This will replace what's in the cloud with what you have on your device.
            Use it when you're sure your version is the correct one.
          <div className="sync-button-container">
            <SolidButton 
              onClick={handleUploadAll} 
              disabled={isSyncing}
              color="#4CAF50"
            >
              <MdCloudUpload size={20} style={{ marginRight: '8px' }} />
              Upload All
            </SolidButton>
          </div>
        </Section>

        <Section title="Download All">
          Replaces all your local exercises with the versions stored in the cloud. 
          Useful when switching to a new device or if you want to restore from your cloud backup.
          <div className="sync-button-container">
            <SolidButton 
              onClick={handleDownloadAll} 
              disabled={isSyncing}
              color="#2196F3"
            >
              <MdCloudDownload size={20} style={{ marginRight: '8px' }} />
              Download All
            </SolidButton>
          </div>
        </Section>



            <p className="sync-tip">
                Your work is always saved on your device first.
                The cloud is extra help so you can keep everything safe and use it from anywhere.
            </p>

      
      </div>

      <div className="toast-viewport">
        {showSuccessMessage && (
          <div className="toast toast-success">
            {successAction} completed successfully
          </div>
        )}

        {error && (
          <div className="toast toast-error" onClick={clearError}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

const Section = ({ title, children }) => {
  return (
    <section className="sync-section">
      <h3 className="sync-h3">{title}</h3>
      <div className="sync-body">{children}</div>
    </section>
  );
};