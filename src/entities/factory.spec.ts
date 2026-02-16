import { Protocol } from "@flowx-finance/sdk";

import { createPositionManager, createPositionProvider } from "./factory";
import { CetusPositionManager } from "./position/CetusPositionManager";
import { CetusPositionProvider } from "./position/CetusPositionProvider";
import { FlowXV3PositionManager } from "./position/FlowXV3PositionManager";
import { FlowXV3PositionProvider } from "./position/FlowXV3PositionProvider";

describe("Factory", () => {
  describe("createPositionProvider", () => {
    it("should create FlowXV3PositionProvider for FLOWX_V3 protocol", () => {
      const provider = createPositionProvider(Protocol.FLOWX_V3);
      expect(provider).toBeInstanceOf(FlowXV3PositionProvider);
    });

    it("should create CetusPositionProvider for CETUS protocol", () => {
      const provider = createPositionProvider(Protocol.CETUS);
      expect(provider).toBeInstanceOf(CetusPositionProvider);
    });

    it("should throw error for unsupported protocol", () => {
      expect(() => createPositionProvider(Protocol.TURBOS_FIANCE)).toThrow();
    });
  });

  describe("createPositionManager", () => {
    it("should create FlowXV3PositionManager for FLOWX_V3 protocol", () => {
      const manager = createPositionManager(Protocol.FLOWX_V3);
      expect(manager).toBeInstanceOf(FlowXV3PositionManager);
    });

    it("should create CetusPositionManager for CETUS protocol", () => {
      const manager = createPositionManager(Protocol.CETUS);
      expect(manager).toBeInstanceOf(CetusPositionManager);
    });

    it("should throw error for unsupported protocol", () => {
      expect(() => createPositionManager(Protocol.TURBOS_FIANCE)).toThrow();
    });
  });
});
