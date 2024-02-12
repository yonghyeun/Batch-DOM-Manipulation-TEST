export default class Cat {
  constructor(locationX) {
    this.body = document.querySelector('body');
    this.maxHeight = document.querySelector('body').clientHeight;
    this.imgSize = 50;
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
    node.style.cssText = `left: ${locationX}px; top: ${locationY}px; transform : translateY(0px);`;

    this.locationCached = locationY;
    this.node = node;
  }

  render() {
    const { node, body } = this;
    body.appendChild(node);
  }

  translateParsing = () => {
    const { node } = this;
    const translateText = node.style.transform;
    const pxLocation = translateText.indexOf('px');

    return translateText.slice(11, pxLocation);
  };

  getLocation = (isCaching) => {
    const { node, locationCached } = this;
    const { translateParsing } = this;
    const amountTranslate = translateParsing();

    if (isCaching) return locationCached;
    return node.offsetTop + amountTranslate;
  };

  correctLocation = (isGoingUp, isCaching) => {
    const { maxHeight, imgSize } = this;
    const { getLocation } = this;
    const distance = isGoingUp ? -3 : 3;
    const { curTop } = getLocation(isCaching);
    let nextLocation = curTop + distance;

    if (isGoingUp) {
      nextLocation = Math.max(nextLocation, 0);
    } else {
      nextLocation = Math.min(nextLocation, maxHeight - imgSize);
    }
    return nextLocation;
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
    const { isCaching, isTranslate } = optimizeState;
    this.getLocation(isCaching);
  }
}
