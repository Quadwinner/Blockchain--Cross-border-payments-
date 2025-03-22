import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext, UserInfo } from '../context/AppContext';

const VerifyKYC: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, setUser, kycVerifications, setKycVerifications } = useAppContext();
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('US');
  const [idType, setIdType] = useState('passport');
  const [idNumber, setIdNumber] = useState('');
  const [idExpiry, setIdExpiry] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Check if user is logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    // Pre-fill form if user data exists
    if (user) {
      setFullName(user.name || '');
      setPhone(user.phone || '');
      setCountry(user.country || 'US');
      
      // Check if user has already submitted KYC
      if (user.kycStatus !== 'pending' && user.kycSubmissionDate) {
        setSuccess(true);
      }
    }
  }, [isLoggedIn, user, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('User information not found. Please log in again.');
      }
      
      if (!frontImage) {
        throw new Error('Please upload the front of your ID document.');
      }
      
      // Create KYC submission data
      const now = new Date().toISOString();
      const updatedUser: UserInfo = {
        ...user,
        name: fullName,
        phone,
        country,
        kycStatus: 'pending',
        kycVerified: false,
        kycSubmissionDate: now,
        kycDocuments: {
          idType,
          idNumber,
          idExpiry,
        }
      };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user in context
      setUser(updatedUser);
      
      // Add to verifications list if not already there
      const existingIndex = kycVerifications.findIndex(v => v.email === user.email);
      if (existingIndex >= 0) {
        // Update existing verification
        const updatedVerifications = [...kycVerifications];
        updatedVerifications[existingIndex] = updatedUser;
        setKycVerifications(updatedVerifications);
      } else {
        // Add new verification
        setKycVerifications([...kycVerifications, updatedUser]);
      }
      
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit KYC verification');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };
  
  if (success) {
    return (
      <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">KYC Verification Submitted</h2>
          <p className="text-gray-600">
            {user?.kycStatus === 'approved' 
              ? 'Your KYC verification has been approved!' 
              : user?.kycStatus === 'rejected'
              ? 'Your KYC verification was rejected. Please resubmit with correct information.'
              : 'Your KYC verification is being processed. We will notify you once it\'s approved.'}
          </p>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-md text-blue-800 mb-6">
          <p className="font-medium">Verification Status: {user?.kycStatus ? user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1) : 'Unknown'}</p>
          <p className="text-sm mt-1">Submitted on: {new Date(user?.kycSubmissionDate || '').toLocaleString()}</p>
        </div>
        
        {user?.kycStatus === 'rejected' && (
          <button
            onClick={() => setSuccess(false)}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium"
          >
            Resubmit KYC Information
          </button>
        )}
        
        <button
          onClick={() => navigate('/')}
          className={`w-full py-2 px-4 mt-4 ${user?.kycStatus === 'rejected' ? 'bg-gray-300 hover:bg-gray-400 text-gray-800' : 'bg-blue-600 hover:bg-blue-700 text-white'} rounded-md font-medium`}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">KYC Verification</h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-md">
        <h3 className="font-bold text-blue-800 mb-2">Why Verify?</h3>
        <p className="text-blue-800 text-sm">
          KYC verification is required to comply with financial regulations and to ensure secure cross-border payments. 
          Your identity information will be protected and used only for verification purposes.
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-gray-700 mb-2">
                Full Name (as on ID)
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
                required
                disabled={loading}
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
                Country of Residence
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">ID Verification</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="idType" className="block text-gray-700 mb-2">
                ID Type
              </label>
              <select
                id="idType"
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="passport">Passport</option>
                <option value="drivingLicense">Driving License</option>
                <option value="nationalId">National ID Card</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="idNumber" className="block text-gray-700 mb-2">
                ID Number
              </label>
              <input
                type="text"
                id="idNumber"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your ID number"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="idExpiry" className="block text-gray-700 mb-2">
                ID Expiry Date
              </label>
              <input
                type="date"
                id="idExpiry"
                value={idExpiry}
                onChange={(e) => setIdExpiry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Upload Documents</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">
                Front of ID Document
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {frontImage ? (
                  <div className="text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <p>{frontImage.name}</p>
                    <button
                      type="button"
                      onClick={() => setFrontImage(null)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 mb-2">Click or drag file to upload</p>
                    <input
                      type="file"
                      onChange={handleFileChange(setFrontImage)}
                      className="hidden"
                      id="frontImage"
                      accept="image/*"
                      disabled={loading}
                    />
                    <label
                      htmlFor="frontImage"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
                    >
                      Select File
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">
                Back of ID Document
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {backImage ? (
                  <div className="text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <p>{backImage.name}</p>
                    <button
                      type="button"
                      onClick={() => setBackImage(null)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 mb-2">Click or drag file to upload</p>
                    <input
                      type="file"
                      onChange={handleFileChange(setBackImage)}
                      className="hidden"
                      id="backImage"
                      accept="image/*"
                      disabled={loading}
                    />
                    <label
                      htmlFor="backImage"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
                    >
                      Select File
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">
                Selfie with ID
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {selfieImage ? (
                  <div className="text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <p>{selfieImage.name}</p>
                    <button
                      type="button"
                      onClick={() => setSelfieImage(null)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-gray-500 mb-2">Take a selfie holding your ID clearly visible</p>
                    <input
                      type="file"
                      onChange={handleFileChange(setSelfieImage)}
                      className="hidden"
                      id="selfieImage"
                      accept="image/*"
                      disabled={loading}
                    />
                    <label
                      htmlFor="selfieImage"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
                    >
                      Select File
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-4 p-4 bg-yellow-50 rounded-md">
          <p className="text-yellow-800 text-sm">
            By submitting this form, you confirm that all information provided is accurate and authentic. 
            Providing false information may result in account suspension.
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md text-white font-medium ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit KYC Verification'}
        </button>
      </form>
    </div>
  );
};

export default VerifyKYC; 