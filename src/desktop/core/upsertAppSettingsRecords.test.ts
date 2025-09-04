import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import {
  buildUpdateRecords,
  fetchAppProcessSettings,
} from "./upsertAppSettingsRecords";

import type { ConfigSchema } from "../../shared/types/Config";
import type { KintoneRestAPIClient } from "@kintone/rest-api-client";

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

  describe("fetchAppProcessSettings", () => {
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
      const appIds = ["1", "2"];
      const result = await fetchAppProcessSettings(mockKintoneClient, appIds);

      // 検証
      expect(result).toEqual([
        { appId: "1", response: mockProcessManagementResponse },
        { appId: "2", response: mockProcessManagementResponse },
      ]);

      expect(mockKintoneClient.app.getProcessManagement).toHaveBeenCalledTimes(
        2,
      );
      expect(mockKintoneClient.app.getProcessManagement).toHaveBeenCalledWith({
        app: "1",
      });
      expect(mockKintoneClient.app.getProcessManagement).toHaveBeenCalledWith({
        app: "2",
      });
    });
  });

  describe("buildUpdateRecords", () => {
    it("kintoneRestAPIClients.app.getAppsとfetchProcessManagementResponsesの結果を基に、updateAllRecords用のレコード配列を生成する", () => {
      // テストデータ作成
      const mockConfig = {
        commonSetting: {
          appId: "appId",
          name: "appName",
          getProcessManagementResponse: "processManagement",
        },
      } as ConfigSchema & {
        commonSetting: {
          getProcessManagementResponse: string; // 非オプショナルとして扱う
        };
      };

      const mockApps = [
        {
          appId: "1",
          name: "App 1",
          code: "",
          description: "",
          spaceId: null,
          threadId: null,
          createdAt: "",
          creator: { code: "", name: "" },
          modifiedAt: "",
          modifier: { code: "", name: "" },
        },
        {
          appId: "2",
          name: "App 2",
          code: "",
          description: "",
          spaceId: null,
          threadId: null,
          createdAt: "",
          creator: { code: "", name: "" },
          modifiedAt: "",
          modifier: { code: "", name: "" },
        },
      ];

      const mockProcessManagementResponse = [
        {
          appId: "1",
          response: { enable: true, states: {}, actions: [], revision: "1" },
        },
        {
          appId: "2",
          response: { enable: true, states: {}, actions: [], revision: "1" },
        },
      ];

      // レスポンスコレクションの作成
      const mockResponses = {
        processManagement: mockProcessManagementResponse,
      };

      // 関数実行
      const result = buildUpdateRecords(mockApps, mockResponses, mockConfig);

      // 期待値
      const expectObj: Parameters<
        KintoneRestAPIClient["record"]["updateAllRecords"]
      >[0]["records"] = [
        {
          updateKey: {
            field: mockConfig.commonSetting.appId,
            value: "1",
          },
          record: {
            [mockConfig.commonSetting.name]: { value: "App 1" },
            [mockConfig.commonSetting.getProcessManagementResponse]: {
              value: JSON.stringify({
                enable: true,
                states: {},
                actions: [],
                revision: "1",
              }),
            },
          },
        },
        {
          updateKey: {
            field: mockConfig.commonSetting.appId,
            value: "2",
          },
          record: {
            [mockConfig.commonSetting.name]: { value: "App 2" },
            [mockConfig.commonSetting.getProcessManagementResponse]: {
              value: JSON.stringify({
                enable: true,
                states: {},
                actions: [],
                revision: "1",
              }),
            },
          },
        },
      ];

      // 検証
      expect(result).toEqual(expectObj);
    });
  });
});
