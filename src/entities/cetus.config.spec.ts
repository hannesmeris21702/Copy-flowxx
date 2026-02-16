import { Protocol } from "@flowx-finance/sdk";
import { CETUS_CONFIG, MAPPING_POOL_OBJECT_TYPE, MAPPING_POSITION_OBJECT_TYPE } from "../constants";

describe("Cetus Configuration", () => {
  it("should have valid Cetus package ID", () => {
    expect(CETUS_CONFIG.packageId).toBeDefined();
    expect(CETUS_CONFIG.packageId).toMatch(/^0x[a-f0-9]+$/);
  });

  it("should have valid Cetus global config ID", () => {
    expect(CETUS_CONFIG.globalConfigId).toBeDefined();
    expect(CETUS_CONFIG.globalConfigId).toMatch(/^0x[a-f0-9]+$/);
  });

  it("should have valid Cetus pools ID", () => {
    expect(CETUS_CONFIG.poolsId).toBeDefined();
    expect(CETUS_CONFIG.poolsId).toMatch(/^0x[a-f0-9]+$/);
  });

  it("should have valid Cetus global vault ID", () => {
    expect(CETUS_CONFIG.globalVaultId).toBeDefined();
    expect(CETUS_CONFIG.globalVaultId).toMatch(/^0x[a-f0-9]+$/);
  });

  it("should have Cetus position object type mapped", () => {
    expect(MAPPING_POSITION_OBJECT_TYPE[Protocol.CETUS]).toBeDefined();
    expect(MAPPING_POSITION_OBJECT_TYPE[Protocol.CETUS]).toContain("::position::Position");
  });

  it("should have Cetus pool object type mapped", () => {
    expect(MAPPING_POOL_OBJECT_TYPE[Protocol.CETUS]).toBeDefined();
    expect(MAPPING_POOL_OBJECT_TYPE[Protocol.CETUS]).toContain("::pool::Pool");
  });

  it("should have consistent package ID across configuration", () => {
    const packageId = CETUS_CONFIG.packageId;
    const positionType = MAPPING_POSITION_OBJECT_TYPE[Protocol.CETUS];
    const poolType = MAPPING_POOL_OBJECT_TYPE[Protocol.CETUS];

    expect(positionType).toContain(packageId);
    expect(poolType).toContain(packageId);
  });
});
