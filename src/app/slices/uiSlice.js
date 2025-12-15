import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    rightOverlay: { visible: true },
    help: { visible: false },
  },
  reducers: {
    toggleRightOverlay(state) {
      state.rightOverlay.visible = !state.rightOverlay.visible;
    },
    toggleHelp(state) {
      state.help.visible = !state.help.visible;
    },
  },
});

export const { toggleRightOverlay, toggleHelp } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
