

export type UserStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'admin' | 'teacher';

export interface User {
  id: string; // This will correspond to the Firebase Auth UID
  fullName: string;
  schoolName: string;
  className: string;
  email: string;
  username: string;
  status: UserStatus;
  role: UserRole;
}

export interface RegistrationData {
  fullName: string;
  schoolName: string;
  className: string;
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface SchoolIdentity {
  schoolName: string;
  npsn: string;
  nss: string;
  address: string;
  postalCode: string;
  phone: string;
  subdistrict: string;
  district: string;
  city: string;
  province: string;
  website: string;
  email: string;
  principalName: string;
  principalNip: string;
}

export interface Teacher {
  id: string;
  nip: string;
  nik: string;
  nuptk: string;
  fullName: string;
  gender: 'Laki-laki' | 'Perempuan';
  birthPlace: string;
  birthDate: string;
  employmentStatus: 'PNS' | 'PPPK' | 'GTT/GTY' | 'Honor Sekolah';
  position: string;
  lastEducation: string;
  religion: string;
  address: string;
  phone: string;
  email: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  hours: number;
}

export interface StudentAddress {
  street: string;
  rtRw: string;
  dusun: string;
  desa: string;
  kecamatan: string;
}

export interface StudentParents {
  ayah: string;
  ibu: string;
  wali: string;
}

export interface Student {
  id: string; // uuid for react key
  fullName: string;
  nickname: string;
  gender: 'L' | 'P' | '';
  nis: string;
  nisn: string;
  birthPlace: string;
  birthDate: string;
  religion: string;
  address: StudentAddress;
  parents: StudentParents;
  phone: string;
}