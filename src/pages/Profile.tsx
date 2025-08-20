import React, { useState, useEffect } from "react";
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
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../services/api.ts";

interface UserProfile {
  _id?: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  email?: string;
  place?: string;
  gender?: string;
  age?: number;
  preferredLang?: string;
  refSource?: string;
  referrerInfo?: string;
  country?: string;
  profession?: string;
  address?: string;
}

interface FormData {
  email: string;
  place: string;
  gender: string;
  age: string;
  preferredLang: string;
  refSource: string;
  referrerInfo: string;
  country: string;
  profession: string;
  address: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile>({});
  const [form, setForm] = useState<FormData>({
    email: "",
    place: "",
    gender: "",
    age: "",
    preferredLang: "",
    refSource: "",
    referrerInfo: "",
    country: "",
    profession: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeProfile = () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userData);
        setForm({
          email: userData.email || "",
          place: userData.place || "",
          gender: userData.gender || "",
          age: userData.age?.toString() || "",
          preferredLang: userData.preferredLang || "",
          refSource: userData.refSource || "",
          referrerInfo: userData.referrerInfo || "",
          country: userData.country || "",
          profession: userData.profession || "",
          address: userData.address || "",
        });
      } catch {
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    initializeProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const payload = {
        ...user,
        ...form,
        age: form.age ? parseInt(form.age) : undefined,
      };
      
      await updateUserProfile(payload);
      const refreshed = await getUserProfile();
      setUser(refreshed);
      localStorage.setItem("user", JSON.stringify(refreshed));
      setSuccess("Profile updated successfully!");
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 } }}>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          boxShadow: "0 4px 24px rgba(222,107,47,0.08)",
        }}
        elevation={2}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
          <Avatar 
            sx={{ 
              bgcolor: "#de6b2f", 
              width: { xs: 56, sm: 64 }, 
              height: { xs: 56, sm: 64 }, 
              fontSize: { xs: 24, sm: 32 },
              fontWeight: 700
            }}
          >
            {`${(user.firstName?.[0] || "").toUpperCase()}${(user.lastName?.[0] || "").toUpperCase()}`}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {user.email || 'No email provided'}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <form onSubmit={handleSave}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                label="First Name"
                value={user.firstName || ""}
                fullWidth
                disabled
                sx={{ '& .MuiInputBase-input.Mui-disabled': { backgroundColor: '#f8f9fa' } }}
              />
              <TextField
                label="Last Name"
                value={user.lastName || ""}
                fullWidth
                disabled
                sx={{ '& .MuiInputBase-input.Mui-disabled': { backgroundColor: '#f8f9fa' } }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                label="Mobile"
                value={user.mobile || ""}
                fullWidth
                disabled
                sx={{ '& .MuiInputBase-input.Mui-disabled': { backgroundColor: '#f8f9fa' } }}
              />
              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                type="email"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                label="Place"
                name="place"
                value={form.place}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                label="Age"
                name="age"
                value={form.age}
                onChange={handleChange}
                fullWidth
                type="number"
                inputProps={{ min: 1, max: 120 }}
              />
              <TextField
                label="Preferred Language"
                name="preferredLang"
                value={form.preferredLang}
                onChange={handleChange}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                label="Reference Source"
                name="refSource"
                value={form.refSource}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Referrer Info"
                name="referrerInfo"
                value={form.referrerInfo}
                onChange={handleChange}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                label="Country"
                name="country"
                value={form.country}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Profession"
                name="profession"
                value={form.profession}
                onChange={handleChange}
                fullWidth
              />
            </Box>
            <TextField
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
            />
          </Box>
          
          {success && <Alert severity="success" sx={{ mt: 3, mx: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 3, mx: 2 }}>{error}</Alert>}
          
          <Box sx={{ mt: 4, display: "flex", justifyContent: { xs: 'center', sm: 'flex-end' }, gap: 2, flexDirection: { xs: 'column', sm: 'row' }, px: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={saving}
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                borderColor: '#de6b2f',
                color: '#de6b2f',
                '&:hover': { borderColor: '#b45309', backgroundColor: 'rgba(222, 107, 47, 0.04)' }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={saving}
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                minWidth: { sm: 140 },
                fontWeight: 700,
                backgroundColor: '#de6b2f',
                '&:hover': { backgroundColor: '#b45309' }
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}