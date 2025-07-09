import { createSlice } from "@reduxjs/toolkit";

const initialFarmer = JSON.parse(localStorage.getItem("farmer"));

const farmerSlice = createSlice({
  name: "farmer",
  initialState: {
    isLoggedIn: !!initialFarmer,
    farmer: initialFarmer || null,
    token: localStorage.getItem("token") || null,
  },
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.farmer = action.payload.farmer;
      state.token = action.payload.token;

      localStorage.setItem("farmer", JSON.stringify(action.payload.farmer));
      localStorage.setItem("token", action.payload.token);
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.farmer = null;
      state.token = null;

      localStorage.removeItem("farmer");
      localStorage.removeItem("token");
    },
  },
});

export const { login, logout } = farmerSlice.actions;
export default farmerSlice.reducer;