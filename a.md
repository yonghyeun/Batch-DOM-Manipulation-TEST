# 프로젝트를 시작한 이유

설 연휴동안 브라우저 렌더링 관련 공부를 엄청나게 했다.

> #### 설 연휴간 공부한 목록
>
> <a href = 'https://velog.io/@yonghyeun/%EB%B8%8C%EB%9D%BC%EC%9A%B0%EC%A0%80%EB%8A%94-%EC%96%B4%EB%96%BB%EA%B2%8C-%EB%A0%8C%EB%8D%94%EB%A7%81-%EB%90%98%EB%8A%94%EA%B0%80-DOM-CSSOM-Render-Tree'>브라우저는 어떻게 렌더링 되는가 (DOM , CSSOM , Render Tree)</a> > <a href = 'https://velog.io/@yonghyeun/Reflow-%EC%99%80-Repaint-%EC%84%B1%EB%8A%A5-%EC%B5%9C%EC%A0%81%ED%99%94'>Reflow 와 Repaint - 성능 최적화</a> > <a href = 'https://velog.io/@yonghyeun/reflow-repaint-%EC%8B%9C%EB%AE%AC%EB%A0%88%EC%9D%B4%ED%84%B0-%EB%A7%8C%EB%93%A4%EC%96%B4%EB%B3%B4%EA%B8%B0'>requestAnimationFrame , 실험과 폴리필을 통해 살펴보기</a> > <a href = 'https://velog.io/@yonghyeun/%EB%B8%8C%EB%9D%BC%EC%9A%B0%EC%A0%80-%EB%A0%8C%EB%8D%94%EB%A7%81-%ED%8C%8C%EC%9D%B4%ED%94%84%EB%9D%BC%EC%9D%B8'>브라우저 렌더링 파이프라인 딥다이브</a>

왜냐면 최적화 하는 방법에 대한 개념을 미리 공부해놓는다면

새로운 것을 공부 할 때 만들 때 부터 최적화가 가능한 코드에 대한 고민을 할 수 있을 것 같았기 때문이다.

> 어떻게 렌더링 되는지에 대한 깊은 이해가 없으니 최적화를 어떻게 할지에 대한 생각조차 떠오르지 않더라
>
> > 사실 아직 가벼운 사이드프로젝트들만 해봤을 뿐이지만 말이다. 😂

![](https://velog.velcdn.com/images/yonghyeun/post/89694005-8bfd-4d41-934f-b22087fe94db/image.gif)

이런식으로 공부하고 구글 개발자 도구에서 시뮬레이터로 제공하는 <a href = 'https://googlechrome.github.io/devtools-samples/jank/'>사이트</a>가 있어

**와 ! 바로 이거지 ~~ ** 이러고 코드를 살펴봤었다.

도대체 `Optimize` 버튼에 등록된 이벤트 핸들러는 얼마나 대단한 기능이 있어서 이런걸 가능하게 할까 ? 하는 궁금증과 함께 말이다.

```js
app.update = function (timestamp) {
  for (var i = 0; i < app.count; i++) {
    var m = movers[i];
    if (!app.optimize) {
      // Un-optimize 일 때는 offsetTop 프로퍼티로 TOP 위치를 불러와
      // 지연평가를 불가능하게 함
      var pos = m.classList.contains('down')
        ? m.offsetTop + distance
        : m.offsetTop - distance;
      if (pos < 0) pos = 0;
      if (pos > maxHeight) pos = maxHeight;
      m.style.top = pos + 'px';
      if (m.offsetTop === 0) {
        m.classList.remove('up');
        m.classList.add('down');
      }
      if (m.offsetTop === maxHeight) {
        m.classList.remove('down');
        m.classList.add('up');
      }
    } else {
      // Optimize 일 때는 현재의 offsetTop 을 ComputedStyle의 프로퍼티에 직접 접근해
      // reflow를 일으키지 않고 지연평가를 가능하게 함
      var pos = parseInt(m.style.top.slice(0, m.style.top.indexOf('px')));
      m.classList.contains('down') ? (pos += distance) : (pos -= distance);
      if (pos < 0) pos = 0;
      if (pos > maxHeight) pos = maxHeight;
      m.style.top = pos + 'px';
      if (pos === 0) {
        m.classList.remove('up');
        m.classList.add('down');
      }
      if (pos === maxHeight) {
        m.classList.remove('down');
        m.classList.add('up');
      }
    }
  }
  frame = window.requestAnimationFrame(app.update);
};
```

> ### `Optimize` 를 설정했을 때
>
> ![](https://velog.velcdn.com/images/yonghyeun/post/072a21cf-4bdd-465a-b5d9-102a461e7bc2/image.png)
>
> ### `Optimize` 를 설정하지 않았을 때
>
> ![](https://velog.velcdn.com/images/yonghyeun/post/c575a692-c746-43f6-9945-e4d838bc487a/image.png)

처음 나는 페이지를 보고 아 ~ `Un-Optimize` 일 때는 `top` 을 이용해서 애니메이션을 구현하고

`Optimize` 일 때는 `translateY` 를 이용했나보구나 이랬는데

그것이 아니라 단순히 브라우저 렌더링 엔진의 **지연평가**를 이용한 것 뿐이였다.

두 방법 모두 `top` 을 이용해서 애니메이션이 구현되어 있다.

> 지연평가란 블록문 내에서 리플로우를 일으키는 코드가 있을 때 , 리플로우의 결과값을 조회하지 않는다면 (현재 코드에선 `offsetTop`) 블록문을 모두 실행 한 후 리플로우를 단 한번만 일으키는 방법을 의미한다.
>
> `Optimize` 일 때는 `offsetTop` 과 같이 평가의 결과값을 조회하지 않고 있기 때문에 `top` 의 `px` 을 변화시키는 행위들을 최대한 지연하다가 블록문이 모두 종료되면 한 번에 처리하는 것이 가능했다.

![](https://velog.velcdn.com/images/yonghyeun/post/c0fe700d-c5e5-49a8-beb1-e5608c228088/image.gif)

**내가 알고 싶었던 것은 `top` 을 이용할 때와 `transform` 을 이용했을 때 `GPU` 가속 여부에 따른 렌더링 성능이였다고 ~!!!**

**그리고 어차피 지연평가 할거면 그냥 현재의 `top` 위치를 다른 자료구조에 캐싱만 해두면 `optimize` 일 때랑 똑같은거 아냐 ?!?!?!!?!?!?!**

하는 분노가 찼었다.

**그!래!서!**

말 나온김에 내가 궁금해하는 내용들을 직접 구현해보기로 했다.

---

# 애니메이션을 위해 필요한 기능

- ### 사용할 이미지
  ![](https://velog.velcdn.com/images/yonghyeun/post/b7a4873a-b454-4ba0-9030-90fd06337677/image.gif)

나는 귀엽게 이 뻐끔거리는 고양이를 이용하기로 했다.

뻐끔뻐끔

- ### 초기 렌더링 위치

해당 이미지를 브라우저에 렌더링 할 때 수평적으로, 수직적으로 렌더링 될 위치를 계산해주어야 했다.

그래서 수평적인 위치는 `렌더링 할 이미지 개수 /뷰포트의 너비` 를 기준으로 `Math.random` 을 이용해 조금의 무작위성을 주었고

수직적인 위치는 `뷰포트의 높이 * Math.random()` 을 이용해 무작위적으로 렌더링 하도록 하였다.

- ### 애니메이션에서 사용할 기능

내가 궁금했던 것은 `top` 을 이용한 애니메이션 때와 `transform` 을 이용할 때의 애니메이션이 궁금했던 것이니

**애니메이션 기능에 넣을 때 `top` 으로 할 때와 `transform` 을 이용해야 할 것이다. **

그리고 현재의 위치들을 캐싱해둔다면 더 렌더링 성능이 좋아지지 않을까 ? 라는 생각이 들었으니

**캐싱 여부에 따른 `top , transform` 애니메이션** 을 구현해야 겠다.

---

# `Cat` 객체 생성

```js
export default class Cat {
  constructor(locationX) {
    this.body = document.querySelector('body');
    this.maxHeight = document.querySelector('body').clientHeight;
    this.imgSize = 50;
    this.caching = {};
    this.createCat(locationX);
    this.render();
  }

  /**
   * This function creates a node that moves up and down within the viewport.
   * The node's class and locationX are randomly choosen.
   * All location infromation is cached.
   * @param {Number} locationX - Indicates the horizontal X coordinate where the node will be placed.
   */
  createCat(locationX) {
    const { maxHeight, imgSize, caching } = this;
    const movingState = Math.random() > 0.5 ? 'up' : 'down';
    const node = document.createElement('img');
    const locationY = Math.max(Math.random() * maxHeight - imgSize, 0);

    node.src = 'cat.gif';
    node.className = `cat ${movingState}`;
    node.style.cssText = `left: ${locationX}px; top: ${locationY}px; transform : translateY(0px);`;

    caching.curTop = locationY;
    caching.curTranslateY = 0;
    caching.curLocation = locationY - 0;

    this.node = node;
  }

  render() {
    const { node, body } = this;
    body.appendChild(node);
  }

  /**
   * Parsing the style.transform text to calculate the translateY value
   * @constant {number} start - index of character follwing '('
   * @constant {number} end - index of character preceding 'px'
   * @returns {number} - The current translateY value of the node.
   */
  translateParsing = () => {
    const { node } = this;
    const translateText = node.style.transform;
    const start = translateText.indexOf('(') + 1;
    const end = translateText.indexOf('px');
    return parseInt(translateText.slice(start, end));
  };

  /**
   *
   * @param {boolean} isCaching - Indicates whether to use cached location values
   * @returns {Object} - infromation of the location of the node.
   * @property {number} curTop - The current top position of the node.
   * @property {number} curTranslateY - The current translateY value of the node.
   * @property {number} curLocation - The current calculated location of the node
   *
   */
  getLocation = (isCaching) => {
    const { node, caching } = this;
    const { translateParsing } = this;
    const amountTranslate = translateParsing();

    if (isCaching) return caching;
    return {
      curTop: node.offsetTop,
      curTranslateY: amountTranslate,
      curLocation: node.offsetTop + amountTranslate,
    };
  };
  /**
   * Calculate the offset to going next step depending on whether it is cached or not
   * offset is the distance to move depending on the current location
   * if the distnace after moving by offset is beyond the viewport , the offset is adjusted to the
   * distance from the current position to viewport.
   * @param {boolean} isCaching - Indicates whether caching for animation if enabled.
   * @returns {number} - Indicates the distance the node will move next.
   */
  calcaulateOffset = (isGoingUp, isCaching) => {
    const { maxHeight, imgSize } = this;
    const { getLocation } = this;
    const { curLocation } = getLocation(isCaching);
    const offset = isGoingUp ? -3 : 3;
    const nextLocation = curLocation + offset;

    if (isGoingUp && nextLocation <= 0) return -curLocation;
    if (!isGoingUp && nextLocation >= maxHeight - imgSize)
      return maxHeight - imgSize - curLocation;

    return offset;
  };

  /**
   * function to change the node's class based on the next direction to move,
   * wheter the next direction to go is up or down
   * this is depending on nextLocation is beyond the viewport
   * @param {boolean} isGoingUp - Indicates the node's class contains up
   * @param {boolean} nextLocation - Indicates the location where the next node will be placed
   */
  changeState = (isGoingUp, nextLocation) => {
    const { node, maxHeight, imgSize } = this;
    if (nextLocation !== 0 && nextLocation !== maxHeight - imgSize) return;

    if (isGoingUp) {
      node.classList.remove('up');
      node.classList.add('down');
    } else {
      node.classList.remove('down');
      node.classList.add('up');
    }
  };

  /**
   * This function update the caching data using Object spread syntax
   * @param {Object} newData - The Object used to update the caching.
   */
  updateCache = (newData) => {
    this.caching = { ...this.caching, ...newData };
  };

  /**
   * This function makes the node movable within the viewport.
   * This calculates the offset indicating next step using calculateOffset function ,
   * changes the style of node depending on isTranslate.
   * and this function updates caching data if isCaching is true
   * @param {Object} optimizeState
   * @property {boolean} isCaching - Indicates whether to use cached location values
   * @property {boolean} isTranslate - Indicates whether to use translateY or not
   */
  move(optimizeState) {
    const { isCaching, isTranslate } = optimizeState;
    const { node } = this;
    const { getLocation, calcaulateOffset, changeState, updateCache } = this;
    const isGoingUp = node.classList.contains('up');
    let { curTop, curTranslateY, curLocation } = getLocation(isCaching);
    const offset = calcaulateOffset(isGoingUp, isCaching);
    const nextLocation = curLocation + offset;

    if (isTranslate) {
      node.style.transform = `translateY(${curTranslateY + offset}px)`;
      curTranslateY += offset;
    } else {
      node.style.top = `${curTop + offset}px`;
      curTop += offset;
    }
    curLocation += offset;

    if (isCaching) updateCache({ curTop, curTranslateY, curLocation });
    changeState(isGoingUp, nextLocation);
  }
}
```

와우 ! 이번에 처음으로 `JSDOC` 을 이용해봤는데 되게 깔끔한 것 같다.

아직 타입스크립트를 배우지 않아서 저런 기능들이 매우 필요했는데 가뭄의 단비처럼 너무 반가웠다.

타입스크립트만큼의 강제성은 존재하지 않더라도 클래스에서 여러 함수들을 사용 할 때 도움이 많이 되었다.

> 요즘 영어를 잘하고 싶어서 팟캐스트를 듣고 있는데, 기왕 하는거 영어로 `JSDOC` 도 작성해보자 하고 해봤다.
> 내 짧은 영어로 먼저 만들어보고 , 챗지피티한테 물어보고 수정해달라고 했다.

전체 코드들을 설명하지는 않겠으나 가장 코어가 되는 로직은

1. 인스턴스들은 각자 클래스로 `up` 혹은 `down` 만 가지고 있으며 클래스명을 이용해 객체가 위로 이동할지, 아래로 이동할지를 결정한다.

2. 인스턴스가 다음 프레임에서 이동할 거리는 `calculateOffset` 함수를 통해 `offset` 을 계산하며 `offset`은 인스턴스가 뷰포트를 넘어가지 않을 정도로 조절한다.

3. 계산된 `offset` 을 이용해 `top` 혹은 `transform` 을 이용해 프레임 별 인스턴스가 렌더링 될 위치를 조절한다.

   3.1 이 때 애니메이션에 사용할 방법이 변경되었을 때를 대비하여 노드의 실제 위치를 계산 할 수 있는 `getLocation` 함수를 생성한다.

   > `top` 을 사용하다가 `transform` 으로 변경했을 때 혹은 그 반대를 대비하여 노드의 위치를 가져올 수 있도록 해야 한다.
   >
   > `offsetTop` 프로퍼티는 `ComputedStyle` 에서 `top` 속성의 값만 가져오더라

4. 인스턴스가 뷰포트의 상단이나 하단에 닿으면 클래스 명을 `changeState` 함수를 이용해 변경한다.

### 프로토타입 살펴보기

```js
import Cat from './cat.js';

const $body = document.querySelector('body');
const maxWidth = $body.clientWidth;
const maxCats = 100;

const cats = [];
for (let index = 0; index < maxCats; index += 1) {
  const locationX = Math.random() * 10 + index * (maxWidth / maxCats);
  cats[index] = new Cat(locationX);
}

const catMoving = () => {
  cats.forEach((cat) => cat.move({ isCaching: true, isTranslate: false }));
  requestAnimationFrame(catMoving);
};
requestAnimationFrame(catMoving);
```

![](https://velog.velcdn.com/images/yonghyeun/post/3b2b913d-1e64-4dc8-8c38-a13327f899ae/image.gif)

가볍게 다음과 같은 결과물이 나왔다 :)

물론 아직은 페이지를 로드 할 때 마다 렌더링 할 고양이의 개수를 지정해주고 `isCaching  , isTranslate` 의 값을 변경해줘야 하지만

이벤트 핸들러가 등록된 버튼들을 추가해 동적으로 렌더링 하고 애니메이션 방법을 변경해주도록 하자
