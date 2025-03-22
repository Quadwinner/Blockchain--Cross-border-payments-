import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { UserInfo } from '../context/AppContext';

const Login: React.FC = () => {
  const [phoneOrEmail, setPhoneOrEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const { setIsLoggedIn, setUserPhoneOrEmail, setUser, kycVerifications, setKycVerifications, wallet } = useAppContext();

  // Check if already logged in
  useEffect(() => {
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    const storedUser = localStorage.getItem('user');
    
    if (storedLoginStatus === 'true' && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setUserPhoneOrEmail(parsedUser.email || parsedUser.phone);
        setUser(parsedUser);
        navigate('/dashboard');
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
      }
    }
  }, [navigate, setIsLoggedIn, setUser, setUserPhoneOrEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Validate input
    if (!phoneOrEmail.trim()) {
      setError("Please enter your email or phone number");
      setIsLoading(false);
      return;
    }
    
    if (!password.trim()) {
      setError("Please enter your password");
      setIsLoading(false);
      return;
    }
    
    try {
      // For demo purposes, any password works, but phoneOrEmail must be provided
      // Check if user exists in KYC verifications
      let userData: UserInfo | undefined = kycVerifications.find(
        user => user.email === phoneOrEmail || user.phone === phoneOrEmail
      );
      
      console.log("Login attempt for:", phoneOrEmail);
      console.log("Found user in verifications:", userData ? "Yes" : "No");
      
      if (!userData) {
        // Create a new user if not found
        userData = {
          email: phoneOrEmail.includes('@') ? phoneOrEmail : '',
          phone: phoneOrEmail.includes('@') ? undefined : phoneOrEmail,
          country: 'United States', // Default value
          kycVerified: false,
          kycStatus: 'pending',
          walletBalance: 0,
          preferredCurrency: 'USD'
        };
        
        // Add to kycVerifications
        setKycVerifications([...kycVerifications, userData]);
        console.log("Created new user:", userData);
      }
      
      // Set login state
      setIsLoggedIn(true);
      setUserPhoneOrEmail(phoneOrEmail);
      setUser(userData);
      
      // Store user data in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userPhoneOrEmail', phoneOrEmail);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log("Successfully logged in user:", userData.email || userData.phone);
      
      // Connect wallet if not connected
      if (!wallet.wallet.connected) {
        try {
          await wallet.connectWallet();
        } catch (error) {
          console.error("Failed to connect wallet during login:", error);
          // Continue with login even if wallet connection fails
        }
      }
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to log in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="m-auto bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">Log In to Your Account</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="phoneOrEmail" className="block text-gray-700 font-bold mb-2">
              Email or Phone
            </label>
            <input
              type="text"
              id="phoneOrEmail"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your email or phone"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your password"
              required
            />
            <p className="text-xs text-gray-500">
              For demo purposes, any password will work.
            </p>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-500 hover:text-blue-800">
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 