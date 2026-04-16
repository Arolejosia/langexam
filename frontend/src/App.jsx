import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ExamsPage from "./pages/ExamsPage";
import QuestionsPage from "./pages/QuestionsPage";
import ResultPage from "./pages/ResultPage";
import ProtectedRoute from "./components/ProtectedRoute";
import HistoryPage from "./pages/HistoryPage";
import CoursesPage from "./pages/CoursesPage";
import CoursePage from "./pages/CoursePage";
import AdminPage from "./pages/AdminPage";
import BecomeInstructorPage from "./pages/BecomeInstructorPage";
import CreateCoursePage from "./pages/CreateCoursePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/exams" element={
          <ProtectedRoute><ExamsPage /></ProtectedRoute>
        } />
        <Route path="/exam/:examId" element={
          <ProtectedRoute><QuestionsPage /></ProtectedRoute>
        } />
        <Route path="/result" element={
          <ProtectedRoute><ResultPage /></ProtectedRoute>
        } />
        <Route path="/history" element={
  <ProtectedRoute><HistoryPage /></ProtectedRoute>
} />
        <Route path="/courses" element={
          <ProtectedRoute><CoursesPage /></ProtectedRoute>
        } />
       <Route path="/courses/:courseId" element={
  <ProtectedRoute><CoursePage /></ProtectedRoute>
} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/admin" element={
  <ProtectedRoute><AdminPage /></ProtectedRoute>
} />
<Route path="/become-instructor" element={
  <ProtectedRoute><BecomeInstructorPage /></ProtectedRoute>
} />
<Route path="/create-course" element={
  <ProtectedRoute><CreateCoursePage /></ProtectedRoute>
} />
      </Routes>
      
    </BrowserRouter>
  );
}