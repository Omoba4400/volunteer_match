import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ProfileEdit = () => {
  const { user, volunteerProfile, organizationProfile, updateVolunteerProfile, updateOrganizationProfile, updateEmail, updatePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [location, setLocation] = useState(
    user?.role === "volunteer" 
      ? volunteerProfile?.location || ""
      : organizationProfile?.location || ""
  );
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Handle email update
  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    try {
      await updateEmail(email, currentPassword);
      setCurrentPassword("");
    } catch (error) {
      // Error is handled in the context
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords don't match");
      return;
    }

    try {
      await updatePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      // Error is handled in the context
    }
  };

  // Handle location update
  const handleLocationUpdate = async () => {
    try {
      if (user?.role === "volunteer" && volunteerProfile) {
        await updateVolunteerProfile({
          ...volunteerProfile,
          location
        });
      } else if (user?.role === "organization" && organizationProfile) {
        await updateOrganizationProfile({
          ...organizationProfile,
          location
        });
      }
      toast.success("Location updated successfully!");
    } catch (error) {
      // Error is handled in the context
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(deleteConfirmPassword);
      navigate("/");
    } catch (error) {
      // Error is handled in the context
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your account settings and profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Update Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Update Email</h3>
              <form onSubmit={handleEmailUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">New Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentPasswordEmail">Current Password</Label>
                  <Input
                    id="currentPasswordEmail"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <Button type="submit">Update Email</Button>
              </form>
            </div>

            {/* Password Update Section */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-medium">Update Password</h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
                <Button type="submit">Update Password</Button>
              </form>
            </div>

            {/* Location Update Section */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-medium">Update Location</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State"
                  />
                </div>
                <Button onClick={handleLocationUpdate}>Update Location</Button>
              </div>
            </div>

            {/* Delete Account Section */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-medium text-red-600">Delete Account</h3>
              <p className="text-sm text-gray-600">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button 
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delete Account Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="deleteConfirmPassword">Enter your password to confirm</Label>
                <Input
                  id="deleteConfirmPassword"
                  type="password"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteConfirmPassword("")}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default ProfileEdit; 