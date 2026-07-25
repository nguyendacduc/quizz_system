import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import Statistics from './pages/admin/Statistics';
import SystemManagement from './pages/admin/SystemManagement';
import QuestionsManagement from './pages/common/QuestionsManagement';
import ExamsManagement from './pages/common/ExamsManagement';
import RoomsManagement from './pages/common/RoomsManagement';
import UserProfile from './pages/common/UserProfile';
import Notifications from './pages/common/Notifications';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import RoomLobby from './pages/teacher/RoomLobby';
import RoomMonitor from './pages/teacher/RoomMonitor';
import RoomScoreboard from './pages/teacher/RoomScoreboard';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentLobby from './pages/student/StudentLobby';
import StudentExam from './pages/student/StudentExam';
import StudentResult from './pages/student/StudentResult';
import StudentHistory from './pages/student/StudentHistory';
const HomeRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="auth-loading">
                <div className="spinner"></div>
                <p>Đang tải trang chủ...</p>
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    if (user.role_code === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role_code === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
    if (user.role_code === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/login" replace />;
};
function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    { }
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<HomeRedirect />} />
                    { }
                    <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                        <Route path="/student/exam/:attemptId" element={<StudentExam />} />
                    </Route>
                    { }
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                        <Route element={<MainLayout />}>
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/admin/users" element={<UserManagement />} />
                            <Route path="/admin/questions" element={<QuestionsManagement />} />
                            <Route path="/admin/exams" element={<ExamsManagement />} />
                            <Route path="/admin/rooms" element={<RoomsManagement />} />
                            <Route path="/admin/rooms/:roomId/lobby" element={<RoomLobby />} />
                            <Route path="/admin/rooms/:roomId/monitor" element={<RoomMonitor />} />
                            <Route path="/admin/rooms/:roomId/scoreboard" element={<RoomScoreboard />} />
                            <Route path="/admin/statistics" element={<Statistics />} />
                            <Route path="/admin/notifications" element={<Notifications />} />
                            <Route path="/admin/system" element={<SystemManagement />} />
                        </Route>
                    </Route>
                    { }
                    <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
                        <Route element={<MainLayout />}>
                            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                            <Route path="/teacher/questions" element={<QuestionsManagement />} />
                            <Route path="/teacher/exams" element={<ExamsManagement />} />
                            <Route path="/teacher/rooms" element={<RoomsManagement />} />
                            <Route path="/teacher/rooms/:roomId/lobby" element={<RoomLobby />} />
                            <Route path="/teacher/rooms/:roomId/monitor" element={<RoomMonitor />} />
                            <Route path="/teacher/rooms/:roomId/scoreboard" element={<RoomScoreboard />} />
                            <Route path="/teacher/notifications" element={<Notifications />} />
                            <Route path="/teacher/profile" element={<UserProfile />} />
                        </Route>
                    </Route>
                    { }
                    <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                        <Route element={<MainLayout />}>
                            <Route path="/student/dashboard" element={<StudentDashboard />} />
                            <Route path="/student/lobby/:roomId" element={<StudentLobby />} />
                            <Route path="/student/history" element={<StudentHistory />} />
                            <Route path="/student/results/:attemptId" element={<StudentResult />} />
                            <Route path="/student/notifications" element={<Notifications />} />
                            <Route path="/student/profile" element={<UserProfile />} />
                        </Route>
                    </Route>
                    { }
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
export default App;