import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    rightOverlay: { visible: true },
  },
  reducers: {
    toggleRightOverlay(state) {
      state.rightOverlay.visible = !state.rightOverlay.visible;
    },
  },
});

export const { toggleRightOverlay } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
