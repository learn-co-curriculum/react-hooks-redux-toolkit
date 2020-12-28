import React from "react";

function CatList({ catPics = [] }) {
  return (
    <div>
      {catPics.map((pic) => (
        <img key={pic.id} src={pic.url} alt="cat" />
      ))}
    </div>
  );
}

export default CatList;
