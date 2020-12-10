import React from "react";
import { configure, mount } from "enzyme";
import { expect } from "chai";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import CatList from "../features/cats/CatList";
import { applyMiddleware, createStore } from "redux";
import rootReducer from "../reducer";
import { Provider } from "react-redux";
import Cats from "../features/cats/Cats";
import thunk from "redux-thunk";

configure({ adapter: new Adapter() });

const catPics = [
  { id: 1, url: "www.example.com/cat1" },
  { id: 2, url: "www.example.com/cat2" },
];

describe("Cats", () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = createStore(rootReducer, applyMiddleware(thunk));
    store.dispatch({ type: "cats/catsLoaded", payload: catPics });

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
    expect(wrapper.find(CatList).prop("catPics")).to.eq(catPics);
  });
});
