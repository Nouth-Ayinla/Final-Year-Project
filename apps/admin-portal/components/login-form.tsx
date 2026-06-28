"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema, adminLoginSchemaType } from "@/lib/zodSchema";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Logo from "../public/ondo state logo.png";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { adminLogin, isLoggingIn } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<adminLoginSchemaType>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: adminLoginSchemaType) => {
    setErrorMsg(null);
    try {
      const success = await adminLogin(data);
      if (success) {
        router.push("/");
      } else {
        setErrorMsg("Authentication failed. Please verify your credentials.");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-[#FDFBF7] overflow-hidden font-sans">
      {/* Decorative background shapes in Ondo Orange & Gold */}
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-[#D95300] opacity-10 rotate-45 pointer-events-none z-0" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#1C1917] rounded-full opacity-10 pointer-events-none z-0" />
      <div className="absolute top-20 left-20 w-16 h-16 border-4 border-[#1C1917]/5 rounded-xl rotate-12 z-0" />
      <div className="absolute bottom-1/4 right-10 w-24 h-24 border-2 border-[#D95300]/10 rounded-full z-0" />

      {/* Main Container */}
      <div className="scale-[0.9] lg:scale-100 transform z-10 flex items-center justify-center">
        <div className="relative w-[980px] h-[650px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex border border-[#E7E5E4]/60">
          
          {/* Left Pane - Form */}
          <div className="w-1/2 h-full flex flex-col justify-center p-12 bg-white">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-[360px] mx-auto text-center">
              <div className="mb-4">
                <Image
                  src={Logo}
                  alt="OndoDecide Logo"
                  width={60}
                  height={60}
                  className="object-contain mx-auto mb-3"
                  priority
                />
                <h1 className="text-3xl font-extrabold text-[#1C1917] mb-1">
                  OndoDecide
                </h1>
                <p className="text-xs text-amber-600 uppercase tracking-widest font-bold">
                  Secure Dashboard Entry
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 text-left">
                  <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-[10px] text-red-600 font-bold leading-tight">{errorMsg}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Identifier Input */}
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Email or Admin ID"
                    className="w-full pl-11 pr-4 py-3 bg-[#F5F5F4] border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D95300] focus:bg-white outline-none transition-all text-[#1C1917]"
                    {...register("identifier")}
                  />
                  {errors.identifier && (
                    <p className="text-left text-[10px] text-red-500 mt-1 pl-1 font-semibold">
                      {errors.identifier.message}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full pl-11 pr-12 py-3 bg-[#F5F5F4] border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D95300] focus:bg-white outline-none transition-all text-[#1C1917]"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-[#D95300]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {errors.password && (
                    <p className="text-left text-[10px] text-red-500 mt-1 pl-1 font-semibold">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-12 bg-[#D95300] hover:bg-[#1C1917] text-white rounded-full font-bold uppercase text-xs tracking-widest mt-2 shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Login to Console"
                )}
              </Button>
            </form>
          </div>

          {/* Right Pane - Info (Matches dark sidebar #1C1917) */}
          <div className="w-1/2 h-full bg-[#1C1917] text-white relative flex flex-col items-center justify-center p-12 text-center">
            {/* Shapes inside the Charcoal Panel */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D95300] opacity-20 rotate-45 translate-x-16 -translate-y-16 pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-12 h-12 border-4 border-white/10 rotate-12 pointer-events-none" />
            <div className="absolute top-1/4 right-8 w-4 h-4 bg-white/10 rounded-full pointer-events-none" />

            <div className="relative z-30 max-w-[300px]">
              <h2 className="text-4xl font-extrabold mb-4 text-[#F5F5F4]">
                System Admin
              </h2>
              <p className="text-sm opacity-80 mb-8 leading-relaxed text-stone-300">
                Welcome back. Log in with your administrative credentials to configure rules, monitor voter turnout, and audit ledgers.
              </p>
              <div className="w-full space-y-4">
                <div className="text-xs text-stone-400">First time logging in?</div>
                <Button
                  onClick={() => router.push("/activate-account")}
                  variant="outline"
                  className="w-full py-3 bg-transparent text-white border-2 border-white rounded-full font-bold uppercase text-xs tracking-widest hover:bg-[#D95300] hover:border-[#D95300] transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  Activate Account
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}