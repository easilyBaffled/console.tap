<p align="center">
    <img
        alt="consoletap"
        src="assets/logo.svg"
        width="150px"
    />
</p>
<h3 align="center">
    console.tap / logTap
</h3>
<p align="center">
    Finally, a log function that won't interrupt your code. 
</p>
<p align="center">
    <a href="https://nodei.co/npm/console.tap/">
        <img src="https://nodei.co/npm/console.tap.png" />
    </a>
</p>

---

```js
v => (console.log(v), v);
```

`logTap` provides a logging function that does not interrupt your existing code. The function takes in a value, logs the value, then returns the value. 

---
In addition to the standalone `logTap` function, this module provides: 
- a standalone copy of the `console` object that includes the `tap` along with an `tap` for each existing `console` function ( e.g. `console.warn.tap`, `console.error.tap` )  
- a polyfill that replaces the regular console with the standalone copy 

I believe that `logTap` **should** be a part of the standard spec, and as such I will be referring to it as `console.tap` going forward.

You can click [here to jump to the API](#API)

You can view the slides and notes for my lighting talk proposing `console.tap` at [Tap Talk Presentation](https://taptalk.netlify.com/)

---

# Why

Javascript has become an [Expression](http://2ality.com/2012/09/expressions-vs-statements.html) dominated language. 
Which means just about everything we do results in a value. 
This allows us to write more concise code where one thing leads cleanly into the next.

**For Example:**

```js
const userID = getUserId(
  JSON.parse(localStorage.getItem("user"))
);
```

```js
const pickAndFormatData = ({ date, amount }) => ({
  date: moment(date).format("DD/MM/YYY "),
  amount: Number(amount) ? formatCurrency(amount) : amount
});
```

```js
const result = arr
  .map(parseNumbers)
  .filter(removeOdds)
  .reduce(average);
```

But there is no `console` function that fit in this modern style. Instead `console.log` and it's like return `undefined`. 
Which means you will have to awkwardly break up the code to debug it. 
`console.tap` solves the `undefined` issue. It takes in a value, logs the value, then returns the value.

**For comparison:**

**With `console.log`:**

```js
const userStr = localStorage.getItem("user");
console.log(userStr);

const userID = getUserId(JSON.parse(userStr));
```

**With `console.tap`:**

```js
const user = JSON.parse(
  console.tap(localStorage.getItem("user"))
);
```

---

**With `console.log`:**

```js
const pickAndFormatData = ({ date, amount }) => {
  console.log(amount, Number(amount));
  
  const result = {
    date: moment(date).format("DD/MM/YYY "),
    amount: Number(amount) ? formatCurrency(amount) : amount
  };
  
  console.log(result);
  return result;
};
```

**With `console.tap`:**

```js
const pickAndFormatData = ({ date, amount }) =>
  console.tap({
    date: moment(console.tap(date)).format("DD/MM/YYY"),
    amount: console.tap(Number(amount))
      ? formatCurrency(amount)
      : amount
  });
```

---

**With `console.log`:**

```js
const filtered = arr.map(parseNumbers).filter(removeOdds);
console.log(filtered);

const result = filtered.reduce(average);
```

**With `console.tap`:**

```js
const result = console.tap(arr
  .map(parseNumbers)
  .filter(removeOdds))
  .reduce(average);
```
---

## Why "Tap" as the name? 
In functional programing `tap` is a function with the signature `(a → *) → a → a`. 
It takes a function and a value, calls the function with the value, ignores the result and returns the value. 
`console.tap` is `tap` with `console.log` baked in.
Examples 
- [Ramda](https://ramdajs.com/docs/#tap)  
- [Lodash](https://lodash.com/docs/4.17.11#tap)

---

# API

## `logTap( value, ...additionalValues )`

Takes in a value, logs the value, then returns the value. 
Any other values passed into the function are logged but are not returned.
The developer consoles cannot accurately display the file name and line numbers for `logTap` calls.
This happens because  they pull that information based on where where the `console.log` is called. 
To make up for this `logTap` passes the file and line number as the last value to the underlying `console.log` call. 
 

#### Example

```js
import { logTap } from "console.tap";

fetch(url)
  .then(res => res.json)
  .then(console.tap)
  .then(dispatchRecivedData);
```

```js
import { logTap } from "console.tap";

const filterOptionsByInputText = ({
  options,
  filterText
}) =>
  options.filter(value =>
    logTap(value.contains(filterText), value)
  );
```

## `Console`

A standalone copy of the `console` object that includes the `tap` along with an `tap` for each existing `console` function ( e.g. `console.warn.tap`, `console.error.tap` )
Each `console._.tap` works like the standard tap.
This is offered as a [ponyfill](https://ponyfill.com) alternative to the polyfill. 
```jsx
import cs from "console.tap";

const SuggestionList = ({ options, filterText }) => (
  <ul>
    {options
      .filter(value =>
        cs.tap(value.contains(filterText), {
          label: `${filterText} ${value}`,
          lineNumber: true
        })
      )
      .map(value => (
        <li key={value}>{value}</li>
      ))}
  </ul>
);
```

```js
import cs from "console.tap";

try {
    const user = JSON.parse(
      console.group.tap(localStorage.getItem("user"))
    );
} catch ( e ) {
    return console.error.tap( e )
}
```

## Polyfill
If you’d really like to embrace `tap`, you can use the polyfill by adding `import "console.tap/dist-src/polyfill.js”;` which will add `console.tap` and add `tap` options to each existing `console` function.

#### Example

```js
import "console.tap/dist-src/polyfill.js";

const value = console.tap("anything");
const warning = console.warn.tap("anything");
```
---

# Roadmap
- [ ] Create a Babel plugin to convert `tap` to `log` with extra handling to fix the line number issue
- [ ] Create a Babel plugin that can strip `tap` calls, leaving the fist value, for production builds
- [ ] Create an ESLint rule that expands the existing `console` rules to include `tap` 
