import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AcademicConfig } from "@/lib/schema";

interface AcademicState {
  academicConfig: AcademicConfig;
  loading: boolean;
  error: string | null;
}

const initialState: AcademicState = {
  academicConfig: {
    departments: [],
    years: [],
    sections: [],
  },
  loading: false,
  error: null,
};

export const fetchAcademicDataThunk = createAsyncThunk(
  "academic/fetchAcademicData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/academic");
      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to fetch");
      return result.data as AcademicConfig;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const modifyAcademicDataThunk = createAsyncThunk(
  "academic/modifyAcademicData",
  async (
    payload: { method: "POST" | "PUT" | "DELETE"; body: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/academic", {
        method: payload.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.body),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Operation failed");
      return result.data as AcademicConfig;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const academicSlice = createSlice({
  name: "academic",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchAcademicDataThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAcademicDataThunk.fulfilled, (state, action: PayloadAction<AcademicConfig>) => {
        state.loading = false;
        state.academicConfig = action.payload;
      })
      .addCase(fetchAcademicDataThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Modify (POST/PUT/DELETE)
      .addCase(modifyAcademicDataThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(modifyAcademicDataThunk.fulfilled, (state, action: PayloadAction<AcademicConfig>) => {
        state.academicConfig = action.payload;
      })
      .addCase(modifyAcademicDataThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default academicSlice.reducer;
