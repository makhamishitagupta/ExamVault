import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Papers from './pages/Papers';
import Notes from './pages/Notes';
import ViewPaper from './pages/ViewPaper';
// import Discussions from './pages/Discussions';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHome from './pages/admin/AdminHome';
import UploadPaper from './pages/admin/UploadPaper';
import UploadNote from './pages/admin/UploadNote';
import ManagePapers from './pages/admin/ManagePapers';
import EditPaper from './pages/admin/EditPaper';
import ManageNotes from './pages/admin/ManageNotes';
import EditNote from './pages/admin/EditNote';
import ManageSubjects from './pages/admin/ManageSubjects';
import CreateSubject from './pages/admin/CreateSubject';
import EditSubject from './pages/admin/EditSubject';
import Announcements from './pages/admin/Announcements';
import Analytics from './pages/admin/Analytics';
// import CreateAdmin from './pages/admin/CreateAdmin';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && !isAuthRoute && <Navbar />}
      <main className="grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public browsing */}
          <Route path="/" element={<Home />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/paper/:id" element={<ViewPaper />} />
          <Route path="/notes/:id" element={<ViewPaper />} />
          {/* <Route
            path="/discussions"
            element={
              <ProtectedRoute requiredRole="student">
                <Discussions />
              </ProtectedRoute>
            }
          /> */}

          {/* Student protected (identity required) */}
          <Route
            path="/favorites"
            element={
              <ProtectedRoute requiredRole="student">
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="upload-paper" element={<UploadPaper />} />
            <Route path="upload-note" element={<UploadNote />} />
            <Route path="manage-papers" element={<ManagePapers />} />
            <Route path="edit-paper/:id" element={<EditPaper />} />
            <Route path="manage-notes" element={<ManageNotes />} />
            <Route path="edit-note/:id" element={<EditNote />} />
            <Route path="manage-subjects" element={<ManageSubjects />} />
            <Route path="subjects/create" element={<CreateSubject />} />
            <Route path="subjects/edit/:id" element={<EditSubject />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="analytics" element={<Analytics />} />
            {/* <Route path="create-admin" element={<CreateAdmin />} /> */}
          </Route>
        </Routes>
      </main>
      {!isAdminRoute && !isAuthRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
