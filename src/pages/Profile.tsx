import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../services/api.ts";

export default function Profile() {
  const [user, setUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });
  const [form, setForm] = useState({
    email: user.email || "",
    place: user.place || "",
    gender: user.gender || "",
    age: user.age || "",
    preferredLang: user.preferredLang || "",
    refSource: user.refSource || "",
    referrerInfo: user.referrerInfo || "",
    country: user.country || "",
    profession: user.profession || "",
    address: user.address || "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Call API with all fields, including non-editable ones for backend consistency
      const payload = {
        ...user,
        ...form,
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: user.mobile,
      };
      const updated = await updateUserProfile(payload);
      // Optionally, fetch latest profile from backend
      const refreshed = await getUserProfile();
      setUser(refreshed);
      localStorage.setItem("user", JSON.stringify(refreshed));
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError("Failed to update profile. Please try again.");
    }
    setSaving(false);
  };

  return (
    <Box
      sx={{
        maxWidth: 540,
        mx: "auto",
        mt: 5,
        mb: 5,
        p: 3,
        background: "#fff",
        borderRadius: 4,
        boxShadow: "0 4px 24px rgba(222,107,47,0.08)",
      }}
      component={Paper}
      elevation={3}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64, fontSize: 32 }}>
          {`${(user.firstName?.[0] || "").toUpperCase()}${(user.lastName?.[0] || "").toUpperCase()}`}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <form onSubmit={handleSave}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              value={user.firstName || ""}
              fullWidth
              disabled
              InputProps={{ style: { background: "#f5f5f5" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              value={user.lastName || ""}
              fullWidth
              disabled
              InputProps={{ style: { background: "#f5f5f5" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Mobile"
              value={user.mobile || ""}
              fullWidth
              disabled
              InputProps={{ style: { background: "#f5f5f5" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              type="email"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Place"
              name="place"
              value={form.place}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Age"
              name="age"
              value={form.age}
              onChange={handleChange}
              fullWidth
              type="number"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Preferred Language"
              name="preferredLang"
              value={form.preferredLang}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Reference Source"
              name="refSource"
              value={form.refSource}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Referrer Info"
              name="referrerInfo"
              value={form.referrerInfo}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Country"
              name="country"
              value={form.country}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Profession"
              name="profession"
              value={form.profession}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
            />
          </Grid>
        </Grid>
        {success && <Alert severity="success" sx={{ mt: 3 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={saving}
            sx={{ minWidth: 120, fontWeight: 700 }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
