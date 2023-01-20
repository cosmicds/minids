class KeyPressInfo {
  code: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;

  constructor(
    code: string,
    modifiers?: {
      ctrl?: boolean;
      alt?: boolean;
      shift?: boolean;
      meta?: boolean;
    }
  ) {
    this.code = code;
    this.ctrl = modifiers?.ctrl ?? false;
    this.alt = modifiers?.alt ?? false;
    this.shift = modifiers?.shift ?? false;
    this.meta = modifiers?.meta ?? false;
  }

  matches(event: KeyboardEvent): boolean {
    return (
      event.code === this.code &&
      event.ctrlKey === this.ctrl &&
      event.altKey === this.alt &&
      event.shiftKey === this.shift &&
      event.metaKey === this.meta
    );
  }
}

export class KeyboardControlSettings {
  zoomIn: KeyPressInfo[];
  zoomOut: KeyPressInfo[];
  moveUp: KeyPressInfo[];
  moveDown: KeyPressInfo[];
  moveLeft: KeyPressInfo[];
  moveRight: KeyPressInfo[];
  moveAmount: number;

  constructor({
    zoomIn = [new KeyPressInfo("KeyI")],
    zoomOut = [new KeyPressInfo("KeyO")],
    moveUp = [new KeyPressInfo("KeyW")],
    moveLeft = [new KeyPressInfo("KeyA")],
    moveDown = [new KeyPressInfo("KeyS")],
    moveRight =[new KeyPressInfo("KeyD")],
    moveAmount = 20
  }) {
    this.zoomIn = zoomIn;
    this.zoomOut = zoomOut;
    this.moveUp = moveUp;
    this.moveDown = moveDown;
    this.moveLeft = moveLeft;
    this.moveRight = moveRight;
    this.moveAmount = moveAmount;
  }

  // This is to make sure that we can't make a listener for an action type that doesn't exist
  readonly actionTypes = [
    "zoomIn",
    "zoomOut",
    "moveUp",
    "moveDown",
    "moveLeft",
    "moveRight",
  ] as const;
  
  makeListener(
    actionName: KeyboardControlSettings["actionTypes"][number],
    action: () => void
  ): (e: KeyboardEvent) => void {
    return (e) => {
      for (const keyPress of this[actionName]) {
        if (keyPress.matches(e)) {
          action();
        }
      }
    };
  }
}
