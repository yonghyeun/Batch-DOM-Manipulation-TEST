export default class Cat {
  constructor(locationX) {
    this.body = document.querySelector('body');
    this.maxHeight = document.querySelector('body').clientHeight;
    this.imgSize = 100;
    this.caching = {};
    this.createCat(locationX);
    this.render();
  }

  createCat(locationX) {
    const { maxHeight, imgSize, caching } = this;
    const movingState = Math.random() > 0.5 ? 'up' : 'down';
    const node = document.createElement('img');
    const locationY = Math.max(Math.random() * maxHeight - imgSize, 0);

    node.src = 'cat.gif';
    node.className = `cat ${movingState}`;
    node.style.cssText = `left: ${locationX}px; top: ${locationY}px;`;

    caching.curTop = locationY;
    caching.curBottom = locationY + imgSize;

    this.node = node;
  }

  render() {
    const { node, body } = this;
    body.appendChild(node);
  }

  getLocation = (isCaching) => {
    const { node, imgSize, caching } = this;

    if (isCaching) return caching;
    return { curTop: node.offsetTop, curBottom: node.offsetTop + imgSize };
  };

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

  updateCache = (nextLocation) => {
    const { caching } = this;
    caching.curTop = nextLocation;
  };

  move(optimizeState) {
    const { node, maxHeight, imgSize, caching } = this;
    const { getLocation, changeState, updateCache } = this;
    const { isCaching, isTranslate } = optimizeState;
    const { curTop, curBottom } = getLocation(isCaching);
    const isGoingUp = node.classList.contains('up');
    const distance = isGoingUp ? -3 : 3;
    let nextLocation = curTop + distance;

    /* 뷰포트를 뚫고 나가는지 확인 후 다음 위치 보정 */
    if (isGoingUp) {
      nextLocation = Math.max(nextLocation, 0);
    } else {
      nextLocation = Math.min(nextLocation, maxHeight - imgSize);
    }
    /* method에 따라 reflow 혹은 repaint 시키기 */
    if (isTranslate) {
      /* translateY 의 인수는 다음에 위치할 곳 - 현재의 top px */
      const styleTop = node.style.top.slice(0, -2);
      node.style.transform = `translateY(${nextLocation - styleTop}px)`;
    } else node.style.top = `${nextLocation}px`;
    /* caching 하기 */
    updateCache(nextLocation);

    /* class 이름을 바꿔야 하는지 확인 후 변경 */
    changeState(isGoingUp, nextLocation);
  }
}
