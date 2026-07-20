"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { ImageUploadField } from "@/components/data-table/image-upload-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadUrl } from "@/lib/http";
import { getApiErrorMessage } from "@/lib/apiError";
import { validateForm, type FieldErrors } from "@/lib/validation";
import { adminProfileSchema, adminChangePasswordSchema } from "@/lib/validations/admin-profile.schema";
import { FieldError } from "@/components/ui/field-error";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { Admin } from "@/types/auth";

function ProfileCard({ admin, onUpdated }: { admin: Admin; onUpdated: (admin: Admin) => void }) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = async (formData: FormData) => {
    const { data, errors: validationErrors } = validateForm(adminProfileSchema, {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
    });
    if (!data) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setIsSaving(true);
    try {
      const updated = await authService.updateProfile({
        name: data.name,
        email: data.email,
        image: imageFile ?? undefined,
      });
      onUpdated(updated);
      setImageFile(null);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update profile"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your name, email, and profile picture.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="max-w-md space-y-4">
          <ImageUploadField
            id="image"
            label="Profile picture"
            existingImageUrl={uploadUrl("admins", admin.image)}
            onFileChange={setImageFile}
          />
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={admin.name}
              aria-invalid={!!errors.name}
              onChange={() => errors.name && setErrors((prev) => ({ ...prev, name: "" }))}
            />
            <FieldError message={errors.name} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={admin.email}
              aria-invalid={!!errors.email}
              onChange={() => errors.email && setErrors((prev) => ({ ...prev, email: "" }))}
            />
            <FieldError message={errors.email} />
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ChangePasswordCard() {
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = async (formData: FormData) => {
    const { data, errors: validationErrors } = validateForm(adminChangePasswordSchema, {
      old_password: String(formData.get("old_password") ?? ""),
      new_password: String(formData.get("new_password") ?? ""),
      confirm_password: String(formData.get("confirm_password") ?? ""),
    });
    if (!data) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setIsSaving(true);
    try {
      await authService.changePassword({ old_password: data.old_password, new_password: data.new_password });
      toast.success("Password changed");
      (document.getElementById("change-password-form") as HTMLFormElement | null)?.reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to change password"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Change your admin panel password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="change-password-form" action={handleSubmit} className="max-w-md space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="old_password">Current password</Label>
            <Input
              id="old_password"
              name="old_password"
              type="password"
              aria-invalid={!!errors.old_password}
              onChange={() => errors.old_password && setErrors((prev) => ({ ...prev, old_password: "" }))}
            />
            <FieldError message={errors.old_password} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new_password">New password</Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              aria-invalid={!!errors.new_password}
              onChange={() => errors.new_password && setErrors((prev) => ({ ...prev, new_password: "" }))}
            />
            <FieldError message={errors.new_password} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">Confirm new password</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              aria-invalid={!!errors.confirm_password}
              onChange={() => errors.confirm_password && setErrors((prev) => ({ ...prev, confirm_password: "" }))}
            />
            <FieldError message={errors.confirm_password} />
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Updating..." : "Change password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const storeAdmin = useAuthStore((state) => state.admin);
  const updateAdmin = useAuthStore((state) => state.updateAdmin);
  const [admin, setAdmin] = useState<Admin | null>(storeAdmin);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result = await authService.getProfile();
        setAdmin(result);
        updateAdmin(result);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load profile"));
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdated = (updated: Admin) => {
    setAdmin(updated);
    updateAdmin(updated);
  };

  if (isLoading || !admin) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="My Profile"
          description="Manage your own admin account."
          breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Profile" }]}
        />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-56 max-w-2xl rounded-xl" />
          <Skeleton className="h-64 max-w-2xl rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Profile"
        description="Manage your own admin account."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Profile" }]}
      />
      <div className="flex flex-col gap-6">
        <ProfileCard admin={admin} onUpdated={handleUpdated} />
        <ChangePasswordCard />
      </div>
    </div>
  );
}
