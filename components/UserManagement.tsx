import React, { useState, useEffect, useMemo } from 'react';
import { User, UserStatus } from '../types';
import { getTeacherUsers, updateUserStatus, deleteUser } from '../services/adminService';
import { requestPasswordReset } from '../services/authService';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon, EnvelopeIcon, TrashIcon } from './Icons';
import Notification, { NotificationType } from './Notification';

const UserCard: React.FC<{
    user: User;
    actions: React.ReactNode;
    isSubmitting: boolean;
}> = ({ user, actions, isSubmitting }) => (
    <div className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm transition-opacity ${isSubmitting ? 'opacity-50' : ''}`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-gray-800">{user.fullName}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500 mt-1">{user.schoolName} - {user.className}</p>
            </div>
            <div className="flex space-x-2">{actions}</div>
        </div>
    </div>
);


const UserGroup: React.FC<{
    title: string;
    users: User[];
    colorClass: string;
    children: (user: User) => React.ReactNode;
}> = ({ title, users, colorClass, children }) => (
    <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden">
        <div className={`p-4 border-b ${colorClass} text-white`}>
            <h3 className="text-lg font-bold">{title} ({users.length})</h3>
        </div>
        <div className="p-4 space-y-3">
            {users.length > 0 ? (
                users.map(user => children(user))
            ) : (
                <p className="text-center text-gray-500 py-4">Tidak ada pengguna dalam kategori ini.</p>
            )}
        </div>
    </div>
);

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submittingUserId, setSubmittingUserId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const fetchedUsers = await getTeacherUsers();
                setUsers(fetchedUsers);
            } catch (err: any) {
                setError(err.message || 'Gagal memuat data pengguna.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleUpdateStatus = async (user: User, newStatus: UserStatus) => {
        setSubmittingUserId(user.id);
        setNotification(null);
        try {
            await updateUserStatus(user.id, newStatus);
            setUsers(prevUsers => 
                prevUsers.map(u => u.id === user.id ? { ...u, status: newStatus } : u)
            );
            setNotification({ message: `Status ${user.fullName} berhasil diubah.`, type: 'success' });
        } catch (error) {
            setNotification({ message: 'Gagal memperbarui status pengguna.', type: 'error' });
        } finally {
            setSubmittingUserId(null);
        }
    };
    
    const handleResetPassword = async (user: User) => {
        setSubmittingUserId(user.id);
        setNotification(null);
        const result = await requestPasswordReset(user.email);
        setNotification({ message: result.message, type: result.success ? 'success' : 'error' });
        setSubmittingUserId(null);
    };

    const handleDeleteUser = async (user: User) => {
        const confirmation = window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${user.fullName}" secara permanen? Tindakan ini tidak dapat diurungkan.`);
        if (!confirmation) {
            return;
        }

        setSubmittingUserId(user.id);
        setNotification(null);
        try {
            await deleteUser(user.id, user.username);
            setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
            setNotification({ message: `Pengguna "${user.fullName}" telah berhasil dihapus.`, type: 'success' });
        } catch (error) {
            setNotification({ message: 'Gagal menghapus pengguna.', type: 'error' });
        } finally {
            setSubmittingUserId(null);
        }
    };

    const { pendingUsers, approvedUsers, rejectedUsers } = useMemo(() => {
        return {
            pendingUsers: users.filter(u => u.status === 'pending').sort((a, b) => a.fullName.localeCompare(b.fullName)),
            approvedUsers: users.filter(u => u.status === 'approved').sort((a, b) => a.fullName.localeCompare(b.fullName)),
            rejectedUsers: users.filter(u => u.status === 'rejected').sort((a, b) => a.fullName.localeCompare(b.fullName)),
        };
    }, [users]);
    
    if (isLoading) {
        return <div className="text-center text-gray-600">Memuat data pengguna...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>;
    }

    return (
        <div className="space-y-8">
            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
            
            <UserGroup title="Perlu Persetujuan" users={pendingUsers} colorClass="bg-yellow-500">
                {(user) => (
                    <UserCard key={user.id} user={user} isSubmitting={submittingUserId === user.id} actions={
                        <>
                            <button onClick={() => handleUpdateStatus(user, 'approved')} disabled={submittingUserId === user.id} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"><CheckCircleIcon /></button>
                            <button onClick={() => handleUpdateStatus(user, 'rejected')} disabled={submittingUserId === user.id} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"><XCircleIcon /></button>
                        </>
                    }/>
                )}
            </UserGroup>

            <UserGroup title="Pengguna Terdaftar" users={approvedUsers} colorClass="bg-green-500">
                {(user) => (
                    <UserCard key={user.id} user={user} isSubmitting={submittingUserId === user.id} actions={
                        <>
                            <button onClick={() => handleResetPassword(user)} disabled={submittingUserId === user.id} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Reset Password"><EnvelopeIcon /></button>
                            <button onClick={() => handleUpdateStatus(user, 'rejected')} disabled={submittingUserId === user.id} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Tolak/Blokir Pengguna"><XCircleIcon /></button>
                        </>
                    }/>
                )}
            </UserGroup>
            
            <UserGroup title="Pengguna Ditolak" users={rejectedUsers} colorClass="bg-red-500">
                {(user) => (
                    <UserCard key={user.id} user={user} isSubmitting={submittingUserId === user.id} actions={
                        <>
                         <button onClick={() => handleUpdateStatus(user, 'approved')} disabled={submittingUserId === user.id} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors" title="Setujui Pengguna"><ArrowPathIcon /></button>
                         <button onClick={() => handleDeleteUser(user)} disabled={submittingUserId === user.id} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Hapus Pengguna Permanen"><TrashIcon /></button>
                        </>
                    }/>
                )}
            </UserGroup>
        </div>
    );
};

export default UserManagement;