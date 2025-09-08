import "./App.css";
import { Routes, Route } from "react-router-dom";
import SplashPage from "./pages/SplashPage/SplashPage";
import './styles/global.css';
import LogInPage from "./pages/LogInPage/LogInPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage";
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
import PageSpinner from "./pages/PageSpinner/PageSpinner";
// IMPORT PROTECTED ROUTE COMPONENT
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
// IMPORT 404 PAGE
import PageNotFound from "./pages/PageNotFound/PageNotFound";

function AppContent() {
  const {
    isLoggedIn,
    isAuthContextLoading,
  } = useAuthContext();

  if (isAuthContextLoading) {
    return <PageSpinner />; 
  }

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SplashPage/>}/>
        <Route path="/login" element={<LogInPage/>}/>
        <Route path="/signup" element={<SignUpPage/>}/>
        <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <HomeDashboard/>
          </ProtectedRoute>
        }/>
        
        <Route path="/account" element={
          <ProtectedRoute>
            <AccountPage/>
          </ProtectedRoute>
        }/>
        
        {/* Nested protected routes for exercises */}
        <Route path="/exerciseDashboard/:exId" element={
          <ProtectedRoute>
            <ExerciseLayout />
          </ProtectedRoute>
        }>
          <Route index element={<ExerciseDashboard />} />
          <Route path="upload" element={<FileUploadPage />} />
          <Route path="confirmImage" element={<ConfirmImage />} />
          {/* NEW ROUTES FOR INSERT FUNCTIONALITY */}
          <Route path="insertCode" element={<InsertCodePage />} />
          <Route path="uploadInsert" element={<FileUploadInsertPage />} />
          <Route path="confirmImageInsert" element={<ConfirmImageInsertPage />} />
        </Route>
        
        {/* Legacy protected routes for backward compatibility */}
        <Route path="/confirmImage" element={
          <ProtectedRoute>
            <ConfirmImage />
          </ProtectedRoute>
        }/>
        
        <Route path="/codeViewer" element={
          <ProtectedRoute>
            <CodeTabContent />
          </ProtectedRoute>
        }/>
        
        {/* 404 Route - MUST BE LAST */}
        <Route path="*" element={<PageNotFound />} />
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