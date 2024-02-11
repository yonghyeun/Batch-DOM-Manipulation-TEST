import Cat from './cat.js';

const $body = document.querySelector('body');
const maxWidth = $body.clientWidth;
const maxCats = 150;

const cats = [];
for (let index = 0; index < maxCats; index += 1) {
  const locationX = Math.random() * 10 + index * (maxWidth / maxCats);
  cats[index] = new Cat(locationX);
}

const catMoving = () => {
  cats.forEach((cat) => cat.move({ isCaching: false, isTranslate: true }));
  /* 다음날 일어나면 isCaching : false 이고 isTrnaslate : true 일 때 수정해놔라 */
  requestAnimationFrame(catMoving);
};
requestAnimationFrame(catMoving);
