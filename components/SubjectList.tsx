import React, { useState, useEffect, FormEvent } from 'react';
import { Subject } from '../types';
import { getSubjects, addSubject, updateSubject, deleteSubject } from '../services/adminService';
import Notification, { NotificationType } from './Notification';
import { PencilIcon, TrashIcon, XMarkIcon } from './Icons';

type SubjectFormData = Omit<Subject, 'id'>;

interface SubjectListProps {
    selectedClass: string;
    selectedYear: string;
}

const SubjectList: React.FC<SubjectListProps> = ({ selectedClass, selectedYear }) => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
    const [formData, setFormData] = useState<SubjectFormData>({ code: '', name: '', hours: 0 });
    
    // Delete confirmation modal state
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            setIsLoading(true);
            setNotification(null);
            try {
                const fetchedSubjects = await getSubjects(selectedYear, selectedClass);
                setSubjects(fetchedSubjects);
            } catch (error: any) {
                setNotification({ message: error.message || 'Gagal memuat data mata pelajaran.', type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSubjects();
    }, [selectedClass, selectedYear]);

    const openModal = (subject: Subject | null = null) => {
        setCurrentSubject(subject);
        setFormData(subject ? { code: subject.code, name: subject.name, hours: subject.hours } : { code: '', name: '', hours: 0 });
        setIsModalOpen(true);
        setNotification(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentSubject(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
        }));
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setNotification(null);

        try {
            if (currentSubject) {
                // Update
                await updateSubject(selectedYear, selectedClass, currentSubject.id, formData);
                setSubjects(subjects.map(s => s.id === currentSubject.id ? { ...currentSubject, ...formData } : s));
                setNotification({ message: 'Mata pelajaran berhasil diperbarui.', type: 'success' });
            } else {
                // Add
                const newSubject = await addSubject(selectedYear, selectedClass, formData);
                setSubjects([...subjects, newSubject]);
                setNotification({ message: 'Mata pelajaran baru berhasil ditambahkan.', type: 'success' });
            }
            closeModal();
        } catch (error: any) {
            setNotification({ message: error.message, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!subjectToDelete) return;
    
        setIsSubmitting(true);
        setNotification(null);
        
        try {
            await deleteSubject(selectedYear, selectedClass, subjectToDelete.id);
            setSubjects(subjects.filter(s => s.id !== subjectToDelete.id));
            setNotification({ message: `Mata pelajaran "${subjectToDelete.name}" berhasil dihapus.`, type: 'success' });
        } catch (error: any) {
            setNotification({ message: error.message, type: 'error' });
        } finally {
            setSubjectToDelete(null);
            setIsSubmitting(false);
        }
    };

    const totalHours = subjects.reduce((sum, s) => sum + s.hours, 0);

    if (isLoading) {
        return <div className="text-center p-8">Memuat data mata pelajaran...</div>;
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Daftar Mata Pelajaran - {selectedClass} ({selectedYear})</h2>
                <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow">
                    + Tambah Mata Pelajaran
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kode</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mata Pelajaran</th>
                            <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Alokasi Waktu (JP)</th>
                            <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {subjects.length > 0 ? subjects.map(subject => (
                            <tr key={subject.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-800">{subject.code}</td>
                                <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-600">{subject.name}</td>
                                <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-600 text-center">{subject.hours} JP</td>
                                <td className="py-3 px-4 whitespace-nowrap text-sm text-center">
                                    <button onClick={() => openModal(subject)} className="text-indigo-600 hover:text-indigo-900 p-2"><PencilIcon /></button>
                                    <button onClick={() => setSubjectToDelete(subject)} className="text-red-600 hover:text-red-900 p-2"><TrashIcon /></button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500">Belum ada data mata pelajaran untuk kelas ini.</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="bg-gray-100">
                        <tr>
                            <td colSpan={2} className="py-3 px-4 text-right font-bold text-gray-700">Total Jam Pelajaran per Minggu</td>
                            <td className="py-3 px-4 text-center font-bold text-gray-800">{totalHours} JP</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Edit/Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">{currentSubject ? 'Edit' : 'Tambah'} Mata Pelajaran</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6"/></button>
                        </div>
                        <form onSubmit={handleFormSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kode Mapel</label>
                                    <input type="text" name="code" value={formData.code} onChange={handleFormChange} required className="mt-1 block w-full input-style"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nama Mata Pelajaran</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleFormChange} required className="mt-1 block w-full input-style"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Alokasi Waktu (JP per Minggu)</label>
                                    <input type="number" name="hours" value={formData.hours} onChange={handleFormChange} required className="mt-1 block w-full input-style"/>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end space-x-4">
                                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:bg-indigo-400">
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {subjectToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSubjectToDelete(null)}>
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-600">
                                Apakah Anda yakin ingin menghapus mata pelajaran <strong>{subjectToDelete.name}</strong>? Tindakan ini tidak dapat diurungkan.
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setSubjectToDelete(null)}
                                className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 font-medium"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium disabled:bg-red-400 flex items-center"
                            >
                               {isSubmitting && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                               {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

             <style>{`.input-style { padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; } .input-style:focus { outline: none; --tw-ring-color: #4f46e5; box-shadow: 0 0 0 1px var(--tw-ring-color); border-color: #6366F1;}`}</style>
        </div>
    );
};

export default SubjectList;