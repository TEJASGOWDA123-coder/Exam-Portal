import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  identityPrompt: string;
  transformationPrompt: string;
  validationRules: string;
  isActive: boolean;
}

interface SectionState {
  sections: SectionTemplate[];
  loading: boolean;
  error: string | null;
}

const initialState: SectionState = {
  sections: [],
  loading: false,
  error: null,
};

export const fetchSectionsThunk = createAsyncThunk(
  "sections/fetchSections",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await fetch("/api/sections");
      if (!resp.ok) throw new Error("Failed to load sections");
      const data = await resp.json();
      const cleaned = data.map((s: any) => {
        try {
          if (!s.validationRules) return s;
          let parsed = JSON.parse(s.validationRules);
          if (typeof parsed === "string") parsed = JSON.parse(parsed);
          return { ...s, validationRules: JSON.stringify(parsed, null, 2) };
        } catch {
          return s;
        }
      });
      return cleaned as SectionTemplate[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveSectionThunk = createAsyncThunk(
  "sections/saveSection",
  async (payload: { data: Partial<SectionTemplate>; editingId: string | null }, { rejectWithValue }) => {
    try {
      const method = payload.editingId ? "PATCH" : "POST";
      const body = payload.editingId ? { ...payload.data, id: payload.editingId } : payload.data;
      const resp = await fetch("/api/sections", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error("Failed to save section");
      return await resp.json() as SectionTemplate;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteSectionThunk = createAsyncThunk(
  "sections/deleteSection",
  async (id: string, { rejectWithValue }) => {
    try {
      const resp = await fetch(`/api/sections?id=${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("Delete failed");
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const sectionsSlice = createSlice({
  name: "sections",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSectionsThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSectionsThunk.fulfilled, (state, action: PayloadAction<SectionTemplate[]>) => {
        state.loading = false;
        state.sections = action.payload;
      })
      .addCase(fetchSectionsThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(deleteSectionThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.sections = state.sections.filter(s => s.id !== action.payload);
      })
      .addCase(saveSectionThunk.fulfilled, (state, action: PayloadAction<SectionTemplate>) => {
        const idx = state.sections.findIndex(s => s.id === action.payload.id);
        if (idx >= 0) state.sections[idx] = action.payload;
        else state.sections.push(action.payload);
      });
  },
});

export default sectionsSlice.reducer;
