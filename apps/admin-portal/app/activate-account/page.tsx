"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  activateAdminAccountSchema,
  activateAdminAccountSchemaType,
} from "@/lib/zodSchema";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, User, Key, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Logo from "../../public/ondo state logo.png";

export default function ActivateAdminAccount() {
  const router = useRouter();
  const { activateAdminAccount, isActivatingAccount } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<activateAdminAccountSchemaType>({
    resolver: zodResolver(activateAdminAccountSchema),
    defaultValues: {
      adminId: "",
      activationPin: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: activateAdminAccountSchemaType) => {
    setErrorMsg(null);
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const success = await activateAdminAccount(data);
      if (success) {
        toast.success("Account activated successfully!");
        router.push("/login");
      } else {
        setErrorMsg("Activation failed. Please verify your Admin ID and Pin.");
      }
    } catch (err: any) {
      setErrorMsg("An error occurred during activation. Please try again.");
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-[360px] mx-auto text-center">
              <div className="mb-4">
                <Image
                  src={Logo}
                  alt="OndoDecide Logo"
                  width={60}
                  height={60}
                  className="object-contain mx-auto mb-3"
                  priority
                />
                <h1 className="text-2xl font-extrabold text-[#1C1917] mb-1">
                  Activate Profile
                </h1>
                <p className="text-xs text-amber-600 uppercase tracking-widest font-bold">
                  Initialize Console Access
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 text-left">
                  <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-[10px] text-red-600 font-bold leading-tight">{errorMsg}</p>
                </div>
              )}

              <div className="space-y-3">
                {/* Admin ID */}
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Admin ID (e.g. ADM-2026-...)"
                    className="w-full pl-11 pr-4 py-3 bg-[#F5F5F4] border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D95300] focus:bg-white outline-none transition-all text-[#1C1917]"
                    {...register("adminId")}
                  />
                  {errors.adminId && (
                    <p className="text-left text-[10px] text-red-500 mt-1 pl-1 font-semibold">
                      {errors.adminId.message}
                    </p>
                  )}
                </div>

                {/* Activation Pin */}
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Activation PIN"
                    className="w-full pl-11 pr-4 py-3 bg-[#F5F5F4] border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D95300] focus:bg-white outline-none transition-all text-[#1C1917]"
                    {...register("activationPin")}
                  />
                  {errors.activationPin && (
                    <p className="text-left text-[10px] text-red-500 mt-1 pl-1 font-semibold">
                      {errors.activationPin.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Choose Password"
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

                {/* Confirm Password */}
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full pl-11 pr-4 py-3 bg-[#F5F5F4] border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D95300] focus:bg-white outline-none transition-all text-[#1C1917]"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-left text-[10px] text-red-500 mt-1 pl-1 font-semibold">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isActivatingAccount}
                className="w-full h-12 bg-[#D95300] hover:bg-[#1C1917] text-white rounded-full font-bold uppercase text-xs tracking-widest mt-2 shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isActivatingAccount ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  "Activate Account"
                )}
              </Button>
            </form>
          </div>

          {/* Right Pane - Info */}
          <div className="w-1/2 h-full bg-[#1C1917] text-white relative flex flex-col items-center justify-center p-12 text-center">
            {/* Shapes inside the Charcoal Panel */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D95300] opacity-20 rotate-45 translate-x-16 -translate-y-16 pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-12 h-12 border-4 border-white/10 rotate-12 pointer-events-none" />
            <div className="absolute top-1/4 right-8 w-4 h-4 bg-white/10 rounded-full pointer-events-none" />

            <div className="relative z-30 max-w-[300px]">
              <h2 className="text-4xl font-extrabold mb-4 text-[#F5F5F4]">
                Activation
              </h2>
              <p className="text-sm opacity-80 mb-8 leading-relaxed text-stone-300">
                Initialize your administrative profile using the credentials and activation PIN generated by the system director.
              </p>
              <div className="w-full space-y-4">
                <div className="text-xs text-stone-400">Already activated your account?</div>
                <Button
                  onClick={() => router.push("/login")}
                  variant="outline"
                  className="w-full py-3 bg-transparent text-white border-2 border-white rounded-full font-bold uppercase text-xs tracking-widest hover:bg-[#D95300] hover:border-[#D95300] transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
