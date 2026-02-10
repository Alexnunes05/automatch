import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../services/supabase';
import AccessRestricted from '../pages/AccessRestricted';

const ProtectedRoute = ({ allowedRoles }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                setUser(session.user);
                // Fetch user profile to get role & subscription
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, subscription_status, status') // Added status
                    .eq('id', session.user.id)
                    .single();

                setRole(profile?.role || 'expert');
                setSubscriptionStatus(profile?.subscription_status || 'inactive');

                // Redirect if not approved (and not on the restricted page already to avoid loops)
                if (profile?.status && profile.status !== 'approved') {
                    // We can't navigate here easily inside useEffect without causing issues, 
                    // so we save it to state and handle it in render.
                    setUser({ ...session.user, status: profile.status });
                }
            }

            setLoading(false);
        };

        checkUser();
    }, []);

    if (loading) {
        return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading authentication...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <div className="container" style={{ paddingTop: '100px' }}>Access Denied. You do not have permission to view this page.</div>;
    }

    // Check Account Status
    if (user.status && user.status !== 'approved') {
        // If we are wrapping a route, we redirect. 
        // Note: AccessRestricted itself shouldn't be protected by this check if possible, 
        // but ProtectedRoute is usually for dashboard.
        return <AccessRestricted status={user.status} />;
    }

    // Check subscription for experts accessing dashboard
    if (role === 'expert' && subscriptionStatus !== 'active' && window.location.pathname.includes('/dashboard')) {
        return <Navigate to="/subscription" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
