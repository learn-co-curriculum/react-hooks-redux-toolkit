import { combineReducers } from "redux";
import catsReducer from "./features/cats/catsSlice";

const rootReducer = combineReducers({
  cats: catsReducer,
});

export default rootReducer;
