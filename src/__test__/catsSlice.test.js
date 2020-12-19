import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { expect } from "chai";
import nock from "nock";
import fetch from "isomorphic-fetch";
import catsReducer, {
  fetchCats,
  catAdded,
  catUpdated,
} from "../features/cats/catsSlice";

// change to redux thunk
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const catPics = [
  { url: "www.example.com/cat1" },
  { url: "www.example.com/cat2" },
];

describe("async actions", () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('uses redux and thunk to create an action object with type of "cats/fetchCats/fulfilled" and a payload of cat images', async () => {
    window.fetch = fetch;

    nock("https://learn-co-curriculum.github.io")
      .get("/cat-api/cats.json")
      .reply(200, {
        images: [
          { url: "www.example.com/cat1" },
          { url: "www.example.com/cat2" },
        ],
      });

    const expectedActions = [
      { type: "cats/fetchCats/pending" },
      { type: "cats/fetchCats/fulfilled", payload: catPics },
    ];

    const store = mockStore({});
    await store.dispatch(fetchCats());
    await sleep(2000);
    const actions = store.getActions();
    expect(actions[0].type).to.eql(expectedActions[0].type);
    expect(actions[1].type).to.eql(expectedActions[1].type);
    expect(actions[1].payload).to.eql(expectedActions[1].payload);
  });
});

describe("sync actions", () => {
  it("catAdded() should return the correct object", () => {
    expect(catAdded({ id: 1, url: "www.example.com/cat1" })).to.eql({
      type: "cats/catAdded",
      payload: { id: 1, url: "www.example.com/cat1" },
    });
  });
  it("catUpdated() should return the correct object", () => {
    expect(catUpdated({ id: 1, url: "www.example.com/cat2" })).to.eql({
      type: "cats/catUpdated",
      payload: { id: 1, url: "www.example.com/cat2" },
    });
  });
});

describe("catsReducer()", () => {
  it("should return the initial state", () => {
    expect(catsReducer(undefined, {})).to.eql({ status: "idle", entities: [] });
  });

  it("should handle the 'cats/catAdded' action", () => {
    expect(
      catsReducer(undefined, {
        type: "cats/catAdded",
        payload: { id: 1, url: "www.example.com/cat1" },
      })
    ).to.eql({
      status: "idle",
      entities: [{ id: 1, url: "www.example.com/cat1" }],
    });
  });

  it("should handle the 'cats/catUpdated' action", () => {
    expect(
      catsReducer(
        {
          status: "idle",
          entities: [{ id: 1, url: "www.example.com/cat1" }],
        },
        {
          type: "cats/catUpdated",
          payload: { id: 1, url: "www.example.com/cat2" },
        }
      )
    ).to.eql({
      status: "idle",
      entities: [{ id: 1, url: "www.example.com/cat2" }],
    });
  });

  it("should handle the 'cats/fetchCats/pending' action", () => {
    expect(
      catsReducer(undefined, {
        type: "cats/fetchCats/pending",
      })
    ).to.eql({ status: "loading", entities: [] });
  });

  it("should handle the 'cats/fetchCats/fulfilled' action", () => {
    const catPics = [
      { url: "www.example.com/cat1" },
      { url: "www.example.com/cat2" },
    ];
    expect(
      catsReducer(undefined, {
        type: "cats/fetchCats/fulfilled",
        payload: catPics,
      })
    ).to.eql({ status: "idle", entities: catPics });
  });
});
