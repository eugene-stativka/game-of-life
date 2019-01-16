export class CanvasAnimation {
  private readonly render: (() => void) | null;

  constructor({
    render,
    target,
  }: {
    render: (ctx: CanvasRenderingContext2D) => () => void;
    target: HTMLElement;
  }) {
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    canvas.setAttribute("width", "400px");
    canvas.setAttribute("height", "200px");
    canvas.setAttribute("id", "canvas");
    target.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    this.render = ctx && render(ctx);
    this.draw();
  }

  private draw() {
    if (this.render) {
      this.render();
    }
    window.requestAnimationFrame(() => this.draw());
  }
}
