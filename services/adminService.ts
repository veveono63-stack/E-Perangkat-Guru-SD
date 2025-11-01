import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, writeBatch, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { SchoolIdentity, Student, Subject, Teacher, User, UserStatus } from '../types';

// --- User Management ---

export const getTeacherUsers = async (): Promise<User[]> => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'teacher'));
        const querySnapshot = await getDocs(q);
        
        const users: User[] = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() } as User);
        });
        
        return users;
    } catch (error) {
        console.error("Error fetching teacher users: ", error);
        throw new Error("Gagal mengambil data pengguna.");
    }
};

export const updateUserStatus = async (userId: string, status: UserStatus): Promise<void> => {
    try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, { status });
    } catch (error) {
        console.error("Error updating user status: ", error);
        throw new Error("Gagal memperbarui status pengguna.");
    }
};

export const deleteUser = async (userId: string, username: string): Promise<void> => {
    try {
        const batch = writeBatch(db);

        const userDocRef = doc(db, 'users', userId);
        const usernameDocRef = doc(db, 'usernames', username.toLowerCase());

        batch.delete(userDocRef);
        batch.delete(usernameDocRef);

        await batch.commit();
    } catch (error) {
        console.error("Error deleting user: ", error);
        throw new Error("Gagal menghapus pengguna dari database.");
    }
};

// --- Helpers ---
const getAcademicYearDocId = (year: string) => year.replace('/', '-');
const getClassDocId = (classLevel: string) => classLevel.toLowerCase().replace(' ', '-');


// --- School Identity (Global) ---

export const getSchoolIdentity = async (): Promise<SchoolIdentity | null> => {
    try {
        const docRef = doc(db, 'schoolData', 'identity');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as SchoolIdentity;
        }
        return null;
    } catch (error) {
        console.error("Error fetching school identity: ", error);
        throw new Error("Gagal mengambil data identitas sekolah.");
    }
};

export const updateSchoolIdentity = async (data: SchoolIdentity): Promise<void> => {
    try {
        const docRef = doc(db, 'schoolData', 'identity');
        await setDoc(docRef, data, { merge: true });
    } catch (error) {
        console.error("Error updating school identity: ", error);
        throw new Error("Gagal memperbarui identitas sekolah.");
    }
};

// --- Teacher Biodata Profile (Per Academic Year) ---

const defaultTeacherProfile: Omit<Teacher, 'id'> = {
    fullName: 'Rina Setyawati, S.Pd.',
    nip: '198805212014032001',
    nik: '3301012345678901',
    nuptk: '1234567890123456',
    gender: 'Perempuan',
    birthPlace: 'Semarang',
    birthDate: '1988-05-21',
    employmentStatus: 'PNS',
    position: 'Guru Kelas',
    lastEducation: 'S1 PGSD Universitas Terbuka',
    religion: 'Islam',
    address: 'Jl. Merdeka No. 45, Kelurahan Cerdas, Kecamatan Pintar',
    phone: '081234567890',
    email: 'rina.setyawati@email.com',
};


export const getTeacherProfile = async (academicYear: string, classLevel: string): Promise<Teacher> => {
    try {
        const yearDocId = getAcademicYearDocId(academicYear);
        const classDocId = getClassDocId(classLevel);
        const docRef = doc(db, 'schoolData', yearDocId, classDocId, 'teacherProfile');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Teacher;
        } else {
            // Data tidak ada, buat data default untuk tahun ajaran dan kelas ini
            const newProfileData = { ...defaultTeacherProfile, position: `Guru ${classLevel}`};
            await setDoc(docRef, newProfileData);
            return { id: docRef.id, ...newProfileData };
        }
    } catch (error) {
        console.error("Error fetching teacher profile: ", error);
        throw new Error("Gagal mengambil data profil guru.");
    }
};

export const updateTeacherProfile = async (academicYear: string, classLevel: string, data: Omit<Teacher, 'id'>): Promise<void> => {
    try {
        const yearDocId = getAcademicYearDocId(academicYear);
        const classDocId = getClassDocId(classLevel);
        const docRef = doc(db, 'schoolData', yearDocId, classDocId, 'teacherProfile');
        await setDoc(docRef, data, { merge: true });
    } catch (error) {
        console.error("Error updating teacher profile: ", error);
        throw new Error("Gagal memperbarui profil guru.");
    }
};


// --- Subject (Mata Pelajaran) Management (Per Academic Year) ---

const defaultSubjects: { [key: string]: Omit<Subject, 'id'>[] } = {
    'kelas-i': [
        { code: 'PAIBP', name: 'Pendidikan Agama Islam Dan Budi Pekerti', hours: 4 },
        { code: 'PP', name: 'Pendidikan Pancasila', hours: 5 },
        { code: 'BIND', name: 'Bahasa Indonesia', hours: 8 },
        { code: 'MTK', name: 'Matematika', hours: 5 },
        { code: 'PJOK', name: 'Pendidikan Jasmani, Olahraga, Dan Kesehatan', hours: 4 },
        { code: 'SR', name: 'Seni Rupa', hours: 4 },
        { code: 'BJW', name: 'Bahasa Jawa', hours: 2 },
        { code: 'PLH', name: 'Pendidikan Lingkungan Hidup', hours: 2 },
        { code: 'BING', name: 'Bahasa Inggris (Opsional)', hours: 2 },
    ],
    'kelas-ii': [
        { code: 'PAIBP', name: 'Pendidikan Agama Islam Dan Budi Pekerti', hours: 4 },
        { code: 'PP', name: 'Pendidikan Pancasila', hours: 5 },
        { code: 'BIND', name: 'Bahasa Indonesia', hours: 9 },
        { code: 'MTK', name: 'Matematika', hours: 6 },
        { code: 'PJOK', name: 'Pendidikan Jasmani, Olahraga, Dan Kesehatan', hours: 4 },
        { code: 'SR', name: 'Seni Rupa', hours: 4 },
        { code: 'BJW', name: 'Bahasa Jawa', hours: 2 },
        { code: 'BING', name: 'Bahasa Inggris (Opsional)', hours: 2 },
    ],
    'kelas-iii': [
        { code: 'PAIBP', name: 'Pendidikan Agama Islam Dan Budi Pekerti', hours: 4 },
        { code: 'PP', name: 'Pendidikan Pancasila', hours: 5 },
        { code: 'BIND', name: 'Bahasa Indonesia', hours: 7 },
        { code: 'MTK', name: 'Matematika', hours: 6 },
        { code: 'IPAS', name: 'Ilmu Pengetahuan Alam Dan Sosial', hours: 6 },
        { code: 'PJOK', name: 'Pendidikan Jasmani, Olahraga, Dan Kesehatan', hours: 4 },
        { code: 'SR', name: 'Seni Rupa', hours: 4 },
        { code: 'BING', name: 'Bahasa Inggris', hours: 2 },
        { code: 'BJW', name: 'Bahasa Jawa', hours: 2 },
        { code: 'PLH', name: 'Pendidikan Lingkungan Hidup', hours: 2 },
    ],
    'kelas-iv': [
        { code: 'PAIBP', name: 'Pendidikan Agama Islam Dan Budi Pekerti', hours: 4 },
        { code: 'PP', name: 'Pendidikan Pancasila', hours: 5 },
        { code: 'BIND', name: 'Bahasa Indonesia', hours: 7 },
        { code: 'MTK', name: 'Matematika', hours: 6 },
        { code: 'IPAS', name: 'Ilmu Pengetahuan Alam Dan Sosial', hours: 6 },
        { code: 'PJOK', name: 'Pendidikan Jasmani, Olahraga, Dan Kesehatan', hours: 4 },
        { code: 'SR', name: 'Seni Rupa', hours: 4 },
        { code: 'BING', name: 'Bahasa Inggris', hours: 2 },
        { code: 'BJW', name: 'Bahasa Jawa', hours: 2 },
        { code: 'PLH', name: 'Pendidikan Lingkungan Hidup', hours: 2 },
    ],
    'kelas-v': [
        { code: 'PAIBP', name: 'Pendidikan Agama Islam Dan Budi Pekerti', hours: 4 },
        { code: 'PP', name: 'Pendidikan Pancasila', hours: 5 },
        { code: 'BIND', name: 'Bahasa Indonesia', hours: 7 },
        { code: 'MTK', name: 'Matematika', hours: 6 },
        { code: 'IPAS', name: 'Ilmu Pengetahuan Alam Dan Sosial', hours: 6 },
        { code: 'PJOK', name: 'Pendidikan Jasmani, Olahraga, Dan Kesehatan', hours: 4 },
        { code: 'SR', name: 'Seni Rupa', hours: 4 },
        { code: 'BING', name: 'Bahasa Inggris', hours: 2 },
        { code: 'BJW', name: 'Bahasa Jawa', hours: 2 },
        { code: 'PLH', name: 'Pendidikan Lingkungan Hidup', hours: 2 },
        { code: 'KKA', name: 'Koding Dan Kecerdasan Artificial', hours: 2 },
    ],
    'kelas-vi': [
        { code: 'PAIBP', name: 'Pendidikan Agama Islam Dan Budi Pekerti', hours: 4 },
        { code: 'PP', name: 'Pendidikan Pancasila', hours: 5 },
        { code: 'BIND', name: 'Bahasa Indonesia', hours: 7 },
        { code: 'MTK', name: 'Matematika', hours: 6 },
        { code: 'IPAS', name: 'Ilmu Pengetahuan Alam Dan Sosial', hours: 6 },
        { code: 'PJOK', name: 'Pendidikan Jasmani, Olahraga, Dan Kesehatan', hours: 4 },
        { code: 'SR', name: 'Seni Rupa', hours: 4 },
        { code: 'BING', name: 'Bahasa Inggris', hours: 2 },
        { code: 'BJW', name: 'Bahasa Jawa', hours: 2 },
        { code: 'PLH', name: 'Pendidikan Lingkungan Hidup', hours: 2 },
        { code: 'KKA', name: 'Koding Dan Kecerdasan Artificial', hours: 2 },
    ],
};

export const getSubjects = async (academicYear: string, classLevel: string): Promise<Subject[]> => {
    try {
        const yearDocId = getAcademicYearDocId(academicYear);
        const classDocId = getClassDocId(classLevel);
        const subjectsRef = collection(db, 'schoolData', yearDocId, classDocId, 'data', 'subjects');
        const querySnapshot = await getDocs(subjectsRef);

        if (querySnapshot.empty && defaultSubjects[classDocId]) {
            // Data tidak ada, buat data default
            const batch = writeBatch(db);
            const defaultData = defaultSubjects[classDocId];
            defaultData.forEach(subject => {
                const newDocRef = doc(subjectsRef);
                batch.set(newDocRef, subject);
            });
            await batch.commit();
            // Ambil lagi data yang baru dibuat
            const newSnapshot = await getDocs(subjectsRef);
            return newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
        }
        
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
    } catch (error) {
        console.error(`Error fetching subjects for ${classLevel}: `, error);
        throw new Error("Gagal mengambil data mata pelajaran.");
    }
};

export const addSubject = async (academicYear: string, classLevel: string, subjectData: Omit<Subject, 'id'>): Promise<Subject> => {
    try {
        const yearDocId = getAcademicYearDocId(academicYear);
        const classDocId = getClassDocId(classLevel);
        const subjectsRef = collection(db, 'schoolData', yearDocId, classDocId, 'data', 'subjects');
        const newDocRef = await addDoc(subjectsRef, subjectData);
        return { id: newDocRef.id, ...subjectData };
    } catch (error) {
        console.error("Error adding subject: ", error);
        throw new Error("Gagal menambahkan mata pelajaran.");
    }
};

export const updateSubject = async (academicYear: string, classLevel: string, subjectId: string, subjectData: Partial<Omit<Subject, 'id'>>): Promise<void> => {
    try {
        const yearDocId = getAcademicYearDocId(academicYear);
        const classDocId = getClassDocId(classLevel);
        const docRef = doc(db, 'schoolData', yearDocId, classDocId, 'data', 'subjects', subjectId);
        await updateDoc(docRef, subjectData);
    } catch (error) {
        console.error("Error updating subject: ", error);
        throw new Error("Gagal memperbarui mata pelajaran.");
    }
};

export const deleteSubject = async (academicYear: string, classLevel: string, subjectId: string): Promise<void> => {
    try {
        const yearDocId = getAcademicYearDocId(academicYear);
        const classDocId = getClassDocId(classLevel);
        const docRef = doc(db, 'schoolData', yearDocId, classDocId, 'data', 'subjects', subjectId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting subject: ", error);
        throw new Error("Gagal menghapus mata pelajaran.");
    }
};

// --- Student List Management (Per Academic Year) ---

const createDefaultStudent = (id: string): Student => ({
    id,
    fullName: '',
    nickname: '',
    gender: '',
    nis: '',
    nisn: '',
    birthPlace: '',
    birthDate: '',
    religion: '',
    address: { street: '', rtRw: '', dusun: '', desa: '', kecamatan: '' },
    parents: { ayah: '', ibu: '', wali: '' },
    phone: '',
});

export const getStudents = async (academicYear: string, classLevel: string): Promise<Student[]> => {
    try {
        const yearDocId = getAcademicYearDocId(academicYear);
        const classDocId = getClassDocId(classLevel);
        const docRef = doc(db, 'schoolData', yearDocId, classDocId, 'studentList');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().students) {
            return docSnap.data().students as Student[];
        } else {
            // Data tidak ada, kembalikan 25 baris kosong sebagai default
            return Array.from({ length: 25 }, (_, i) => createDefaultStudent(`default-${i}`));
        }
    } catch (error) {
        console.error(`Error fetching students for ${classLevel}: `, error);
        throw new Error("Gagal mengambil data siswa.");
    }
};

export const updateStudents = async (academicYear: string, classLevel: string, students: Student[]): Promise<void> => {
    try {
        const yearDocId = getAcademicYearDocId(academicYear);
        const classDocId = getClassDocId(classLevel);
        const docRef = doc(db, 'schoolData', yearDocId, classDocId, 'studentList');
        // Simpan seluruh array siswa ke dalam satu dokumen
        await setDoc(docRef, { students });
    } catch (error) {
        console.error("Error updating students: ", error);
        throw new Error("Gagal menyimpan data siswa.");
    }
};