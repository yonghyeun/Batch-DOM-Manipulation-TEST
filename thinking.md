# issue 1. top , translate 간의 공유 불가능

각 node 의 method 에 따라서 위치 보정을 다르게 해야함

그 이유는

1. translate 일 때는 객체의 위치를 offsetTop 으로 가져올 수 없음
   => translate 는 offsetTop 을 계산하는 layout 과정을 거치지 않음으로서 부드러운 애니메이션을 제공 할 수 있는 것임

2. 나의 문제는 caching False / translate True 일 때 발생하는 이유는
   노드의 offsetTop 은 변화하지 않고 있기 때문에 transalte 되는 값이 그대로임

그러니까 무슨 말이나면 translate 의 값이 변화해야 애니메이션이 이동한다는 것임

3. translate 는 caching 여부에 상관없이 값만 이동하면 되는거임

translate 는 노드의 offsetTop 을 계산 할 필요조차가 없는거니까

caching 에 저장하는 값은 method 에 상관없이 실제 node 의 위치를 이용하도록 하자

caching 은 top + translateY 값을 이용해 실제 노드의 curTop 을 계산하도록 하고 실제 노드의 클래스를 변경하는 것은 이 값을 이용하도록 하자

어차피 top , translateY 값을 변경하는 것은 distnace 만큼 +- 시키면 되는거 아니냐 ?

어차피 이동하는 distance 는 className 에 따라 상관있는거니까 말이야

# issue 2. debouncing 구현 중 어려움 봉착

## 문제 정의

```js

  /**
   * This function manages component's state.
   * If states were changed, It occurs re-rendering using changed state.
   * @param {object} newState - The new state to be merged with the current state.
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }
  ...

  /**
   * Creates a debounced version of a function ,
   * delaying its excution untill after a certain time period has elapsed since the last call.
   * @param {Function} callbackFn - The function to debounce.
   * @param {Number} delay - The delay in milliseconds before the debounced function is called after the last invocation.
   * @returns {Function} - A debounced version of the input function
   */
  debounce = (callbackFn, delay = 500) => {
    let timer;

    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        callbackFn(...args);
        timer = null;
      }, delay);
    };
  };

  /**
   * This function render all Components on browser using debouncing.
   * Using debounce seperates state changes and rendering.
   */
  render() {
    this.debounce(console.log)(this.state);
  }
```

`render` 메소드가 호출 될 때 디바운싱을 이용하여 렌더링 하고자 했다. `state` 를 업데이트 할 때 마다 렌더링을 하는 것 보다

`state` 업데이트는 즉각적으로 일어나면서 렌더링은 `debouncing` 을 이용하여 마지막 `state` 변경 때에만 렌더링을 일으키려고 말이다.

`debouncing` 함수 자체는 문제가 없는 것으로 확인되는데 `render()` 메소드가 호출 될 때 마다

`debouncing` 기능이 작동을 안하고 비동기적으로 쌓인 이벤트들이 호출되는 모습을 볼 수 있었다.

![!before timer](/imgs/before%20timer.gif)

> 예를 들어 `render()` 메소드가 5번 호출되면 마지막 이벤트가 1번만 호출되기를 기대하였으나
> 5번 모두 호출된다.

왜 이런일이 발생했을까 ?

```js
  render() {
    this.debounce(console.log)(this.state);
  }
```

해당 메소드가 `setState` 에서 호출 될 때 `this.debounce()` 로 생성되는 함수 객체는

매 호출때마다 서로 다른 `timer` 지역 변수들을 가리키고 있기 때문이다.

> 호출 될 때 마다 실행 컨텍스트가 서로 다르며, 각기 다른 실행 컨텍스트에서 지역변수인 `timer` 가 존재하니 각자의 `timer` 를 공유하지 않고 있다.

그래서 `timer` 를 지역 변수가 아닌 전역 변수로 변경해주었다.

```js
  constructor() {
    this.body = document.querySelector('body');
    this.root = document.querySelector('#root');
    this.delta = 10;
    this.timer = null; // timer를 전역 변수로 생성
    this.init();
    this.setUp();
    this.render();
  }
  ...
  debounce = (callbackFn, delay = 500) => {
    // debounce 실행 컨텍스트에서 전역으로 관리되는 timer를 참조하도록 함
    // 각기 다른 실행 컨텍스트에서 실행되는 debounce 메소드에서
    // timer 는 모두 같은 timer 를 참조하게 됨
    console.log(this.timer);
    return (...args) => {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        callbackFn(...args);
        this.timer = null;
      }, delay);
    };
  };

  render() {
    this.debounce(console.log)(this.state);
  }
```

![!after timer](imgs/after%20timer.gif)

# issue3. Re-rendering 의 조건을 어떻게 할 것인가

```js
this.state = {
  maxWidth: this.body.clientWidth,
  numCats: 10,
  isCaching: true,
  isTranslate: true,
  backgroundColor: '#f2cb05',
};
```

관리하는 상태는 다음과 같고 만약 `state` 가 변경되면 리렌더링이 되도록 하고 있음

그런데 내 생각 `backgroundColor , isCaching  , isTranslate` 상태가 변경되는 것은 모두 새롭게 리렌더링 하고 싶지 않음

이미 움직이고 있는 고양이들에서 `requestAnimationFrame` 의 기존 `frame` 만 변경하고

새롭게 설정된 `isCaching , isTranslate` 메소드를 이용한 `requestAnimationFrame` 을 새로 설정하면 되는거 아닌가 ?

- `maxWidth , numCats` 가 변경 됐을 경우엔 전체 컴포넌트들을 지우고 새로운 컴포넌트들을 추가해주도록 하자
- `isCaching , isTranslate , backgroundColor` 만 변경됐을 경우엔 기존 컴포넌트들은 유지한 채로 `background-color` 만 `repaint` 시키고 `requestAnimationFrame` 을 업데이트 하자

# Issue 3. caching 이 제대로 안되고 있다.

`uncaching` 을 이용한 메소드를 이용하다가

`caching` 메소드를 사용하니까 `caching.curLocation` 부분이 이상해지는 문제가 발생한다.
