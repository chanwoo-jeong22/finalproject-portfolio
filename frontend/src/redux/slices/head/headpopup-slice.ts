import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import React from "react";

interface HeadPopupState {
  isOpen: boolean;
  content: React.ReactNode | null;  // 팝업에 표시할 React 요소 또는 null
}

const initialState: HeadPopupState = {
  isOpen: false,
  content: null,
};

const headPopupSlice = createSlice({
  name: "headPopup",
  initialState,
  reducers: {
    openPopup(state, action: PayloadAction<React.ReactNode | null>) {
      state.isOpen = true;
      state.content = action.payload;
    },
    closePopup(state) {
      state.isOpen = false;
      state.content = null;
    },
  },
});

export const { openPopup, closePopup } = headPopupSlice.actions;

export default headPopupSlice.reducer;
