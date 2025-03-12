"use client"

import { useState } from "react"
import { User, Key, Shield, Clock, LogOut, Edit, Save, X, CheckCircle, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { cn } from "@/lib/utils"

export default function AccountPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [editMode, setEditMode] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Mock user data - in a real app, this would come from your authentication system
  const [userData, setUserData] = useState({
    username: "user123",
    email: "user@example.com",
    joinDate: "January 15, 2023",
    subscriptionType: "Premium",
    subscriptionStatus: "Active",
    subscriptionExpiry: "December 31, 2023",
    licenseKey: "LUAU-XXXX-XXXX-XXXX",
    twoFactorEnabled: false,
    emailNotifications: true,
    updateNotifications: true,
  })

  // Recent activity data
  const recentActivity = [
    { action: "Login", date: "Today, 10:23 AM", ip: "192.168.1.1" },
    { action: "Script Execution", date: "Yesterday, 3:45 PM", ip: "192.168.1.1" },
    { action: "Download", date: "Oct 15, 2023, 2:30 PM", ip: "192.168.1.1" },
    { action: "Password Changed", date: "Oct 10, 2023, 11:15 AM", ip: "192.168.1.1" },
  ]

  const handleSaveProfile = () => {
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
      setEditMode(false)
    }, 2000)
  }

  const handleLogout = () => {
    router.push("/login")
  }

  const navigationItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "subscription", label: "Subscription", icon: Key },
    { id: "security", label: "Security", icon: Shield },
    { id: "activity", label: "Activity", icon: Clock },
  ]

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64">
            <div className="bg-[#121212] rounded-lg p-4 flex flex-col h-full">
              {/* Avatar and User Info */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-16 w-16 rounded-full bg-[#1a237e] flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-white/80" />
                </div>
                <h2 className="text-base font-medium text-white">{userData.username}</h2>
                <p className="text-sm text-gray-400 mb-2">{userData.email}</p>
                <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                  {userData.subscriptionType}
                </span>
              </div>

              {/* Navigation */}
              <div className="flex-1 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                        activeTab === item.id ? "bg-white text-black" : "text-gray-400 hover:text-white",
                      )}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </button>
                  )
                })}
              </div>

              {/* Logout Button */}
              <Button variant="destructive" className="w-full mt-4 bg-red-500 hover:bg-red-600" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Main Content - keeping the rest of your existing content sections */}
          <div className="flex-1">
            {/* ... Your existing tab content remains the same ... */}
            {activeTab === "profile" && (
              <Card className="bg-[#121212] border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Profile Information</CardTitle>
                    <CardDescription className="text-gray-400">Manage your account details</CardDescription>
                  </div>
                  {!editMode ? (
                    <Button variant="outline" onClick={() => setEditMode(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button variant="outline" className="text-red-500" onClick={() => setEditMode(false)}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button variant="default" className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveProfile}>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {saveSuccess && (
                    <div className="bg-green-900/30 border border-green-800 text-green-300 p-3 rounded-md flex items-center mb-4">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Profile updated successfully!
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-300">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={userData.username}
                        onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                        disabled={!editMode}
                        className="bg-[#1a1a1a] border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        disabled={!editMode}
                        className="bg-[#1a1a1a] border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Notification Preferences</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications" className="text-gray-400 cursor-pointer">
                          Email Notifications
                        </Label>
                        <Switch
                          id="email-notifications"
                          checked={userData.emailNotifications}
                          onCheckedChange={(checked) => setUserData({ ...userData, emailNotifications: checked })}
                          disabled={!editMode}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="update-notifications" className="text-gray-400 cursor-pointer">
                          Update Notifications
                        </Label>
                        <Switch
                          id="update-notifications"
                          checked={userData.updateNotifications}
                          onCheckedChange={(checked) => setUserData({ ...userData, updateNotifications: checked })}
                          disabled={!editMode}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-gray-400 text-sm">
                      Member since: <span className="text-gray-300">{userData.joinDate}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "subscription" && (
              <Card className="bg-[#121212] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Subscription Details</CardTitle>
                  <CardDescription className="text-gray-400">Manage your subscription and license</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-white">Current Plan</h3>
                        <p className="text-gray-400">{userData.subscriptionType}</p>
                      </div>
                      <Badge className={userData.subscriptionStatus === "Active" ? "bg-green-600" : "bg-red-600"}>
                        {userData.subscriptionStatus}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Renewal Date</span>
                        <span className="text-gray-300">{userData.subscriptionExpiry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Billing Cycle</span>
                        <span className="text-gray-300">Monthly</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4">License Key</h3>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={userData.licenseKey}
                        readOnly
                        className="bg-[#252525] border-gray-700 text-white font-mono"
                      />
                      <Button variant="outline" className="shrink-0">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      This license key is tied to your account. Do not share it with others.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 flex-1">Upgrade Plan</Button>
                    <Button variant="outline" className="flex-1">
                      Manage Billing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <Card className="bg-[#121212] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Security Settings</CardTitle>
                  <CardDescription className="text-gray-400">Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">Change Password</h3>
                        <p className="text-gray-400 text-sm">Update your password regularly for better security</p>
                      </div>
                      <Button variant="outline">Change</Button>
                    </div>
                    <Separator className="bg-gray-800" />
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">Two-Factor Authentication</h3>
                        <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                      </div>
                      <Switch
                        checked={userData.twoFactorEnabled}
                        onCheckedChange={(checked) => setUserData({ ...userData, twoFactorEnabled: checked })}
                      />
                    </div>
                    <Separator className="bg-gray-800" />
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">Session Management</h3>
                        <p className="text-gray-400 text-sm">Manage your active sessions</p>
                      </div>
                      <Button variant="outline">View</Button>
                    </div>
                  </div>

                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mt-6">
                    <h3 className="text-lg font-medium text-red-300 mb-2">Danger Zone</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "activity" && (
              <Card className="bg-[#121212] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-gray-400">Track your account activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-white">{activity.action}</h3>
                            <p className="text-gray-400 text-sm">{activity.date}</p>
                          </div>
                          <Badge variant="outline" className="bg-blue-900/20 text-blue-300 border-blue-800">
                            {activity.ip}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

