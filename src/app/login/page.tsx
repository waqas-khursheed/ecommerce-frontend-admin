"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import { Zap } from "lucide-react";

import { authService } from "@/services";
import { useAuthStore } from "@/store/auth.store";
import type { ApiErrorResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { validateForm, type FieldErrors } from "@/lib/validation";
import { loginSchema } from "@/lib/validations/auth.schema";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data, errors } = validateForm(loginSchema, { email, password });
    if (!data) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const result = await authService.login(data);
      setSession(result.admin, result.token);
      router.push("/dashboard");
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.message ?? "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="size-5" fill="currentColor" />
          </div>
          <CardTitle className="text-xl">Admin Login</CardTitle>
          <CardDescription>Sign in to manage your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                aria-invalid={!!fieldErrors.email}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="superadmin@admin.com"
              />
              <FieldError message={fieldErrors.email} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                aria-invalid={!!fieldErrors.password}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                }}
              />
              <FieldError message={fieldErrors.password} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
