"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Database,
  Mail,
  Palette,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";

interface SystemSettings {
  system_name: string;
  system_description: string;
  admin_email: string;
  timezone: string;
  date_format: string;
  language: string;
  theme: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  task_reminders: boolean;
  system_alerts: boolean;
  digest_frequency: string;
}

interface SecuritySettings {
  password_min_length: number;
  session_timeout: number;
  max_login_attempts: number;
  require_2fa: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    system_name: "Claude Code - School Management System",
    system_description: "A comprehensive school management and task tracking system",
    admin_email: "admin@school-system.com",
    timezone: "Asia/Jakarta",
    date_format: "DD/MM/YYYY",
    language: "en",
    theme: "light"
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    task_reminders: true,
    system_alerts: true,
    digest_frequency: "daily"
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    password_min_length: 6,
    session_timeout: 30,
    max_login_attempts: 5,
    require_2fa: false
  });

  const handleSaveSystemSettings = async () => {
    setSaving(true);
    try {
      // Mock API call - in real app, this would save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("System settings saved successfully");
    } catch (error) {
      toast.error("Failed to save system settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Notification settings saved successfully");
    } catch (error) {
      toast.error("Failed to save notification settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecuritySettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Security settings saved successfully");
    } catch (error) {
      toast.error("Failed to save security settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "database", label: "Database", icon: Database },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure system preferences and security settings</p>
      </div>

      {/* Settings Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="system_name">System Name</Label>
                  <Input
                    id="system_name"
                    value={systemSettings.system_name}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      system_name: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_email">Admin Email</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    value={systemSettings.admin_email}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      admin_email: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="system_description">System Description</Label>
                <Textarea
                  id="system_description"
                  rows={3}
                  value={systemSettings.system_description}
                  onChange={(e) => setSystemSettings(prev => ({
                    ...prev,
                    system_description: e.target.value
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select 
                    value={systemSettings.timezone} 
                    onValueChange={(value) => setSystemSettings(prev => ({
                      ...prev,
                      timezone: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                      <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                      <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select 
                    value={systemSettings.date_format} 
                    onValueChange={(value) => setSystemSettings(prev => ({
                      ...prev,
                      date_format: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select 
                    value={systemSettings.language} 
                    onValueChange={(value) => setSystemSettings(prev => ({
                      ...prev,
                      language: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="id">Bahasa Indonesia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveSystemSettings} disabled={saving}>
                  {saving && <Spinner size="sm" className="mr-2" />}
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive email notifications for system events</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.email_notifications}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      email_notifications: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Task Reminders</Label>
                    <p className="text-sm text-gray-600">Get reminders for upcoming task deadlines</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.task_reminders}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      task_reminders: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">System Alerts</Label>
                    <p className="text-sm text-gray-600">Receive alerts for system maintenance and updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.system_alerts}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      system_alerts: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Digest Frequency</Label>
                <Select 
                  value={notificationSettings.digest_frequency} 
                  onValueChange={(value) => setNotificationSettings(prev => ({
                    ...prev,
                    digest_frequency: value
                  }))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveNotificationSettings} disabled={saving}>
                  {saving && <Spinner size="sm" className="mr-2" />}
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password_min_length">Minimum Password Length</Label>
                  <Input
                    id="password_min_length"
                    type="number"
                    min="4"
                    max="50"
                    value={securitySettings.password_min_length}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      password_min_length: parseInt(e.target.value)
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    min="5"
                    max="480"
                    value={securitySettings.session_timeout}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      session_timeout: parseInt(e.target.value)
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    min="3"
                    max="10"
                    value={securitySettings.max_login_attempts}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      max_login_attempts: parseInt(e.target.value)
                    }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Require Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600">Force all users to enable 2FA for enhanced security</p>
                </div>
                <input
                  type="checkbox"
                  checked={securitySettings.require_2fa}
                  onChange={(e) => setSecuritySettings(prev => ({
                    ...prev,
                    require_2fa: e.target.checked
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveSecuritySettings} disabled={saving}>
                  {saving && <Spinner size="sm" className="mr-2" />}
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Database Settings */}
      {activeTab === "database" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Shield className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Database operations are sensitive
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Please be careful when performing database operations. Always backup your data first.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Backup Database</h4>
                    <p className="text-sm text-gray-600 mb-4">Create a backup of the current database</p>
                    <Button variant="outline" className="w-full">
                      Create Backup
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Restore Database</h4>
                    <p className="text-sm text-gray-600 mb-4">Restore database from a backup file</p>
                    <Button variant="outline" className="w-full">
                      Restore Backup
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Clear Cache</h4>
                    <p className="text-sm text-gray-600 mb-4">Clear application cache and temporary files</p>
                    <Button variant="outline" className="w-full">
                      Clear Cache
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Database Status</h4>
                    <p className="text-sm text-gray-600 mb-4">Check database connection and health</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Connected</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}