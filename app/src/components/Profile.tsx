import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext, UserInfo } from '../context/AppContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, setUser } = useAppContext();
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('US');
  const [currency, setCurrency] = useState('USD');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is logged in
  useEffect(() => {
    if (!isLoggedIn) {
      // Check localStorage as a fallback
      const storedLoginStatus = localStorage.getItem('isLoggedIn');
      const storedUser = localStorage.getItem('user');
      
      if (storedLoginStatus === 'true' && storedUser) {
        try {
          // Found user data in localStorage, use it
          const parsedUser = JSON.parse(storedUser);
          console.log("Restored user from localStorage for Profile:", parsedUser);
          
          // Set form fields
          setFullName(parsedUser.name || '');
          setEmail(parsedUser.email);
          setPhone(parsedUser.phone || '');
          setCountry(parsedUser.country);
          setCurrency(parsedUser.preferredCurrency || 'USD');
          setBio(parsedUser.bio || '');
          
          // Update context (if this works, the component will re-render)
          setUser(parsedUser);
          return;
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Continue to login redirect
        }
      }
      
      navigate('/login');
      return;
    }
    
    // Check if user data exists
    if (!user) {
      // Check localStorage as a fallback
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          // Found user data in localStorage, use it
          const parsedUser = JSON.parse(storedUser);
          console.log("Restored user from localStorage for Profile:", parsedUser);
          
          // Set form fields
          setFullName(parsedUser.name || '');
          setEmail(parsedUser.email);
          setPhone(parsedUser.phone || '');
          setCountry(parsedUser.country);
          setCurrency(parsedUser.preferredCurrency || 'USD');
          setBio(parsedUser.bio || '');
          
          // Update context
          setUser(parsedUser);
          return;
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          setError('User information could not be loaded. Please log in again.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }
      } else {
        setError('User information not found. Please log in again.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }
    }
    
    // Pre-fill form if user data exists
    setFullName(user.name || '');
    setEmail(user.email);
    setPhone(user.phone || '');
    setCountry(user.country);
    setCurrency(user.preferredCurrency || 'USD');
    setBio(user.bio || '');
  }, [isLoggedIn, user, navigate, setUser]);
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('User information not found. Please log in again.');
      }
      
      // Create updated user profile
      const updatedUser: UserInfo = {
        ...user,
        name: fullName,
        email: email, // Note: email should typically not be changeable without verification
        phone,
        country,
        preferredCurrency: currency,
        bio
      };
      
      // In a real app, you would upload the avatar to a storage service
      if (avatar) {
        // Simulate avatar upload
        await new Promise(resolve => setTimeout(resolve, 500));
        updatedUser.avatarUrl = avatarPreview || user.avatarUrl;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user in context
      setUser(updatedUser);
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  // KYC status badge
  const getKycBadge = () => {
    if (!user) return null;
    
    switch (user.kycStatus) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Verified</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Not Submitted</span>;
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Your Profile</h2>
      
      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          Profile updated successfully!
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile preview" className="w-full h-full object-cover" />
              ) : user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <label htmlFor="avatar" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="file"
                id="avatar"
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
              />
            </label>
          </div>
        </div>
        
        <div className="flex-grow text-center md:text-left">
          <h3 className="text-xl font-bold text-gray-800">{user?.name || email}</h3>
          <p className="text-gray-600">{user?.email}</p>
          <div className="mt-2 flex justify-center md:justify-start items-center gap-2">
            {getKycBadge()}
            {user?.kycStatus !== 'approved' && (
              <button
                onClick={() => navigate('/verify-kyc')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {user?.kycStatus === 'pending' ? 'Check Status' : 'Complete Verification'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                placeholder="Enter your email"
                disabled={true} // Email should typically not be changeable without verification
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your phone number"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="country" className="block text-gray-700 mb-2">
                Country
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="IN">India</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="JP">Japan</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
                <option value="IT">Italy</option>
                <option value="BR">Brazil</option>
                <option value="MX">Mexico</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="currency" className="block text-gray-700 mb-2">
                Preferred Currency
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
                <option value="INR">Indian Rupee (INR)</option>
                <option value="JPY">Japanese Yen (JPY)</option>
                <option value="CAD">Canadian Dollar (CAD)</option>
                <option value="AUD">Australian Dollar (AUD)</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about yourself"
                rows={4}
                disabled={loading}
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`py-2 px-6 rounded-md text-white font-medium ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile; 