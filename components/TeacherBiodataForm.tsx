import React, { useState, useEffect, FormEvent } from 'react';
import { Teacher } from '../types';
import { getTeacherProfile, updateTeacherProfile } from '../services/adminService';
import Notification, { NotificationType } from './Notification';

const TeacherProfileForm: React.FC<{ selectedClass: string, selectedYear: string }> = ({ selectedClass, selectedYear }) => {
    const [formData, setFormData] = useState<Omit<Teacher, 'id'> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            setNotification(null);
            try {
                const profile = await getTeacherProfile(selectedYear, selectedClass);
                const { id, ...data } = profile;
                setFormData(data);
            } catch (error: any) {
                setNotification({ message: error.message || 'Gagal memuat data profil guru.', type: 'error' });
                setFormData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [selectedClass, selectedYear]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (formData) {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value,
            });
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        setIsSubmitting(true);
        setNotification(null);

        try {
            await updateTeacherProfile(selectedYear, selectedClass, formData);
            setNotification({ message: 'Biodata guru berhasil diperbarui.', type: 'success' });
        } catch (error) {
            setNotification({ message: 'Gagal menyimpan perubahan.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return <div className="text-center p-8">Memuat data biodata guru...</div>;
    }
    
    if (!formData) {
         return <div className="text-center p-8 text-red-500">Data tidak dapat dimuat. Silakan coba lagi.</div>;
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
             {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Kolom Kiri */}
                    <div className="space-y-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="input"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">NIP</label>
                            <input type="text" name="nip" value={formData.nip} onChange={handleChange} className="input"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">NIK</label>
                            <input type="text" name="nik" value={formData.nik} onChange={handleChange} className="input"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">NUPTK</label>
                            <input type="text" name="nuptk" value={formData.nuptk} onChange={handleChange} className="input"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="input">
                                <option>Laki-laki</option>
                                <option>Perempuan</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Tempat Lahir</label>
                            <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} className="input"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="input"/>
                        </div>
                    </div>
                    {/* Kolom Kanan */}
                     <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status Kepegawaian</label>
                            <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} className="input">
                                <option>PNS</option>
                                <option>PPPK</option>
                                <option>GTT/GTY</option>
                                <option>Honor Sekolah</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jabatan</label>
                            <input type="text" name="position" value={formData.position} onChange={handleChange} required className="input"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Pendidikan Terakhir</label>
                            <input type="text" name="lastEducation" value={formData.lastEducation} onChange={handleChange} className="input"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Agama</label>
                            <input type="text" name="religion" value={formData.religion} onChange={handleChange} className="input"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="input"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">No. Telepon/HP</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input"/>
                        </div>
                    </div>
                </div>
                
                <style>{`.input { margin-top: 0.25rem; display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); } .input:focus { outline: none; --tw-ring-color: #4f46e5; box-shadow: 0 0 0 2px white, 0 0 0 4px var(--tw-ring-color); border-color: #6366F1;}`}</style>

                <div className="flex justify-end pt-6 border-t mt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center items-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                    >
                         {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Menyimpan...
                            </>
                        ) : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeacherProfileForm;