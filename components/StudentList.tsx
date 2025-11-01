import React, { useState, useEffect } from 'react';
import { Student, SchoolIdentity, Teacher } from '../types';
import { getStudents, updateStudents, getSchoolIdentity, getTeacherProfile } from '../services/adminService';
import Notification, { NotificationType } from './Notification';
import { TrashIcon, PrinterIcon } from './Icons';

// Komponen Pemuatan
const LoadingState = () => (
    <div className="text-center p-8 text-gray-600 flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Memuat data...
    </div>
);

// Komponen Input Tabel
const TableInput = ({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full h-full p-2 border-none bg-transparent focus:outline-none focus:bg-indigo-50 rounded"
    />
);

const DateInput = ({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
     <input
        type="date"
        value={value}
        onChange={onChange}
        className="w-full h-full p-2 border-none bg-transparent focus:outline-none focus:bg-indigo-50 rounded"
    />
);


const StudentList: React.FC<{ selectedClass: string; selectedYear: string }> = ({ selectedClass, selectedYear }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [schoolIdentity, setSchoolIdentity] = useState<SchoolIdentity | null>(null);
    const [teacherProfile, setTeacherProfile] = useState<Teacher | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
    const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split('T')[0]); // Format YYYY-MM-DD

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            setNotification(null);
            try {
                const [studentsData, identityData, teacherData] = await Promise.all([
                    getStudents(selectedYear, selectedClass),
                    getSchoolIdentity(),
                    getTeacherProfile(selectedYear, selectedClass),
                ]);
                setStudents(studentsData);
                setSchoolIdentity(identityData);
                setTeacherProfile(teacherData);
            } catch (error: any) {
                setNotification({ message: error.message || 'Gagal memuat data.', type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, [selectedClass, selectedYear]);

    const handleStudentChange = (index: number, field: keyof Student, value: any) => {
        const newStudents = [...students];
        (newStudents[index] as any)[field] = value;
        setStudents(newStudents);
    };

    const handleNestedChange = (index: number, category: 'address' | 'parents', field: string, value: string) => {
        const newStudents = [...students];
        (newStudents[index][category] as any)[field] = value;
        setStudents(newStudents);
    };

    const handleAddRow = () => {
        setStudents([...students, {
            id: `new-${Date.now()}`,
            fullName: '', nickname: '', gender: '', nis: '', nisn: '',
            birthPlace: '', birthDate: '', religion: '',
            address: { street: '', rtRw: '', dusun: '', desa: '', kecamatan: '' },
            parents: { ayah: '', ibu: '', wali: '' },
            phone: '',
        }]);
    };

    const handleRemoveRow = (index: number) => {
        setStudents(students.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setNotification(null);
        try {
            await updateStudents(selectedYear, selectedClass, students);
            setNotification({ message: 'Data siswa berhasil disimpan.', type: 'success' });
        } catch (error: any) {
            setNotification({ message: error.message || 'Gagal menyimpan data.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <LoadingState />;

    // Format tanggal yang dipilih ke format bahasa Indonesia
    const formattedSignatureDate = new Date(signatureDate + 'T00:00:00').toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <>
            <div className="flex justify-end mb-4 space-x-2">
                <button onClick={handleAddRow} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow">
                    + Tambah Baris
                </button>
                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow disabled:bg-green-400">
                    {isSaving ? 'Menyimpan...' : 'Simpan Data'}
                </button>
                 <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow flex items-center space-x-2">
                    <PrinterIcon /> <span>Cetak</span>
                </button>
            </div>
            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
            
            <div id="print-area" className="bg-white p-8 rounded-xl shadow-lg print:shadow-none print:p-0">
                <header className="text-center mb-6">
                    <h1 className="text-xl font-bold uppercase">DAFTAR PESERTA DIDIK {selectedClass}</h1>
                    <h2 className="text-xl font-bold uppercase">{schoolIdentity?.schoolName || '.......................'}</h2>
                    <h3 className="text-lg font-bold">TAHUN PELAJARAN {selectedYear}</h3>
                </header>

                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-black text-sm">
                        <thead className="text-center font-bold">
                            <tr>
                                <th rowSpan={2} className="border border-black p-2">NO</th>
                                <th rowSpan={2} className="border border-black p-2">NAMA LENGKAP</th>
                                <th rowSpan={2} className="border border-black p-2">NAMA PANGGILAN</th>
                                <th rowSpan={2} className="border border-black p-2">JK</th>
                                <th rowSpan={2} className="border border-black p-2">NIS</th>
                                <th rowSpan={2} className="border border-black p-2">NISN</th>
                                <th rowSpan={2} className="border border-black p-2">TEMPAT LAHIR</th>
                                <th rowSpan={2} className="border border-black p-2">TANGGAL LAHIR</th>
                                <th rowSpan={2} className="border border-black p-2">AGAMA</th>
                                <th colSpan={5} className="border border-black p-2">ALAMAT</th>
                                <th colSpan={3} className="border border-black p-2">Orang Tua/Wali</th>
                                <th rowSpan={2} className="border border-black p-2">NO. HP</th>
                                <th rowSpan={2} className="border border-black p-1 print:hidden"></th>
                            </tr>
                            <tr>
                                <th className="border border-black p-2">Jalan</th>
                                <th className="border border-black p-2">RT/RW</th>
                                <th className="border border-black p-2">Dusun</th>
                                <th className="border border-black p-2">Desa</th>
                                <th className="border border-black p-2">Kecamatan</th>
                                <th className="border border-black p-2">Ayah</th>
                                <th className="border border-black p-2">Ibu</th>
                                <th className="border border-black p-2">Wali</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student.id}>
                                    <td className="border border-black p-2 text-center">{index + 1}</td>
                                    <td className="border border-black whitespace-normal min-w-[200px]"><TableInput value={student.fullName} onChange={e => handleStudentChange(index, 'fullName', e.target.value)} /></td>
                                    <td className="border border-black whitespace-normal min-w-[120px]"><TableInput value={student.nickname} onChange={e => handleStudentChange(index, 'nickname', e.target.value)} /></td>
                                    <td className="border border-black whitespace-normal min-w-[50px] text-center"><TableInput value={student.gender} onChange={e => handleStudentChange(index, 'gender', e.target.value)} /></td>
                                    <td className="border border-black whitespace-normal min-w-[100px]"><TableInput value={student.nis} onChange={e => handleStudentChange(index, 'nis', e.target.value)} /></td>
                                    <td className="border border-black whitespace-normal min-w-[120px]"><TableInput value={student.nisn} onChange={e => handleStudentChange(index, 'nisn', e.target.value)} /></td>
                                    <td className="border border-black whitespace-normal min-w-[120px]"><TableInput value={student.birthPlace} onChange={e => handleStudentChange(index, 'birthPlace', e.target.value)} /></td>
                                    <td className="border border-black whitespace-normal min-w-[120px]"><DateInput value={student.birthDate} onChange={e => handleStudentChange(index, 'birthDate', e.target.value)} /></td>
                                    <td className="border border-black whitespace-normal min-w-[100px]"><TableInput value={student.religion} onChange={e => handleStudentChange(index, 'religion', e.target.value)} /></td>
                                    <td className="border border-black whitespace-normal min-w-[150px]"><TableInput value={student.address.street} onChange={e => handleNestedChange(index, 'address', 'street', e.target.value)} /></td>
                                    <td className="border border-black whitespace-normal min-w-[80px]"><TableInput value={student.address.rtRw} onChange={e => handleNestedChange(index, 'address', 'rtRw', e.target.value)} /></td>
                                    <td className="border border-black whitespace-normal min-w-[120px]"><TableInput value={student.address.dusun} onChange={e => handleNestedChange(index, 'address', 'dusun', e.target.value)} /></td>
                                    <td className="border border-black whitespace-normal min-w-[120px]"><TableInput value={student.address.desa} onChange={e => handleNestedChange(index, 'address', 'desa', e.target.value)} /></td>
                                    <td className="border border-black whitespace-normal min-w-[120px]"><TableInput value={student.address.kecamatan} onChange={e => handleNestedChange(index, 'address', 'kecamatan', e.target.value)} /></td>
                                    <td className="border border-black whitespace-normal min-w-[150px]"><TableInput value={student.parents.ayah} onChange={e => handleNestedChange(index, 'parents', 'ayah', e.target.value)} /></td>
                                    <td className="border border-black whitespace-normal min-w-[150px]"><TableInput value={student.parents.ibu} onChange={e => handleNestedChange(index, 'parents', 'ibu', e.target.value)} /></td>
                                    <td className="border border-black whitespace-normal min-w-[150px]"><TableInput value={student.parents.wali} onChange={e => handleNestedChange(index, 'parents', 'wali', e.target.value)} /></td>
                                    <td className="border border-black whitespace-normal min-w-[120px]"><TableInput value={student.phone} onChange={e => handleStudentChange(index, 'phone', e.target.value)} /></td>
                                    <td className="border border-black print:hidden"><button onClick={() => handleRemoveRow(index)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-8 flex justify-end print:hidden">
                    <div className="w-full max-w-xs">
                        <label htmlFor="signatureDate" className="block text-sm font-medium text-gray-700">Pilih Tanggal Tanda Tangan</label>
                        <input
                            type="date"
                            id="signatureDate"
                            value={signatureDate}
                            onChange={(e) => setSignatureDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <footer className="mt-12 flex justify-end">
                    <div className="text-center">
                        <p>{schoolIdentity?.city || '...................'}, {formattedSignatureDate}</p>
                        <p>Wali Kelas {selectedClass}</p>
                        <div className="h-20"></div>
                        <p className="font-bold underline">{teacherProfile?.fullName || '.....................................'}</p>
                        <p>NIP. {teacherProfile?.nip || '.....................................'}</p>
                    </div>
                </footer>
            </div>
             <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-area, #print-area * {
                        visibility: visible;
                    }
                    #print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print\\:hidden {
                        display: none;
                    }
                    .print\\:shadow-none {
                        box-shadow: none;
                    }
                     .print\\:p-0 {
                        padding: 0;
                    }
                }
            `}</style>
        </>
    );
};

export default StudentList;