declare module '@3d-dice/dice-box' {
  interface DiceBoxConfig {
    assetPath?: string;
    theme?: string;
    themeColor?: string;
    scale?: number;
    gravity?: number;
    mass?: number;
    friction?: number;
    restitution?: number;
    linearDamping?: number;
    angularDamping?: number;
    settleTimeout?: number;
    delay?: number;
    enableShadows?: boolean;
    shadowTransparency?: number;
    lightIntensity?: number;
  }

  interface RollOptions {
    theme?: string;
    themeColor?: string;
    newStartPoint?: boolean;
  }

  interface DiceResult {
    groupId: number;
    rollId: number;
    sides: number;
    theme: string;
    themeColor: string;
    value: number;
  }

  class DiceBox {
    constructor(selector: string, config?: DiceBoxConfig);
    init(): Promise<void>;
    roll(notation: string | string[] | object[], options?: RollOptions): Promise<DiceResult[]>;
    add(notation: string | string[] | object[], options?: RollOptions): Promise<DiceResult[]>;
    clear(): void;
    updateConfig(config: Partial<DiceBoxConfig>): void;
    onRollComplete: ((results: DiceResult[]) => void) | null;
  }

  export default DiceBox;
}
