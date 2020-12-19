import React from "react";
import { configure, mount } from "enzyme";
import { expect } from "chai";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { applyMiddleware, createStore, combineReducers } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";

import Cats from "../features/cats/Cats";
import CatList from "../features/cats/CatList";
import catsReducer from "../features/cats/catsSlice";

configure({ adapter: new Adapter() });

const catPics = [
  { id: 1, url: "www.example.com/cat1" },
  { id: 2, url: "www.example.com/cat2" },
];

describe("Cats", () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = createStore(
      combineReducers({ cats: catsReducer }),
      applyMiddleware(thunk)
    );
    store.dispatch({ type: "cats/catAdded", payload: catPics[0] });
    store.dispatch({ type: "cats/catAdded", payload: catPics[1] });

    wrapper = mount(
      <Provider store={store}>
        <Cats />
      </Provider>
    );
  });

  it("renders the CatList component as a child", () => {
    expect(wrapper.find(CatList).length).to.eq(1);
  });

  it("passes catPics from the store passed as a prop to CatList", () => {
    expect(wrapper.find(CatList).props().catPics).to.exist;
    expect(wrapper.find(CatList).prop("catPics")).to.eql(catPics);
  });
});
