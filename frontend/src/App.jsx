import "./App.css";
import { Routes, Route } from "react-router-dom";
import SplashPage from "./pages/SplashPage/SplashPage";
import './styles/global.css';
import LogInPage from "./pages/LogInPage/LogInPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import { useAuthContext } from "./contexts/authContext";
import { SettingsProvider } from "./contexts/settingsContext";
import ExerciseDashboard from "./pages/ExerciseDashboard/ExerciseDashboard";
import HomeDashboard from "./pages/HomeDashboard/HomeDashboard";
import AccountPage from "./pages/AccountPage/AccountPage";
import FileUploadPage from "./pages/FileUploadPage/FileUploadPage";
import ConfirmImage from "./components/ConfirmImage/ConfirmImage";
import CodeTabContent from "./components/CodeTabContent/CodeTabContent";
import ExerciseLayout from "./pages/ExerciseLayout.jsx/ExerciseLayout";
// NEW IMPORTS FOR INSERT FUNCTIONALITY
import InsertCodePage from "./pages/InsertCodePage/InsertCodePage";
import FileUploadInsertPage from "./pages/FileUploadInsertPage/FileUploadInsertPage";
import ConfirmImageInsertPage from "./pages/ConfimImageInsertPage/ConfirmImageInsertPage";
import Spinner from "./components/Spinner/Spinner";

function AppContent() {
  const {
    isLoggedIn,
    isAuthContextLoading,
  } = useAuthContext();

  if (isAuthContextLoading) {
    return <Spinner />;
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<SplashPage/>}/>
        <Route path="/login" element={<LogInPage/>}/>
        <Route path="/signup" element={<SignUpPage/>}/>
        <Route path="/dashboard" element={<HomeDashboard/>}/>
        <Route path="/account" element={<AccountPage/>}/>
        
        {/* Nested routes for exercises */}
        <Route path="/exerciseDashboard/:exId" element={<ExerciseLayout />}>
          <Route index element={<ExerciseDashboard />} />
          <Route path="upload" element={<FileUploadPage />} />
          <Route path="confirmImage" element={<ConfirmImage />} />
          {/* NEW ROUTES FOR INSERT FUNCTIONALITY */}
          <Route path="insertCode" element={<InsertCodePage />} />
          <Route path="uploadInsert" element={<FileUploadInsertPage />} />
          <Route path="confirmImageInsert" element={<ConfirmImageInsertPage />} />
        </Route>
        
        {/* Legacy routes for backward compatibility */}
        <Route path="/confirmImage" element={<ConfirmImage />} />
        <Route path="/codeViewer" element={<CodeTabContent />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;