import React, { useEffect } from "react";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { FaNetworkWired, FaUserAstronaut } from "react-icons/fa";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset("password");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center relative overflow-hidden font-sans text-slate-800">
            <Head title="Log in" />

            {/* === BACKGROUND PATTERN (Hiasan Jaringan) === */}
            <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                    backgroundImage:
                        "radial-gradient(#cbd5e1 2px, transparent 2px)",
                    backgroundSize: "30px 30px",
                }}
            ></div>

            {/* Hiasan Blob Blur (Glow Effect) */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            {/* === CARD LOGIN === */}
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 relative z-10">
                {/* HEADER: Logo & Judul */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-net-blue mb-4 shadow-sm border border-blue-100">
                        <FaNetworkWired size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Welcome Back to NetLearn!
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Siap lanjut belajar? let's go login!
                    </p>
                </div>

                {status && (
                    <div className="mb-4 font-medium text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                        {status}
                    </div>
                )}

                <form onSubmit={submit}>
                    {/* Input Email */}
                    <div>
                        <InputLabel
                            htmlFor="email"
                            value="Email"
                            className="text-slate-600 font-bold"
                        />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full border-slate-300 focus:border-net-blue focus:ring-net-blue rounded-xl shadow-sm py-3"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="nama@gmail.com"
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    {/* Input Password */}
                    <div className="mt-5">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="text-slate-600 font-bold"
                        />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full border-slate-300 focus:border-net-blue focus:ring-net-blue rounded-xl shadow-sm py-3"
                            autoComplete="current-password"
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            placeholder="masukin passwordnya"
                        />
                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    {/* Remember Me & Forgot Password */}
                    {/* GANTI BAGIAN INI */}
                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center cursor-pointer">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                                className="text-net-teal focus:ring-net-teal rounded border-slate-300"
                            />
                            <span className="ms-2 text-slate-500">
                                Ingat Saya
                            </span>
                        </label>

                        {/* Link Lupa Password Dihapus, diganti text info */}
                        <div className="text-slate-400 text-xs italic">
                            Lupa password? Hubungi Guru.
                        </div>
                    </div>

                    {/* Tombol Login */}
                    <div className="mt-8">
                        <PrimaryButton
                            className="w-full justify-center py-4 bg-net-blue hover:bg-blue-700 active:bg-blue-800 focus:ring-net-blue rounded-xl text-base font-bold shadow-lg shadow-blue-200 transition transform hover:-translate-y-0.5"
                            disabled={processing}
                        >
                            {processing ? "Memproses..." : "Login"}
                        </PrimaryButton>
                    </div>

                    {/* Register Link (Opsional) */}
                    <div className="mt-6 text-center text-sm text-slate-500">
                        Belum punya akun?{" "}
                        <Link
                            href={route("register")}
                            className="text-net-teal font-bold hover:underline"
                        >
                            Daftar Sekarang
                        </Link>
                    </div>
                </form>
            </div>

            {/* Footer Copyright */}
            <div className="absolute bottom-4 text-xs text-slate-400">
                &copy; 2025 NetLearn - By Dzulfikri Najmul Falah
            </div>
        </div>
    );
}
