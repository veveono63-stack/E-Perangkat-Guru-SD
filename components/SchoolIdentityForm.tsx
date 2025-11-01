import React, { useState, useEffect, FormEvent } from 'react';
import { SchoolIdentity } from '../types';
import { getSchoolIdentity, updateSchoolIdentity } from '../services/adminService';
import Notification, { NotificationType } from './Notification';

const defaultIdentity: SchoolIdentity = {
    schoolName: 'SDN 01 Contoh',
    npsn: '12345678',
    nss: '101234567890',
    address: 'Jl. Pendidikan No. 1',
    postalCode: '12345',
    phone: '021-1234567',
    subdistrict: 'Kelurahan Cerdas',
    district: 'Kecamatan Pintar',
    city: 'Kota Pelajar',
    province: 'Provinsi Pengetahuan',
    website: 'www.sdn01contoh.sch.id',
    email: 'info@sdn01contoh.sch.id',
    principalName: 'Dr. Budi Santoso, M.Pd.',
    principalNip: '197001011995031001',
};

const SchoolIdentityForm: React.FC<{ selectedClass: string, selectedYear: string }> = ({ selectedClass, selectedYear }) => {
    const [formData, setFormData] = useState<SchoolIdentity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);

    useEffect(() => {
        const fetchIdentity = async () => {
            try {
                const identity = await getSchoolIdentity();
                setFormData(identity || defaultIdentity);
            } catch (error) {
                setNotification({ message: 'Gagal memuat data identitas sekolah.', type: 'error' });
                setFormData(defaultIdentity);
            } finally {
                setIsLoading(false);
            }
        };

        fetchIdentity();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            await updateSchoolIdentity(formData);
            setNotification({ message: 'Identitas sekolah berhasil diperbarui.', type: 'success' });
        } catch (error) {
            setNotification({ message: 'Gagal menyimpan perubahan.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return <div className="text-center p-8">Memuat data...</div>;
    }
    
    if (!formData) {
         return <div className="text-center p-8 text-red-500">Data tidak dapat dimuat.</div>;
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
             {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Kolom Kiri */}
                    <div className="space-y-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Sekolah</label>
                            <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">NPSN</label>
                            <input type="text" name="npsn" value={formData.npsn} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">NSS</label>
                            <input type="text" name="nss" value={formData.nss} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Alamat Sekolah</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Kode Pos</label>
                            <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Telepon</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Website</label>
                            <input type="text" name="website" value={formData.website} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                        </div>
                    </div>
                    {/* Kolom Kanan */}
                     <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kelurahan</label>
                            <input type="text" name="subdistrict" value={formData.subdistrict} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kecamatan</label>
                            <input type="text" name="district" value={formData.district} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Kabupaten/Kota</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Provinsi</label>
                            <input type="text" name="province" value={formData.province} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                        </div>
                        <div className="pt-6 border-t">
                            <h3 className="text-lg font-medium text-gray-900">Kepala Sekolah</h3>
                             <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700">Nama Kepala Sekolah</label>
                                <input type="text" name="principalName" value={formData.principalName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                            </div>
                             <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700">NIP Kepala Sekolah</label>
                                <input type="text" name="principalNip" value={formData.principalNip} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                            </div>
                        </div>
                    </div>
                </div>

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

export default SchoolIdentityForm;