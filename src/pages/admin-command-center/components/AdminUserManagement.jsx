import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/api';
import ConfirmationModal from '../../../components/ConfirmationModal';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AdminUserManagement = () => {
    const [showNewAdminForm, setShowNewAdminForm] = useState(false);
    const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isSuperuser, setIsSuperuser] = useState(false);

    // New admin form state
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Change password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newCurrentPassword, setNewCurrentPassword] = useState('');
    const [confirmCurrentPassword, setConfirmCurrentPassword] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const getAdminToken = () => sessionStorage.getItem('admin_token') || localStorage.getItem('adminToken') || localStorage.getItem('admin_token');

    // Load current user info and check if superuser. Try sessionStorage/localStorage first, otherwise verify token with backend.
    useEffect(() => {
        const loadCurrentAdmin = async () => {
            const adminInfoRaw = sessionStorage.getItem('admin_info') || localStorage.getItem('admin_info');
            if (adminInfoRaw) {
                try {
                    const user = JSON.parse(adminInfoRaw);
                    setCurrentUser(user);
                    setIsSuperuser(user.username === 'admin');
                    return;
                } catch (e) {
                    // continue to verify
                }
            }

            // If no stored admin info, try to verify token
            const token = getAdminToken();
            if (!token) {
                setCurrentUser(null);
                setIsSuperuser(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/admin/auth/verify`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // endpoint returns admin info either as { admin: {...} } or the admin object; handle both
                    const adminObj = data?.admin || data;
                    const user = typeof adminObj === 'object' ? adminObj : null;
                    if (user) {
                        setCurrentUser(user);
                        setIsSuperuser(user.username === 'admin');
                        // persist for quicker reads
                        try { sessionStorage.setItem('admin_info', JSON.stringify(user)); } catch (e) { }
                        try { localStorage.setItem('admin_info', JSON.stringify(user)); } catch (e) { }
                    }
                } else {
                    setCurrentUser(null);
                    setIsSuperuser(false);
                }
            } catch (err) {
                console.error('Error verifying admin token:', err);
                setCurrentUser(null);
                setIsSuperuser(false);
            }
        };

        loadCurrentAdmin();
    }, []);

    // Load users list (only for superuser)
    useEffect(() => {
        if (isSuperuser) {
            loadUsers();
        }
    }, [isSuperuser]);

    const loadUsers = async () => {
        try {
            const token = getAdminToken();
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data.admins || []);
            }
        } catch (err) {
            console.error('Error loading users:', err);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const token = getAdminToken();
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username: newUsername, password: newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('New admin user created successfully');
                setNewUsername('');
                setNewPassword('');
                setConfirmPassword('');
                setShowNewAdminForm(false);
                loadUsers(); // Refresh users list
            } else {
                setError(data.message || 'Failed to create admin user');
            }
        } catch (err) {
            setError('An error occurred while creating admin user');
            console.error('Create admin error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (newCurrentPassword !== confirmCurrentPassword) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        if (isSuperuser && !selectedUserId) {
            setError('Please select a user to change password');
            setLoading(false);
            return;
        }

        try {
            const token = getAdminToken();
            const userId = selectedUserId || currentUser?.id;
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    password: newCurrentPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Password changed successfully');
                setCurrentPassword('');
                setNewCurrentPassword('');
                setConfirmCurrentPassword('');
                setShowChangePasswordForm(false);
            } else {
                setError(data.message || 'Failed to change password');
            }
        } catch (err) {
            setError('An error occurred while changing password');
            console.error('Change password error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUserClick = (userId, username) => {
        if (username === 'admin') {
            setError('Cannot delete the superuser admin account');
            return;
        }

        setUserToDelete({ id: userId, username });
        setShowDeleteModal(true);
        setError('');
        setSuccess('');
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = getAdminToken();
            const response = await fetch(`${API_BASE_URL}/admin/users/${userToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(`User "${userToDelete.username}" deleted successfully`);
                loadUsers(); // Refresh users list
                setShowDeleteModal(false);
                setUserToDelete(null);
            } else {
                setError(data.message || 'Failed to delete user');
            }
        } catch (err) {
            setError('An error occurred while deleting user');
            console.error('Delete user error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setUserToDelete(null);
    };

    return (
        <div className="space-y-6 p-6 bg-white rounded-lg shadow">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-cosmic-depth">Admin User Management</h2>
                
                {/* Action Buttons - Below Title */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    {isSuperuser && (
                        <Button
                            onClick={() => {
                                setShowNewAdminForm(!showNewAdminForm);
                                setShowChangePasswordForm(false);
                                setError('');
                                setSuccess('');
                            }}
                            variant={showNewAdminForm ? "outline" : "default"}
                            size="md"
                            iconName={showNewAdminForm ? "X" : "UserPlus"}
                            iconPosition="left"
                            className={`${
                                showNewAdminForm 
                                    ? "border-red-300 text-red-600 hover:bg-red-50" 
                                    : "bg-stellar-gold text-cosmic-depth hover:bg-stellar-gold/90 stellar-glow"
                            } transition-all duration-300 w-full sm:w-auto`}
                        >
                            {showNewAdminForm ? 'Cancel' : 'Add New Admin'}
                        </Button>
                    )}
                    <Button
                        onClick={() => {
                            setShowChangePasswordForm(!showChangePasswordForm);
                            setShowNewAdminForm(false);
                            setError('');
                            setSuccess('');
                        }}
                        variant={showChangePasswordForm ? "outline" : "outline"}
                        size="md"
                        iconName={showChangePasswordForm ? "X" : "Key"}
                        iconPosition="left"
                        className={`${
                            showChangePasswordForm 
                                ? "border-red-300 text-red-600 hover:bg-red-50" 
                                : "border-cosmic-depth text-cosmic-depth hover:bg-cosmic-depth hover:text-white"
                        } transition-all duration-300 w-full sm:w-auto`}
                    >
                        {showChangePasswordForm ? 'Cancel' : 'Change Password'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                    {success}
                </div>
            )}

            {/* Users List - Only for superuser */}
            {isSuperuser && users.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Admin Users</h3>
                    <div className="space-y-2">
                        {users.map((user) => (
                            <div key={user._id} className="flex justify-between items-center bg-white p-3 rounded-lg border">
                                <div>
                                    <span className="font-medium text-gray-800">{user.username}</span>
                                    {user.username === 'admin' && (
                                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            Superuser
                                        </span>
                                    )}
                                </div>
                                {user.username !== 'admin' && (
                                    <Button
                                        onClick={() => handleDeleteUserClick(user._id, user.username)}
                                        disabled={loading}
                                        variant="outline"
                                        size="sm"
                                        iconName="Trash2"
                                        iconPosition="left"
                                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-300"
                                    >
                                        Delete
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showNewAdminForm && isSuperuser && (
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Admin Username
                        </label>
                        <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cosmic-accent focus:border-transparent"
                            required
                            minLength={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cosmic-accent focus:border-transparent"
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cosmic-accent focus:border-transparent"
                            required
                            minLength={6}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        variant="default"
                        size="lg"
                        iconName={loading ? "Loader2" : "UserCheck"}
                        iconPosition="left"
                        className="w-full bg-cosmic-depth hover:bg-cosmic-depth/90 transition-all duration-300"
                    >
                        {loading ? 'Creating...' : 'Create Admin User'}
                    </Button>
                </form>
            )}

            {showChangePasswordForm && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                    {isSuperuser && users.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select User to Change Password
                            </label>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cosmic-accent focus:border-transparent"
                            >
                                <option value="">Select a user...</option>
                                {users.map((user) => (
                                    <option key={user._id} value={user._id}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {!isSuperuser && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cosmic-accent focus:border-transparent"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newCurrentPassword}
                            onChange={(e) => setNewCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cosmic-accent focus:border-transparent"
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmCurrentPassword}
                            onChange={(e) => setConfirmCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cosmic-accent focus:border-transparent"
                            required
                            minLength={6}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        variant="default"
                        size="lg"
                        iconName={loading ? "Loader2" : "Shield"}
                        iconPosition="left"
                        className="w-full bg-cosmic-depth hover:bg-cosmic-depth/90 transition-all duration-300"
                    >
                        {loading ? 'Changing Password...' : 'Change Password'}
                    </Button>
                </form>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Admin User"
                type="danger"
                confirmText="Delete User"
                cancelText="Cancel"
                loading={loading}
            >
                <div className="mt-2 space-y-3">
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete the admin user <strong className="text-gray-900">"{userToDelete?.username}"</strong>?
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h4 className="text-sm font-medium text-red-800">
                                    Warning: This action cannot be undone
                                </h4>
                                <div className="mt-1 text-sm text-red-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>The user will lose access to the admin panel immediately</li>
                                        <li>All sessions for this user will be invalidated</li>
                                        <li>This action is permanent and cannot be reversed</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ConfirmationModal>
        </div>
    );
};

export default AdminUserManagement;