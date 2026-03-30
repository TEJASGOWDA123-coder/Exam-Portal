import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminState {
  admins: Admin[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  admins: [],
  loading: false,
  error: null,
};

export const fetchAdminsThunk = createAsyncThunk(
  "admins/fetchAdmins",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await fetch("/api/users");
      if (!resp.ok) throw new Error("Failed to fetch admins");
      return await resp.json() as Admin[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addAdminThunk = createAsyncThunk(
  "admins/addAdmin",
  async (payload: { name: string; email: string; password: string; role: string }, { rejectWithValue }) => {
    try {
      const resp = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Failed to add admin");
      }
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAdminThunk = createAsyncThunk(
  "admins/deleteAdmin",
  async (id: string, { rejectWithValue }) => {
    try {
      const resp = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("Failed to delete admin");
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const adminSlice = createSlice({
  name: "admins",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminsThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAdminsThunk.fulfilled, (state, action: PayloadAction<Admin[]>) => {
        state.loading = false;
        state.admins = action.payload;
      })
      .addCase(fetchAdminsThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(deleteAdminThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.admins = state.admins.filter(a => a.id !== action.payload);
      });
  },
});

export default adminSlice.reducer;
