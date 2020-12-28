import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import catsReducer from "../features/cats/catsSlice";
import Cats from "../features/cats/Cats";

const catPics = [
  { id: 1, url: "www.example.com/cat1" },
  { id: 2, url: "www.example.com/cat2" },
];

beforeEach(() => {
  const store = configureStore({
    reducer: {
      cats: catsReducer,
    },
  });
  store.dispatch({ type: "cats/fetchCats/fulfilled", payload: catPics });

  render(
    <Provider store={store}>
      <Cats />
    </Provider>
  );
});

test("passes catPics from the store down as a prop to CatList", () => {
  expect(screen.queryAllByAltText("cat")).toHaveLength(2);
});
