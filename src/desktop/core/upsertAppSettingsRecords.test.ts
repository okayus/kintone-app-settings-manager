import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { fetchProcessManagementResponses } from "./upsertAppSettingsRecords";

import type { ConfigSchema } from "../../shared/types/Config";
import type { KintoneRestAPIClient } from "@kintone/rest-api-client";
import type { Record as KintoneRecord } from "@kintone/rest-api-client/lib/src/client/types";
import type { KintoneEvent } from "src/shared/types/KintoneTypes";

vi.mock("../shared/util/kintoneSdk");

// テスト用のグローバルkintoneオブジェクト設定
const mockKintone = {
  app: {
    getId: vi.fn(),
    getQueryCondition: vi.fn(),
  },
  plugin: {
    app: {
      getConfig: vi.fn(),
    },
  },
};

// 型安全なテストレコード作成
function createTestRecord(
  fields: Record<string, { type: string; value: string }>,
): KintoneRecord {
  const record: Record<string, any> = {};
  for (const [key, value] of Object.entries(fields)) {
    record[key] = value;
  }
  return record;
}

describe("MessageService", () => {
  let mockRestApiClient: {
    app: { getApps: Mock; getProcessManagementResponse: Mock };
    record: { getRecords: Mock };
  };

  beforeEach(() => {
    // global.kintone設定
    Object.assign(global, { kintone: mockKintone });

    // モック初期化
    mockKintone.plugin.app.getConfig.mockReturnValue({});

    // 最小限のmockRestApiClient
    mockRestApiClient = {
      app: {
        getApps: vi.fn(),
        getProcessManagementResponse: vi.fn(),
      },
      record: {
        getRecords: vi.fn(),
      },
    };
  });

  describe("fetchProcessManagementResponses", () => {
    it("アプリIDの配列から、getProcessManagementのレスポンスの配列を取得し、IDとレスポンスを紐づけたオブジェクトの配列を返す", async () => {
      // KintoneRestAPIClientのモックを作成
      const mockKintoneClient = {
        app: {
          getProcessManagement: vi.fn(),
        },
      } as unknown as KintoneRestAPIClient;

      // モックの戻り値を設定
      const mockProcessManagementResponse = {
        enable: true,
        states: {},
        actions: [],
        revision: "1",
      };

      vi.mocked(mockKintoneClient.app.getProcessManagement).mockResolvedValue(
        mockProcessManagementResponse,
      );

      // テスト実行
      const appIds = [1, 2];
      const result = await fetchProcessManagementResponses(
        mockKintoneClient,
        appIds,
      );

      // 検証
      expect(result).toEqual([
        { appId: 1, response: mockProcessManagementResponse },
        { appId: 2, response: mockProcessManagementResponse },
      ]);

      expect(mockKintoneClient.app.getProcessManagement).toHaveBeenCalledTimes(
        2,
      );
      expect(mockKintoneClient.app.getProcessManagement).toHaveBeenCalledWith({
        app: 1,
      });
      expect(mockKintoneClient.app.getProcessManagement).toHaveBeenCalledWith({
        app: 2,
      });
    });
  });
});
