import { configureStore } from "@reduxjs/toolkit";
import examReducer from "./slices/examSlice";
import academicReducer from "./slices/academicSlice";
import adminReducer from "./slices/adminSlice";
import sebReducer from "./slices/sebSlice";
import sectionsReducer from "./slices/sectionsSlice";

export const store = configureStore({
  reducer: {
    exam: examReducer,
    academic: academicReducer,
    admins: adminReducer,
    seb: sebReducer,
    sections: sectionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
