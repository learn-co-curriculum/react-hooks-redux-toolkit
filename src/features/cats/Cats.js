import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import CatList from "./CatList";
import { fetchCats } from "./catsSlice";

function Cats() {
  const catPics = useSelector((state) => state.cats.entities);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCats());
  }, [dispatch]);

  return (
    <div className="App">
      <h1>CatBook</h1>
      <CatList catPics={catPics} />
    </div>
  );
}

export default Cats;
