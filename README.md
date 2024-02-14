<img src = 'https://github.com/yonghyeun/Reflow-test/blob/main/imgs/result.gif?raw=true' alt = 'result'>

```
Reflow-test
├─ .vscode
│  └─ settings.json
├─ app.js
├─ cat.js
├─ imgs
│  ├─ after timer.gif
│  ├─ before timer.gif
│  ├─ cat.gif
│  └─ result.gif
├─ index.html
├─ LICENSE
├─ main.js
├─ style.css
└─ thinking.md

```

##### Go to Developer Tools, navigate to the Performance tab, and check the performance :)

---

# Investigating Rendering Processes for Each Case

## `Un-caching TOP`

![Un-caching TOP](https://velog.velcdn.com/images/yonghyeun/post/3a50da3e-88a1-441f-90dc-16546af3df5e/image.gif)

### Time Taken to Compose One Frame

![Time Taken to Compose One Frame](https://velog.velcdn.com/images/yonghyeun/post/4731114e-e2f9-4b2f-9bdd-86f13916a667/image.png)

It took approximately `138.63ms` to compose one frame. This translates to around `7FPS`.

Why did this happen?

### Execution of `Batch DOM Manipulation`: ❌

![Execution of Batch DOM Manipulation](https://velog.velcdn.com/images/yonghyeun/post/7c5422af-5f38-4160-bd91-76fa9b9b2821/image.gif)

Examining the call tree within a single task, we notice that the `getLocation` method is executed when the `move` method of a node is called. If `isCaching` is `false`, the `getLocation` method calculates the current position of the data using `offsetTop + trnaslateY(px)`.

When `get offsetTOP` is executed, a reflow occurs. Following `getLocation`, DOM operations of the node are invoked, triggering another reflow.

This sequence repeats for each node.

> Recalculate style -> layout processes occur repeatedly for each node.

![Reflow Process](https://velog.velcdn.com/images/yonghyeun/post/f2fce7b8-2b8d-4068-81fd-07f1d7a91e07/image.png)

On average, each layout calculation took `0.30ms`. Thus, the lengthy duration for composing one frame was primarily due to the numerous layout calculations.

> ??? : The browser rendering engine queues DOM operations and processes them collectively, claiming to optimize the process.

The reason for not executing `Batch DOM Manipulation` is that when the browser engine is asked for the current position of a node, it must execute any previously queued DOM operations before providing the position. This is because DOM operations can trigger reflows, potentially altering the layout of other nodes.

Thus, immediate computation of the current node's `Computed Style attribute` leads to immediate `DOM Manipulation`.

> ### Summary
>
> `Uncaching TOP` suffered from repetitive reflows as `Batch DOM Manipulation` couldn't be utilized.

> > Changing the `TOP` attribute itself triggers a reflow.

## `Caching TOP`

![Caching TOP](https://velog.velcdn.com/images/yonghyeun/post/575667ee-db0c-4ebf-8603-8cc27a232767/image.gif)

![Cached Data](https://velog.velcdn.com/images/yonghyeun/post/6a2b3c7d-f906-4049-88b2-ad7250aacf43/image.png)

### Time Taken to Compose One Frame

![Time Taken to Compose One Frame](https://velog.velcdn.com/images/yonghyeun/post/49c51637-09ce-408a-8768-1243d5d8f4de/image.gif)

It took approximately `16ms` to compose one frame, maintaining `60FPS`.

### Execution of `Batch DOM Manipulation`: ⭕

Although `getLocation` is executed in `Caching TOP`, the method uses cached data when `isCaching` is `true`.

Thus, `Batch DOM Manipulation` is possible, leading to only one layout calculation per task.

The key point is that, despite both `Un-caching TOP` and `Caching TOP` triggering a reflow due to changing the `TOP` attribute, the former incurred numerous reflows (`0.3ms * number of nodes`), while the latter managed multiple node reflows collectively within `0.4ms`.

## `Un-Caching Translate`

![Un-Caching Translate](https://velog.velcdn.com/images/yonghyeun/post/f1c67974-39fc-4f22-b326-e168c64004dd/image.gif)
![Cached Data](https://velog.velcdn.com/images/yonghyeun/post/078be4e6-ea1b-4846-aa70-7aba1f322c00/image.png)

### Time Taken to Compose One Frame

![Time Taken to Compose One Frame](https://velog.velcdn.com/images/yonghyeun/post/8dd4cae8-5112-4df8-9a44-2c8cf49847a0/image.gif)

It took approximately `26.92ms` to compose one frame, resulting in around `35FPS`.

> I thought using `translate` would be much better than changing the `top` attribute every time, but it wasn't.

### Execution of `Batch DOM Manipulation`: ❌

Even in `Un-Caching Translate`, `get OffsetTOP` is executed, forcing immediate `DOM Operation` execution.

Consequently, each node triggers `Recalculated Style` due to changes in the `translateY` property, although this process is relatively short compared to layout calculation.

As `translate` is utilized, no layout occurs after `Recalculate Style`.

Rendering updates are scheduled after the altered styles post `Recalculate Style`, illustrating a collective rendering process.

## `Caching Translate`

![Caching Translate](https://velog.velcdn.com/images/yonghyeun/post/77bcf625-9e22-4844-b07f-acd33962ba53/image.gif)

![Cached Data](https://velog.velcdn.com/images/yonghyeun/post/1c61fe87-b3e2-44f6-87c6-ba93769512cb/image.png)

### Time Taken to Compose One Frame

![Time Taken to Compose One Frame](https://velog.velcdn.com/images/yonghyeun/post/23f60725-71a3-4733-bd21-89ea8f467018/image.gif)

It took approximately `16ms` to compose one frame, maintaining `60FPS`.

### Execution of `Batch DOM Manipulation`: ⭕

In `Caching Translate`, `getLocation` utilizes cached data, enabling `Batch DOM Manipulation`.

Thus, tasks execute `Recalculate Style, pre-paint, paint, commit`, and other processes collectively.

![Batch DOM Manipulation](https://velog.velcdn.com/images/yonghyeun/post/69dbb6f6-6e55-4c23-be50-1cb2f335ffbd/image.png)

Notably, the `Commit` phase takes longer in `Caching Translate`, unlike other scenarios where it lasts around `0.4ms`. Here, it extends to `10ms`.

It's unclear whether this delay is due to maintaining `60FPS` by waiting at `Commit` even after completing all processes or because shifting layers during `Commit` takes longer.

> Regardless, `Commit` occurs only once, so there's no inherent reaso
