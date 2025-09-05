import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchAppProcessSettings } from "./syncAppSettingsToKintone";
import { syncSingleAppSettingToKintone } from "./syncSingleAppSettingToKintone";

import type { ConfigSchema } from "../../shared/types/Config";
import type { AppRecordDetailShowEvent } from "../../shared/types/KintoneTypes";
import type { KintoneRestAPIClient } from "@kintone/rest-api-client";

// モック設定
vi.mock("./syncAppSettingsToKintone", () => ({
  fetchAppProcessSettings: vi.fn(),
}));

describe("syncSingleAppSettingToKintone", () => {
  let mockKintoneClient: KintoneRestAPIClient;
  let mockConfig: ConfigSchema;
  let mockEvent: AppRecordDetailShowEvent;

  beforeEach(() => {
    mockKintoneClient = {
      record: {
        updateRecord: vi.fn(),
      },
    } as unknown as KintoneRestAPIClient;

    mockConfig = {
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

    mockEvent = {
      appId: 100,
      recordId: 123,
      record: {
        appId: {
          value: "456",
          type: "SINGLE_LINE_TEXT",
        },
      },
    } as unknown as AppRecordDetailShowEvent;

    vi.clearAllMocks();
  });

  it("イベントからアプリ情報を取得してプロセス管理設定を更新する", async () => {
    // モックの戻り値を設定
    const mockProcessManagementResponse = [
      {
        appId: "456",
        response: { enable: true, states: {}, actions: [], revision: "1" },
      },
    ];

    vi.mocked(fetchAppProcessSettings).mockResolvedValue(
      mockProcessManagementResponse,
    );

    // テスト実行
    await syncSingleAppSettingToKintone(
      mockKintoneClient,
      mockEvent,
      mockConfig,
    );

    // 検証
    expect(fetchAppProcessSettings).toHaveBeenCalledWith(mockKintoneClient, [
      "456",
    ]);
    expect(mockKintoneClient.record.updateRecord).toHaveBeenCalledWith({
      app: "100",
      id: "123",
      record: {
        processManagement: {
          value: JSON.stringify({
            enable: true,
            states: {},
            actions: [],
            revision: "1",
          }),
        },
      },
    });
  });

  it("レコードに対象アプリIDが含まれない場合はエラーを投げる", async () => {
    const eventWithoutAppId = {
      ...mockEvent,
      record: {},
    } as unknown as AppRecordDetailShowEvent;

    await expect(
      syncSingleAppSettingToKintone(
        mockKintoneClient,
        eventWithoutAppId,
        mockConfig,
      ),
    ).rejects.toThrow("Target app ID not found in record");
  });

  it("プロセス管理設定が無効の場合は取得しない", async () => {
    const configWithoutProcessManagement = {
      commonSetting: {
        appId: "appId",
        name: "appName",
      },
    } as ConfigSchema;

    await syncSingleAppSettingToKintone(
      mockKintoneClient,
      mockEvent,
      configWithoutProcessManagement,
    );

    expect(fetchAppProcessSettings).not.toHaveBeenCalled();
    expect(mockKintoneClient.record.updateRecord).toHaveBeenCalledWith({
      app: "100",
      id: "123",
      record: {},
    });
  });

  it("レコード更新に失敗した場合はエラーを投げる", async () => {
    vi.mocked(fetchAppProcessSettings).mockResolvedValue([]);

    const updateError = new Error("Update failed");
    vi.mocked(mockKintoneClient.record.updateRecord).mockRejectedValue(
      updateError,
    );

    await expect(
      syncSingleAppSettingToKintone(mockKintoneClient, mockEvent, mockConfig),
    ).rejects.toThrow("Update failed");
  });
});
