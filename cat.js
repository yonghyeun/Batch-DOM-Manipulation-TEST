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
   * @returns {Object} - infromation of the node.
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
      curLocation: node.offsetTop - amountTranslate,
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
  calcaulateOffset = (isCaching) => {
    const { node, maxHeight, imgSize } = this;
    const { getLocation } = this;
    const { curLocation } = getLocation(isCaching);
    const isGoingUp = node.classList.contains('up');
    const offset = isGoingUp ? -3 : 3;
    const nextLocation = curLocation + offset;

    if (isGoingUp && nextLocation <= 0) return -curLocation;
    if (!isGoingUp && nextLocation >= maxHeight - imgSize)
      return maxHeight - curLocation;

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

  updateCache = (newData) => {
    this.caching = { ...this.caching, ...newData };
  };

  move(optimizeState) {
    const { isCaching, isTranslate } = optimizeState;
    const { calcaulateOffset, changeState, updateCache } = this;
    const offset = calcaulateOffset(isCaching);
  }
}
