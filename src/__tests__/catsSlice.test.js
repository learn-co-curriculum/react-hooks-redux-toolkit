import { waitFor } from "@testing-library/react";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import fetchMock from "fetch-mock";
import catsReducer, {
  fetchCats,
  catAdded,
  catUpdated,
} from "../features/cats/catsSlice";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const catPics = [
  { url: "www.example.com/cat1" },
  { url: "www.example.com/cat2" },
];

describe("async actions", () => {
  afterEach(() => {
    fetchMock.restore();
  });

  test('creates an async action object with type of "cats/catsLoaded" and a payload of cat images', async () => {
    fetchMock.getOnce(
      "https://learn-co-curriculum.github.io/cat-api/cats.json",
      {
        body: {
          images: catPics,
        },
        headers: { "content-type": "application/json" },
      }
    );

    const expectedActions = [
      { type: "cats/fetchCats/pending" },
      { type: "cats/fetchCats/fulfilled", payload: catPics },
    ];

    const store = mockStore({});
    await store.dispatch(fetchCats());

    waitFor(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe("sync actions", () => {
  test("catAdded() returns the correct object", () => {
    expect(catAdded({ id: 1, url: "www.example.com/cat1" })).toEqual({
      type: "cats/catAdded",
      payload: { id: 1, url: "www.example.com/cat1" },
    });
  });
  test("catUpdated() returns the correct object", () => {
    expect(catUpdated({ id: 1, url: "www.example.com/cat2" })).toEqual({
      type: "cats/catUpdated",
      payload: { id: 1, url: "www.example.com/cat2" },
    });
  });
});

describe("catsReducer()", () => {
  test("returns the initial state", () => {
    expect(catsReducer(undefined, {})).toEqual({
      status: "idle",
      entities: [],
    });
  });

  test("handles the 'cats/catAdded' action", () => {
    expect(
      catsReducer(undefined, {
        type: "cats/catAdded",
        payload: { id: 1, url: "www.example.com/cat1" },
      })
    ).toEqual({
      status: "idle",
      entities: [{ id: 1, url: "www.example.com/cat1" }],
    });
  });

  test("handles the 'cats/catUpdated' action", () => {
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
    ).toEqual({
      status: "idle",
      entities: [{ id: 1, url: "www.example.com/cat2" }],
    });
  });

  test("handles the 'cats/fetchCats/pending' action", () => {
    expect(
      catsReducer(undefined, {
        type: "cats/fetchCats/pending",
      })
    ).toEqual({ status: "loading", entities: [] });
  });

  test("handles the 'cats/fetchCats/fulfilled' action", () => {
    const catPics = [
      { url: "www.example.com/cat1" },
      { url: "www.example.com/cat2" },
    ];
    expect(
      catsReducer(undefined, {
        type: "cats/fetchCats/fulfilled",
        payload: catPics,
      })
    ).toEqual({ status: "idle", entities: catPics });
  });
});
