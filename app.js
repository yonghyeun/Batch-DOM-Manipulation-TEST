import Cat from './cat.js';

/**
 * Main application class representing the entire application.
 */
export default class App {
  constructor() {
    this.body = document.querySelector('body');
    this.delta = 10;
    this.timer = null;
    this.init();
    this.setUp();
    this.render();
  }

  /**
   * This function creates component's initial state.
   */
  setUp() {
    this.state = {
      maxWidth: this.root.clientWidth,
      numCats: 10,
      isCaching: true,
      isTranslate: true,
      backgroundColor: '#f2cb05',
    };
  }

  /**
   * This function manages component's state.
   * If states were changed, It occurs re-rendering using changed state.
   * @param {object} newState - The new state to be merged with the current state.
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };

    if (newState.maxWidth || newState.numCats) this.render();
    else this.somethingFunc(); /** @todos else 지우기 나중에 */
  }

  /**
   * Intilizes the appliceation.
   * It sets up the DOM structure and mounts event listeners on buttons.
   */
  init() {
    this.body.innerHTML = `
    <div id = 'root'></div>
    <div class="button-wrapper">
    <button class="add">add ${this.delta}</button>
    <button class="subtract">subtract ${this.delta}</button>
    <button class="uncaching notransalte" style = "background-color : #f2529d;">Un-caching top</button>
    <button class="caching notranslate" style = "background-color: #a99cd9;">Caching top</button>
    <button class="uncaching translate" style = "background-color: #05f2f2;">Un-caching translate</button>
    <button class="caching translate" style = "background-color: #f2cb05;">Caching translate</button>
  </div>
  `;
    this.root = document.querySelector('#root');
    this.mounted();
  }

  /**
   * This function is excuted after excuted init method,
   * It sets up event listeners for buttons and window.
   * @constant addButton - Increase numCats by delta
   * @constant subButton - Decrease numCats by delta,Deactivated when numCats becomes 10 or less.
   * @constant activateButtons - Array containing all buttons except add , substract button
   */
  mounted() {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const [addButton, subButton] = allButtons.slice(0, 2);
    const activateButtons = allButtons.slice(2);

    addButton.addEventListener('click', () => {
      const numCats = this.state.numCats;
      this.setState({ numCats: numCats + this.delta });
    });

    subButton.addEventListener('click', () => {
      const numCats = this.state.numCats;
      if (numCats <= 10) return;
      this.setState({ numCats: numCats - this.delta });
    });

    activateButtons.forEach((button) => {
      button.addEventListener('click', ({ target }) => {
        const { backgroundColor } = target.style;
        const isCaching = target.classList.contains('caching');
        const isTranslate = target.classList.contains('translate');
        this.setState({ backgroundColor, isCaching, isTranslate });
      });
    });

    window.addEventListener('resize', () => {
      this.setState({ maxWidth: this.root.clientWidth });
    });
  }

  /**
   * Creates a debounced version of a function ,
   * delaying its excution untill after a certain time period has elapsed since the last call.
   * @param {Function} callbackFn - The function to debounce.
   * @param {Number} delay - The delay in milliseconds before the debounced function is called after the last invocation.
   * @returns {Function} - A debounced version of the input function
   */
  debounce = (callbackFn, delay = 500) => {
    return (...args) => {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        callbackFn(...args);
        this.timer = null;
      }, delay);
    };
  };

  /**
   * This function render all Components on browser using debouncing.
   * Using debounce seperates state changes and rendering.
   * @constant callbackFn - callback Function will be debounced function.
   * @constant interval - interval between adjacent cats depending on maxWidth and numCats.
   */
  render() {
    const callbackFn = () => {
      const { numCats, maxWidth } = this.state;
      const interval = maxWidth / numCats;
      this.root.innerHTML = '';
      this.cats = [];
      for (let index = 0; index < numCats; index += 1) {
        const locationX = interval * index + Math.random() * 10;
        this.cats[index] = new Cat(locationX);
      }
    };

    this.debounce(callbackFn)();
  }

  animation() {}
}
