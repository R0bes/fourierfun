import { Grid } from './Grid';

window.onload = () => {

  let grid = new Grid();

  setInterval(() => {
    grid.render();
  }, 1000 / 60);
}