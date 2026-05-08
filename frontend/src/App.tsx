import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import CaveList from './pages/CaveList';
import CaveMap from './pages/CaveMap';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CaveForm from './pages/CaveForm';
import ProtectedRoute from './components/ProtectedRoute';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/caves/new" element={<CaveForm />} />
            <Route path="/dashboard/caves/:id/edit" element={<CaveForm />} />
          </Route>
        </Route>
        <Route path="/map" element={<CaveMap />} />
      </Routes>
    </Router>
  );
}

export default App;
