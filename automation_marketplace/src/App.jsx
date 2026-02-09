import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import ClientRequest from './pages/ClientRequest';
import Login from './pages/Login';
import Pricing from './pages/Pricing';
import Register from './pages/Register';
import ExpertProfile from './pages/ExpertProfile';
import ProjectShowcase from './pages/ProjectShowcase';
import ExpertDashboard from './pages/ExpertDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TemplateMarketplace from './pages/TemplateMarketplace';
import TemplateDetails from './pages/TemplateDetails';
import ProtectedRoute from './components/ProtectedRoute';

import SubscriptionPlan from './pages/SubscriptionPlan';
import SuccessPayment from './pages/SuccessPayment';

import MetaPixel from './components/MetaPixel';

function App() {
    return (
        <Router>
            <MetaPixel />
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/request" element={<ClientRequest />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/projects" element={<ProjectShowcase />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/subscription" element={<SubscriptionPlan />} />
                    <Route path="/success" element={<SuccessPayment />} />

                    <Route element={<ProtectedRoute allowedRoles={['expert', 'admin']} />}>
                        <Route path="/dashboard" element={<ExpertDashboard />} />
                    </Route>

                    <Route path="/expert/:id" element={<ExpertProfile />} />

                    <Route path="/templates" element={<TemplateMarketplace />} />
                    <Route path="/templates/:id" element={<TemplateDetails />} />

                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Route>
                    <Route path="*" element={<Landing />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
