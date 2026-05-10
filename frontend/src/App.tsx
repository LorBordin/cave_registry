import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import CaveList from './pages/CaveList';
import CaveMap from './pages/CaveMap';
import CaveDetail from './pages/CaveDetail';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CaveForm from './pages/CaveForm';
import ProtectedRoute from './components/ProtectedRoute';

const Layout = () => {
  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/caves" element={<CaveList />} />
          <Route path="/caves/:id" element={<CaveDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/map" element={<CaveMap />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/caves/new" element={<CaveForm />} />
            <Route path="/dashboard/caves/:id/edit" element={<CaveForm />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
