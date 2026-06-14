"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { checkPhoneRegistration } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setErrorMessage("Phone number is required");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await checkPhoneRegistration(phone);
      // For admin, we proceed straight to OTP step
      toast.success("Phone number verified. Proceed with OTP.");
      setStep(2);
    } catch (err) {
      console.error(err);
      setErrorMessage("Something went wrong verifying your phone.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setErrorMessage("OTP is required");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const result = await signIn("credentials", {
        phone,
        otp,
        role: "admin",
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage(result.error);
        toast.error(result.error);
      } else {
        toast.success("Welcome to Admin Panel!");
        router.push("/admin");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error(err);
      const error = err as Error;
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-slate-900 text-slate-100">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 shadow-2xl text-slate-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center text-emerald-400">
            Admin Panel Login
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            Secure sign-in for administrative staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="rounded-lg bg-red-900/50 border border-red-700 p-3 mb-4 text-sm text-red-200 font-medium text-center">
              {errorMessage}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300">Admin Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g. +1234567890"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500 focus-visible:ring-emerald-500"
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold" disabled={loading}>
                {loading ? "Checking..." : "Verify Phone"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-slate-300">OTP (6-Digit Code)</Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  placeholder="Any 6-digit number"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500 focus-visible:ring-emerald-500"
                />
                <span className="text-xs text-slate-400 block text-right mt-1">
                  💡 OTP bypass active. Type any 6 digits.
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/3 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold" disabled={loading}>
                  {loading ? "Authorizing..." : "Verify & Login"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
