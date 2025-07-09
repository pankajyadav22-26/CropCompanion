import { configureStore } from "@reduxjs/toolkit";
import farmerReducer from "./farmerSlice";

export const store = configureStore({
  reducer: {
    farmer: farmerReducer,
  },
});