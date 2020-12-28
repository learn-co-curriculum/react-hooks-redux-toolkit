import React from "react";
import { render, screen } from "@testing-library/react";
import CatList from "../features/cats/CatList";

const catPics = [
  { id: 1, url: "www.example.com/cat1" },
  { id: 2, url: "www.example.com/cat2" },
];

test("renders each cat pic in a <img> tag with an alt prop of 'cat'", function () {
  render(<CatList catPics={catPics} />);
  expect(screen.queryAllByAltText("cat")).toHaveLength(2);
});
