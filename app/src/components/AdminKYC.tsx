import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { UserInfo } from '../context/AppContext';

// Mock KYC verification data
interface KYCVerification {
  id: string;
  userId: string;
  fullName: string;
  contact: string;
  country: string;
  dateOfBirth: string;
  idType: string;
  idNumber: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    idDocument: string;
    selfie: string;
  };
  notes?: string;
}

const mockKYCVerifications: KYCVerification[] = [
  {
    id: 'kyc-001',
    userId: 'user-001',
    fullName: 'John Smith',
    contact: 'john.smith@example.com',
    country: 'US',
    dateOfBirth: '1985-06-15',
    idType: 'passport',
    idNumber: 'P12345678',
    submittedAt: '2023-11-15T10:30:00Z',
    status: 'pending',
    documents: {
      idDocument: '/mock-images/id-document-1.jpg',
      selfie: '/mock-images/selfie-1.jpg',
    }
  },
  {
    id: 'kyc-002',
    userId: 'user-002',
    fullName: 'Maria Garcia',
    contact: 'maria.garcia@example.com',
    country: 'ES',
    dateOfBirth: '1990-03-22',
    idType: 'nationalId',
    idNumber: 'N98765432',
    submittedAt: '2023-11-14T15:45:00Z',
    status: 'pending',
    documents: {
      idDocument: '/mock-images/id-document-2.jpg',
      selfie: '/mock-images/selfie-2.jpg',
    }
  },
  {
    id: 'kyc-003',
    userId: 'user-003',
    fullName: 'Robert Johnson',
    contact: 'robert.johnson@example.com',
    country: 'GB',
    dateOfBirth: '1978-11-30',
    idType: 'drivingLicense',
    idNumber: 'D67890123',
    submittedAt: '2023-11-13T09:15:00Z',
    status: 'approved',
    documents: {
      idDocument: '/mock-images/id-document-3.jpg',
      selfie: '/mock-images/selfie-3.jpg',
    },
    notes: 'All documents verified successfully.'
  },
  {
    id: 'kyc-004',
    userId: 'user-004',
    fullName: 'Aisha Khan',
    contact: 'aisha.khan@example.com',
    country: 'SG',
    dateOfBirth: '1992-08-18',
    idType: 'passport',
    idNumber: 'P87654321',
    submittedAt: '2023-11-12T13:20:00Z',
    status: 'rejected',
    documents: {
      idDocument: '/mock-images/id-document-4.jpg',
      selfie: '/mock-images/selfie-4.jpg',
    },
    notes: 'ID document appears to be modified. Please resubmit with a valid document.'
  }
];

const AdminKYC: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, kycVerifications, approveKyc, rejectKyc } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<UserInfo | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Check if logged in and redirect if not
  useEffect(() => {
    console.log("AdminKYC mounted, isLoggedIn:", isLoggedIn);
    console.log("KYC Verifications:", kycVerifications);
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate, kycVerifications]);

  // Filter verifications based on status and search term
  const filteredVerifications = kycVerifications.filter(verification => {
    // Filter by status
    if (filter !== 'all' && verification.kycStatus !== filter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        verification.email.toLowerCase().includes(searchLower) ||
        (verification.name && verification.name.toLowerCase().includes(searchLower)) ||
        (verification.phone && verification.phone.toLowerCase().includes(searchLower)) ||
        (verification.kycDocuments?.idNumber && verification.kycDocuments.idNumber.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  const handleViewDetails = (verification: UserInfo) => {
    setSelectedVerification(verification);
    setAdminNotes('');
    setShowModal(true);
  };

  const handleApprove = () => {
    if (!selectedVerification) return;
    
    setLoading(true);
    
    // Call the approveKyc function from context
    approveKyc(selectedVerification.email);
    
    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      setShowModal(false);
      setSelectedVerification(null);
    }, 1000);
  };

  const handleReject = () => {
    if (!selectedVerification) return;
    
    setLoading(true);
    
    // Call the rejectKyc function from context
    rejectKyc(selectedVerification.email);
    
    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      setShowModal(false);
      setSelectedVerification(null);
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Rejected</span>;
      default:
        return null;
    }
  };

  // If no KYC verifications, show a message
  if (kycVerifications.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">KYC Verification Management</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-center py-8">No KYC verification requests found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">KYC Verification Management</h1>
      
      {/* Filters and search */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-md ${
                filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1 rounded-md ${
                filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 py-1 rounded-md ${
                filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200'
              }`}
            >
              Rejected
            </button>
          </div>
          
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search by name, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
      
      {/* Verifications table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVerifications.map((verification, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-0">
                        <div className="text-sm font-medium text-gray-900">
                          {verification.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {verification.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {verification.country}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {verification.kycDocuments?.idType || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {verification.kycDocuments?.idNumber || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {verification.kycSubmissionDate || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(verification.kycStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(verification)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Review
                    </button>
                    {verification.kycStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedVerification(verification);
                            handleApprove();
                          }}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVerification(verification);
                            handleReject();
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Verification detail modal */}
      {showModal && selectedVerification && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-800">
                  KYC Verification Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-700 mb-2">User Information</h3>
                  <p><span className="font-medium">Name:</span> {selectedVerification.name || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {selectedVerification.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedVerification.phone || 'N/A'}</p>
                  <p><span className="font-medium">Country:</span> {selectedVerification.country}</p>
                  <p><span className="font-medium">Submission Date:</span> {selectedVerification.kycSubmissionDate || 'N/A'}</p>
                  <p><span className="font-medium">Status:</span> {getStatusBadge(selectedVerification.kycStatus)}</p>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-700 mb-2">ID Information</h3>
                  <p><span className="font-medium">ID Type:</span> {selectedVerification.kycDocuments?.idType || 'N/A'}</p>
                  <p><span className="font-medium">ID Number:</span> {selectedVerification.kycDocuments?.idNumber || 'N/A'}</p>
                  <p><span className="font-medium">Expiry Date:</span> {selectedVerification.kycDocuments?.idExpiry || 'N/A'}</p>
                  
                  <div className="mt-4">
                    <h3 className="font-bold text-gray-700 mb-2">Document Images</h3>
                    <div className="p-8 bg-gray-100 rounded text-center">
                      <p className="text-gray-500">Mock Document Image</p>
                      <p className="text-xs text-gray-400 mt-2">
                        (In a real application, ID images would be shown here)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-bold text-gray-700 mb-2">Admin Notes</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this verification"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-24 resize-none"
                  disabled={selectedVerification.kycStatus !== 'pending'}
                />
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                >
                  Close
                </button>
                
                {selectedVerification.kycStatus === 'pending' && (
                  <>
                    <button
                      onClick={handleReject}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-red-300"
                    >
                      {loading ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-green-300"
                    >
                      {loading ? 'Processing...' : 'Approve'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKYC; 