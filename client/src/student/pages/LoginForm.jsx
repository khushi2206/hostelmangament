// LoginForm is now handled by auth/Login.jsx (unified admin + student login).
// This shim redirects to /login for backward compatibility.
import { Navigate } from 'react-router-dom';
export default function LoginForm() {
  return <Navigate to="/login" replace />;
}
