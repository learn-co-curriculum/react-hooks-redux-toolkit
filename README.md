# Redux Toolkit

## Objectives

1. Use Redux Toolkit to simplify Redux setup and help follow best practices

## Introduction

As we've been writing Redux code, we've added a pretty significant amount of
complexity to our applications for managing state. For the apps we've been
building in labs, this amount of complexity certainly may feel like overkill -
we could just as easily have used `useState` and called it a day! As
applications grow, having a consistent, predictable pattern for managing state
will be beneficial.

**However**, as we've seen, adding more state means adding more "boilerplate"
code, such as:

- Creating new reducers
- Handling state immutably in our reducers
- Adding new action creators

We also need to go through a good amount of setup just to get Redux up and
running:

- Combine our reducers
- Configure the Redux Dev Tools
- Create our store
- Add the `redux-thunk` middleware for async actions

The amount of boilerplate code to get Redux up and running, and add new
features, has been a consistent pain point for developers. Thankfully, the Redux
team now has a tool to simplify the setup and make our job a bit easier: the
**Redux Toolkit**. We're going to rewrite the "Async Redux Lab" lab to see how
using the Redux Toolkit can help simplify our code.

To get started, install the Redux Toolkit:

```console
$ npm install @reduxjs/toolkit
```

Then, code along as we refactor.

## Store Setup

Currently, our store setup looks like this:

```js
// src/store.js
import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducer";

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware));

const store = createStore(rootReducer, composedEnhancer);

export default store;
```

We're also creating a root reducer in a separate file using `combineReducers`,
so that we can add more reducers as our need for state grows:

```js
// src/reducer.js
import { combineReducers } from "redux";
import catsReducer from "./features/cats/catsSlice";

const rootReducer = combineReducers({
  cats: catsReducer,
});

export default rootReducer;
```

As you by now are surely aware, it takes quite a bit of work to get all the
tools we need (`combineReducers`, `redux-thunk`, the Redux DevTools, etc.) all
in place! Let's see how this setup looks with the Redux Toolkit instead:

```js
// src/store.js
import { configureStore } from "@reduxjs/toolkit";

import catsReducer from "./features/cats/catsSlice";

const store = configureStore({
  reducer: {
    cats: catsReducer,
  },
});

export default store;
```

This one `configureStore` function does all the work we'd done by hand to set up
our store and greatly simplifies it. It handles the work of:

- Combining the reducers (we can just add other reducers in the `configureStore`
  function!);
- Setting up `redux-thunk` (which is installed automatically as a dependency of
  Redux Toolkit); and
- Adding the Redux DevTools!

If you run `npm test` now, you should be able to confirm all the functionality
we had previously set up by hand still works!

One other benefit we get from the Redux toolkit is automatic checks for bugs
around mutating state in our reducers.

In our reducer, let's introduce a bug by mutating state (for demo purposes only,
of course):

```js
// src/features/cats/catsSlice.js
export default function catsReducer(state = initialState, action) {
  switch (action.type) {
    case "cats/fetchCats/pending":
      // mutating state! nonono
      state.status = "loading";
      return state;
```

If you run `npm start` and run our app in the browser, you should now get a
nice, big error message in the console warning you about not mutating state in
the reducer. This is an excellent error to have pop up in our applications -
bugs related to improperly mutating state are notoriously difficult to spot, and
can introduce a lot of strange behavior into our apps. Having this automatic
check in place should give us more confidence that we're writing our reducer
code properly!

Now that we're done with the Redux Toolkit setup for our store, we can also now
safely remove some dependencies from our app (since they're included with Redux
Toolkit):

```console
$ npm uninstall redux redux-thunk
```

## Creating Slices

Let's turn our attention next to our reducer and action creator code. All our code is in the `src/features/cats/catsSlice.js` file (a few new actions have been added for demo purposes). Let's start with the reducer:

```js
// src/features/cats/catsSlice.js
const initialState = {
  entities: [], // array of cats
  status: "idle", // loading state
};

function catsReducer(state = initialState, action) {
  switch (action.type) {
    // sync actions
    case "cats/catAdded":
      return {
        ...state,
        entities: [...state.entities, action.payload],
      };
    case "cats/catRemoved":
      return {
        ...state,
        entities: state.entities.filter((cat) => cat.id !== action.payload),
      };
    case "cats/catUpdated":
      return {
        ...state,
        entities: state.entities.map((cat) =>
          cat.id === action.payload.id ? action.payload : cat
        ),
      };

    // async actions
    case "cats/fetchCats/pending":
      return {
        ...state,
        status: "loading",
      };
    case "cats/fetchCats/fulfilled":
      return {
        ...state,
        entities: action.payload,
        status: "idle",
      };

    default:
      return state;
  }
}

export default catsReducer;
```

One of the key requirements of our reducer is that we must always **return a new version of state**, and **never** mutate state. We're using the spread operator and a few tricks with different array methods to accomplish this. Let's see how we could simplify this with Redux Toolkit.

To start off, we'll need to import the `createSlice` function:

```js
import { createSlice } from "@reduxjs/toolkit";
```

Then, we can update our reducer code like so:

```js
const initialState = {
  entities: [], // array of cats
  status: "idle", // loading state
};

const catsSlice = createSlice({
  name: "cats",
  initialState,
  reducers: {
    catAdded(state, action) {
      // using createSlice lets us mutate state!
      state.entities.push(action.payload);
    },
    catUpdated(state, action) {
      const cat = state.entities.find((cat) => cat.id === action.payload.id);
      cat.url = action.payload.url;
    },
    // async actions to come...
  },
});

export default catsSlice.reducer;
```

Running `npm test` now after swapping out our reducer should still pass for all
tests except those related to our _async_ actions (more on that later).

One thing you'll notice is that we're now allowed to mutate state - no more
spread operator! Under the hood, Redux Toolkit uses a library called [Immer][]
to handle immutable state updates. We can safely write code that mutates state,
as long as we're using `createSlice`, and Immer will ensure that we're not
_actually_ mutating state.

[immer]: (https://immerjs.github.io/immer/docs/introduction)

Using `createSlice` will _also_ generate our action creators automatically!
Let's delete the `catAdded` and `catUpdated` action creators we wrote by hand,
and replace them with the ones generated by `createSlice`:

```js
// the `catsSlice` object will have an `actions` property
// with the auto-generated action creators
export const { catAdded, catUpdated } = catsSlice.actions;
```

## Async Action Creators

Redux Toolkit also gives us another way to work with _async_ action creators using `redux-thunk`. We'll have to do a bit more work here to get these working than with our normal, non-thunk action creators creators.

First, we'll need to import another function from Redux Toolkit:

```js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
```

Then, we can use this `createAsyncThunk` function to create our `fetchCats` function:

```js
export const fetchCats = createAsyncThunk("cats/fetchCats", () => {
  // return a Promise containing the data we want
  return fetch("https://learn-co-curriculum.github.io/cat-api/cats.json")
    .then((response) => response.json())
    .then((data) => data.images);
});
```

Next, to add this to our reducer:

```js
const catsSlice = createSlice({
  name: "cats",
  initialState,
  reducers: {
    // sync reducers here
  },
  // add this as a new key
  extraReducers: {
    // handle async action types
    [fetchCats.pending](state) {
      state.status = "loading";
    },
    [fetchCats.fulfilled](state, action) {
      state.entities = action.payload;
      state.status = "idle";
    },
  },
});
```

To recap what the code above is doing:

- We created a new async action creator using `createAsyncThunk`, called `fetchCats`
- We added a new key on the slice object called `extraReducers`, where we can
  add custom reducer logic
- We added a case in `extraReducers` for the `fetchCats.pending` state, which
  will run when our fetch request has not yet come back with a response
- We also added a case for `fetchCats.fulfilled`, which will run when our
  response comes back with the cat data

There's a lot to take in there! Working with async actions is still challenging,
but using this approach at least gives us a consistent way to structure our
async code and reduce the amount of hand-written logic for dealing with various
fetch statuses ('idle', 'loading', 'error').

Here's what our completed slice file looks like after all those changes:

```js
// src/features/cats/catsSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchCats = createAsyncThunk("cats/fetchCats", () => {
  // return a Promise containing the data we want
  return fetch("https://learn-co-curriculum.github.io/cat-api/cats.json")
    .then((response) => response.json())
    .then((data) => data.images);
});

const catsSlice = createSlice({
  name: "cats",
  initialState: {
    entities: [], // array of cats
    status: "idle", // loading state
  },
  reducers: {
    catAdded(state, action) {
      // using createSlice lets us mutate state!
      state.entities.push(action.payload);
    },
    catUpdated(state, action) {
      const cat = state.entities.find((cat) => cat.id === action.payload.id);
      cat.url = action.payload.url;
    },
  },
  extraReducers: {
    // handle async actions: pending, fulfilled, rejected (for errors)
    [fetchCats.pending](state) {
      state.status = "loading";
    },
    [fetchCats.fulfilled](state, action) {
      state.entities = action.payload;
      state.status = "idle";
    },
  },
});

export const { catAdded, catUpdated } = catsSlice.actions;

export default catsSlice.reducer;
```

Running the tests again should still give you a passing result - meaning that
our refactor was successful.

You can see the full, working code in the solution branch.

## Summary

Using Redux Toolkit can help remove a lot of the "boilerplate" setup code for working with Redux. It can also help save us from some of the common pitfalls of working with Redux, such as mutating state. Finally, it also gives us a way to structure our async code so that we can handle various loading states consistently and predictably.

## Resources

- [Redux Toolkit](https://redux-toolkit.js.org/introduction/quick-start)
- [Redux Toolkit: Advanced Tutorial](https://redux-toolkit.js.org/tutorials/advanced-tutorial)
