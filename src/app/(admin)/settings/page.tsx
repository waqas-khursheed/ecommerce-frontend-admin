"use client";

import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage global store configuration."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
      />

      <Tabs defaultValue="general" className="max-w-2xl">
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
              <div className="space-y-1.5">
                <Label htmlFor="site-name">Site name</Label>
                <Input id="site-name" defaultValue="Ecommerce Co." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="site-email">Support email</Label>
                  <Input id="site-email" defaultValue="support@ecommerce.test" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="site-phone">Phone</Label>
                  <Input id="site-phone" defaultValue="+1 (555) 010-2020" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="site-currency">Default currency</Label>
                <Input id="site-currency" defaultValue="USD" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Maintenance mode</p>
                  <p className="text-xs text-muted-foreground">Temporarily disable the storefront</p>
                </div>
                <Switch />
              </div>
              <Button onClick={() => toast.success("Settings saved")}>Save changes</Button>
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
                <Label htmlFor="meta-title">Meta title</Label>
                <Input id="meta-title" defaultValue="Ecommerce Co. — Shop the latest collection" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meta-description">Meta description</Label>
                <Textarea id="meta-description" rows={3} defaultValue="Discover the latest apparel collections with fast shipping and easy returns." />
              </div>
              <Button onClick={() => toast.success("Settings saved")}>Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Shown in the storefront footer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="facebook">Facebook</Label>
                <Input id="facebook" placeholder="https://facebook.com/yourstore" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" placeholder="https://instagram.com/yourstore" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="twitter">X (Twitter)</Label>
                <Input id="twitter" placeholder="https://x.com/yourstore" />
              </div>
              <Button onClick={() => toast.success("Settings saved")}>Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
