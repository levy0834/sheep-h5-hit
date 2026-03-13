declare namespace Phaser {
  const AUTO: number;

  namespace Scale {
    const FIT: number;
    const CENTER_BOTH: number;
  }

  namespace Scenes {
    namespace Events {
      const SHUTDOWN: string;
    }
  }

  namespace Math {
    function Clamp(value: number, min: number, max: number): number;
  }

  namespace Types {
    namespace Core {
      interface GameConfig {
        [key: string]: any;
      }
    }
  }

  namespace GameObjects {
    class Container {
      constructor(...args: any[]);
      [key: string]: any;
    }

    class Rectangle {
      constructor(...args: any[]);
      [key: string]: any;
    }

    class Text {
      constructor(...args: any[]);
      [key: string]: any;
    }

    class Graphics {
      constructor(...args: any[]);
      [key: string]: any;
    }

    class Image {
      constructor(...args: any[]);
      [key: string]: any;
    }
  }

  class Scene {
    [key: string]: any;
    constructor(config?: string | Record<string, any>);
  }

  class Game {
    constructor(config: Types.Core.GameConfig);
  }
}

declare module "phaser" {
  export = Phaser;
}
