import React from "react";
import { configure, shallow, mount } from "enzyme";
import { expect } from "chai";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import CatList from "../features/cats/CatList";

configure({ adapter: new Adapter() });

describe("<CatList/>", function () {
  const catPics = [
    { id: 1, url: "www.example.com/cat1" },
    { id: 2, url: "www.example.com/cat2" },
  ];
  it("should display the cat pics wrapped in <img> tags", function () {
    const wrapper = shallow(<CatList catPics={catPics} />);
    expect(wrapper.find("img").length).to.equal(2);
  });

  it("should have props catPics", function () {
    const wrapper = mount(<CatList catPics={catPics} />);
    expect(wrapper.props().catPics).to.eq(catPics);
    expect(wrapper.find("img").length).to.eq(2);
  });
});
