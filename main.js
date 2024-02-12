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
