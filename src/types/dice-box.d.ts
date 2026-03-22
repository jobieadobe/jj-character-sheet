declare module '@3d-dice/dice-box' {
  interface DiceBoxConfig {
    assetPath?: string;
    theme?: string;
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
    lightIntensity?: number;
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
    roll(notation: string | object[]): Promise<DiceResult[]>;
    clear(): void;
    onRollComplete: ((results: DiceResult[]) => void) | null;
  }

  export default DiceBox;
}
