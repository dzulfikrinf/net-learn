import React, { useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FaNetworkWired, FaUser, FaEnvelope, FaLock, FaCheckCircle } from 'react-icons/fa';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center relative overflow-hidden font-sans text-slate-800">
            <Head title="Register" />

            {/* === BACKGROUND PATTERN (Sama seperti Login) === */}
            <div className="absolute inset-0 opacity-40 pointer-events-none"
                 style={{ backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)', backgroundSize: '30px 30px' }}>
            </div>

            {/* Hiasan Blob Blur */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            {/* === CARD REGISTER === */}
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 relative z-10 my-8">

                {/* HEADER: Logo & Judul */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 text-net-blue mb-4 shadow-sm border border-blue-100">
                        <FaNetworkWired size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Buat Akun Baru 🚀</h2>
                    <p className="text-slate-500 text-sm mt-1">Bergabunglah dan mulai belajar jaringan.</p>
                </div>

                <form onSubmit={submit}>

                    {/* Input Name */}
                    <div className="mb-4">
                        <InputLabel htmlFor="name" value="Nama Lengkap" className="text-slate-600 font-bold" />
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <FaUser />
                            </div>
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="block w-full pl-10 pr-4 py-3 border-slate-300 focus:border-net-blue focus:ring-net-blue rounded-xl shadow-sm"
                                autoComplete="name"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                placeholder="Budi Santoso"
                            />
                        </div>
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    {/* Input Email */}
                    <div className="mb-4">
                        <InputLabel htmlFor="email" value="Email" className="text-slate-600 font-bold" />
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <FaEnvelope />
                            </div>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full pl-10 pr-4 py-3 border-slate-300 focus:border-net-blue focus:ring-net-blue rounded-xl shadow-sm"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                placeholder="budi@mahasiswa.com"
                            />
                        </div>
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    {/* Input Password */}
                    <div className="mb-4">
                        <InputLabel htmlFor="password" value="Password" className="text-slate-600 font-bold" />
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <FaLock />
                            </div>
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="block w-full pl-10 pr-4 py-3 border-slate-300 focus:border-net-blue focus:ring-net-blue rounded-xl shadow-sm"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                placeholder="Minimal 8 karakter"
                            />
                        </div>
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    {/* Input Confirm Password */}
                    <div className="mb-6">
                        <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" />
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <FaCheckCircle />
                            </div>
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="block w-full pl-10 pr-4 py-3 border-slate-300 focus:border-net-blue focus:ring-net-blue rounded-xl shadow-sm"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                                placeholder="Ulangi password"
                            />
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    {/* Tombol Register */}
                    <div className="mt-4">
                        <PrimaryButton
                            className="w-full justify-center py-4 bg-net-blue hover:bg-blue-700 active:bg-blue-800 focus:ring-net-blue rounded-xl text-base font-bold shadow-lg shadow-blue-200 transition transform hover:-translate-y-0.5"
                            disabled={processing}
                        >
                            {processing ? 'Memproses...' : 'Daftar Sekarang'}
                        </PrimaryButton>
                    </div>

                    {/* Link Login */}
                    <div className="mt-6 text-center text-sm text-slate-500">
                        Sudah punya akun?{' '}
                        <Link
                            href={route('login')}
                            className="text-net-teal font-bold hover:underline transition"
                        >
                            Masuk di sini
                        </Link>
                    </div>
                </form>
            </div>

            {/* Footer Copyright */}
            <div className="relative z-10 mb-4 text-xs text-slate-400">
                &copy; 2025 NetLearn - Media Pembelajaran Jaringan Komputer
            </div>
        </div>
    );
}
