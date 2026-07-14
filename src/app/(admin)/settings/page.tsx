"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { ImageUploadField } from "@/components/data-table/image-upload-field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { uploadUrl } from "@/lib/http";
import { getApiErrorMessage } from "@/lib/apiError";
import { webSettingService } from "@/services/setting.service";
import type { WebSetting } from "@/types/setting";

export default function SettingsPage() {
  const [data, setData] = useState<WebSetting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mainLogoFile, setMainLogoFile] = useState<File | null>(null);
  const [favIconFile, setFavIconFile] = useState<File | null>(null);
  const [paymentLogoFile, setPaymentLogoFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await webSettingService.get();
        setData(result);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load settings"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true);
    const payload = new FormData();
    const textFields = [
      "website_name",
      "website_link",
      "address",
      "email",
      "phone_one",
      "phone_two",
      "copyright",
      "footer_widget_1",
      "footer_widget_2",
      "footer_widget_3",
      "footer_widget_4",
      "delivery_days",
      "delivery_start_time",
      "delivery_end_time",
      "min_amount_for_free_delivery",
      "shipping_rate",
      "meta_keywords",
      "meta_description",
    ];
    for (const field of textFields) {
      payload.append(field, String(formData.get(field) ?? ""));
    }
    payload.append("location_mod", formData.get("location_mod") ? "1" : "0");
    payload.append("delivery_days_time_mod", formData.get("delivery_days_time_mod") ? "1" : "0");
    payload.append("footer_payment_logo_mod", formData.get("footer_payment_logo_mod") ? "1" : "0");
    if (mainLogoFile) payload.append("main_logo", mainLogoFile);
    if (favIconFile) payload.append("fav_icon", favIconFile);
    if (paymentLogoFile) payload.append("payment_logo", paymentLogoFile);

    try {
      const updated = await webSettingService.update(payload);
      setData(updated);
      setMainLogoFile(null);
      setFavIconFile(null);
      setPaymentLogoFile(null);
      toast.success("Settings saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save settings"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage global store configuration."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
      />

      <form action={handleSubmit} className="max-w-2xl space-y-4">
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Store Details</CardTitle>
                <CardDescription>Basic information shown across the storefront.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <ImageUploadField id="main_logo" label="Main Logo" existingImageUrl={uploadUrl("settings", data?.main_logo ?? undefined)} onFileChange={setMainLogoFile} />
                  <ImageUploadField id="fav_icon" label="Favicon" existingImageUrl={uploadUrl("settings", data?.fav_icon ?? undefined)} onFileChange={setFavIconFile} />
                  <ImageUploadField id="payment_logo" label="Payment Logo" existingImageUrl={uploadUrl("settings", data?.payment_logo ?? undefined)} onFileChange={setPaymentLogoFile} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="website_name">Site name</Label>
                  <Input id="website_name" name="website_name" defaultValue={data?.website_name ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="website_link">Website URL</Label>
                  <Input id="website_link" name="website_link" defaultValue={data?.website_link ?? ""} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Support email</Label>
                    <Input id="email" name="email" defaultValue={data?.email ?? ""} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone_one">Phone (primary)</Label>
                    <Input id="phone_one" name="phone_one" defaultValue={data?.phone_one ?? ""} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone_two">Phone (secondary)</Label>
                    <Input id="phone_two" name="phone_two" defaultValue={data?.phone_two ?? ""} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="copyright">Copyright text</Label>
                    <Input id="copyright" name="copyright" defaultValue={data?.copyright ?? ""} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" name="address" rows={2} defaultValue={data?.address ?? ""} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="footer_widget_1">Footer widget 1</Label>
                    <Input id="footer_widget_1" name="footer_widget_1" defaultValue={data?.footer_widget_1 ?? ""} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="footer_widget_2">Footer widget 2</Label>
                    <Input id="footer_widget_2" name="footer_widget_2" defaultValue={data?.footer_widget_2 ?? ""} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="footer_widget_3">Footer widget 3</Label>
                    <Input id="footer_widget_3" name="footer_widget_3" defaultValue={data?.footer_widget_3 ?? ""} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="footer_widget_4">Footer widget 4</Label>
                    <Input id="footer_widget_4" name="footer_widget_4" defaultValue={data?.footer_widget_4 ?? ""} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="delivery_days">Delivery days</Label>
                  <Input id="delivery_days" name="delivery_days" defaultValue={data?.delivery_days ?? ""} placeholder="Mon-Fri" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="delivery_start_time">Delivery start time</Label>
                    <Input id="delivery_start_time" name="delivery_start_time" type="time" defaultValue={data?.delivery_start_time ?? ""} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="delivery_end_time">Delivery end time</Label>
                    <Input id="delivery_end_time" name="delivery_end_time" type="time" defaultValue={data?.delivery_end_time ?? ""} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="min_amount_for_free_delivery">Min. amount for free delivery</Label>
                    <Input id="min_amount_for_free_delivery" name="min_amount_for_free_delivery" type="number" defaultValue={data?.min_amount_for_free_delivery ?? 0} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="shipping_rate">Shipping rate</Label>
                    <Input id="shipping_rate" name="shipping_rate" type="number" defaultValue={data?.shipping_rate ?? 0} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox name="location_mod" defaultChecked={data?.location_mod === 1} />
                    Location-based delivery restrictions enabled
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox name="delivery_days_time_mod" defaultChecked={data?.delivery_days_time_mod !== 0} />
                    Enforce delivery days/time window
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox name="footer_payment_logo_mod" defaultChecked={data?.footer_payment_logo_mod !== 0} />
                    Show payment logo in footer
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>Default meta tags for search engines.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="meta_keywords">Meta keywords</Label>
                  <Textarea id="meta_keywords" name="meta_keywords" rows={2} defaultValue={data?.meta_keywords ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="meta_description">Meta description</Label>
                  <Textarea id="meta_description" name="meta_description" rows={3} defaultValue={data?.meta_description ?? ""} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Shown in the storefront footer.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The backend&apos;s <code>web_settings</code> table has no social-link columns yet
                  (checked <code>WebSetting.js</code> and its migration — there&apos;s no
                  facebook/instagram/twitter field). This tab is a placeholder until those columns
                  and validation are added on the backend; nothing here is wired up.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</Button>
      </form>
    </div>
  );
}
