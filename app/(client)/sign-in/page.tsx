"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { checkPhoneRegistration } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { getStoredUtmParameters } from "@/lib/utm";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [needName, setNeedName] = useState(false);
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
      const res = await checkPhoneRegistration(phone);
      if (res.exists && res.hasName) {
        setNeedName(false);
        toast.success(`Welcome back, ${res.name}!`);
      } else {
        setNeedName(true);
        toast.success("Phone number verified. Please set up your profile.");
      }
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
    if (needName && !name) {
      setErrorMessage("Name is required for new users");
      return;
    }
    if (needName && !email) {
      setErrorMessage("Email is required for new users");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const utm = getStoredUtmParameters();
      const result = await signIn("credentials", {
        phone,
        otp,
        name: name || "",
        email: email || "",
        utmSource: utm?.utm_source || "",
        utmCampaign: utm?.utm_campaign || "",
        utmMedium: utm?.utm_medium || "",
        role: "user",
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage(result.error);
        toast.error(result.error);
      } else {
        toast.success("Successfully logged in!");
        router.push("/");
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
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-16 bg-gradient-to-br from-slate-50 via-white to-emerald-50/20">
      <Card className="w-full max-w-md shadow-xl border border-slate-100/80 rounded-2xl bg-white overflow-hidden p-2">
        <CardHeader className="space-y-1.5 pt-6 px-6">
          <CardTitle className="text-2xl font-extrabold tracking-tight text-center text-slate-800">
            Welcome to Meastro Shopcart
          </CardTitle>
          <CardDescription className="text-center text-slate-500 text-xs">
            {step === 1
              ? "Enter your phone number to sign in or sign up"
              : "Enter the verification code to log in"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {errorMessage && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 mb-4 text-xs text-red-600 font-semibold text-center animate-shake">
              {errorMessage}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-bold text-slate-700">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g. +1234567890"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border-slate-200/80 rounded-xl focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 py-2.5 text-sm"
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-emerald-900/10 cursor-pointer active:scale-98 transition-all duration-200" disabled={loading}>
                {loading ? "Verifying..." : "Continue"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {needName && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold text-slate-700">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border-slate-200/80 rounded-xl focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 py-2.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border-slate-200/80 rounded-xl focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 py-2.5 text-sm"
                    />
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="otp" className="text-xs font-bold text-slate-700">6-Digit Verification Code</Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  placeholder="Any 6 digits (e.g. 123456)"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-slate-50 border-slate-200/80 rounded-xl focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 py-2.5 text-sm text-center tracking-widest font-mono text-lg"
                />
                <span className="text-[10px] text-emerald-600 block text-right mt-1 font-semibold">
                  💡 OTP bypass active. Enter any 6 digits to log in.
                </span>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/3 border-slate-200 rounded-xl font-bold py-2.5 text-slate-500 hover:bg-slate-50"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-emerald-900/10 cursor-pointer active:scale-98 transition-all duration-200" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
