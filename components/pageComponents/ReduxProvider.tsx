"use client";

import { ReactNode, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { fetchExamsThunk, loadStudentFromStorage, fetchResultsThunk, fetchStudentsThunk } from "@/store/slices/examSlice";
import { useSession } from "next-auth/react";

function Setup() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();

  useEffect(() => {
    dispatch(fetchExamsThunk());
    dispatch(loadStudentFromStorage());
  }, [dispatch]);

  useEffect(() => {
    const role = (session?.user as any)?.role;
    if (role === "admin" || role === "superadmin") {
      dispatch(fetchResultsThunk());
      dispatch(fetchStudentsThunk());
    }
  }, [session, dispatch]);

  return null;
}

export function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <Setup />
      {children}
    </Provider>
  );
}
