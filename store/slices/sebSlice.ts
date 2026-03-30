import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface SebConfig {
  id: string;
  name: string;
  configData: string;
  isActive: boolean;
  createdAt: string;
}

interface SebState {
  configs: SebConfig[];
  loading: boolean;
  error: string | null;
}

const initialState: SebState = {
  configs: [],
  loading: false,
  error: null,
};

export const fetchSebConfigsThunk = createAsyncThunk(
  "seb/fetchConfigs",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await fetch("/api/admin/seb");
      if (!resp.ok) throw new Error("Failed to fetch SEB configs");
      return await resp.json() as SebConfig[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const uploadSebConfigThunk = createAsyncThunk(
  "seb/uploadConfig",
  async (payload: { name: string; configData: string }, { rejectWithValue }) => {
    try {
      const resp = await fetch("/api/admin/seb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Upload failed");
      }
      return await resp.json() as SebConfig;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteSebConfigThunk = createAsyncThunk(
  "seb/deleteConfig",
  async (id: string, { rejectWithValue }) => {
    try {
      const resp = await fetch(`/api/admin/seb?id=${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("Failed to delete configuration");
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const sebSlice = createSlice({
  name: "seb",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSebConfigsThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSebConfigsThunk.fulfilled, (state, action: PayloadAction<SebConfig[]>) => {
        state.loading = false;
        state.configs = action.payload;
      })
      .addCase(fetchSebConfigsThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(uploadSebConfigThunk.fulfilled, (state, action: PayloadAction<SebConfig>) => {
        state.configs.push(action.payload);
      })
      .addCase(deleteSebConfigThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.configs = state.configs.filter(c => c.id !== action.payload);
      });
  },
});

export default sebSlice.reducer;
