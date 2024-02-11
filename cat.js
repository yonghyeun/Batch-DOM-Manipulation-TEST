export default class Cat {
  constructor(locationX) {
    this.body = document.querySelector('body');
    this.locationX = locationX;
    this.caching = {};
    this.createCat();
    this.render();
  }

  createCat() {
    const { body, locationX, caching } = this;
    const locationY = Math.random() * body.clientHeight;
    const movingState = Math.random() > 0.5 ? 'up' : 'down';
    const node = document.createElement('img');
    const imgSize = 100;

    node.src = 'cat.gif';
    node.className = `cat ${movingState}`;
    node.style.cssText = `top: ${locationY}px; left: ${locationX}px;`;

    caching.offsetTop = Math.max(locationY, 0);
    caching.offsetBottom = Math.min(locationY + imgSize, body.offsetHeight);
    this.node = node;
  }

  render() {
    const { node, body } = this;
    body.appendChild(node);
  }
}
