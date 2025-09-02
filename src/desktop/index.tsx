import { KintoneRestAPIClient } from "@kintone/rest-api-client";

import { renderExecutionButton } from "./components/desktopUIHelpers";
import { upsertAppSettingsRecords } from "./core/upsertAppSettingsRecords";

import type { ConfigSchema } from "src/shared/types/Config";
import type { KintoneEvent } from "src/shared/types/KintoneTypes";

((PLUGIN_ID) => {
  kintone.events.on("app.record.index.show", async (event: KintoneEvent) => {
    const pluginConfig = kintone.plugin.app.getConfig(PLUGIN_ID).config;
    if (!pluginConfig) return;
    const config = JSON.parse(pluginConfig).config as ConfigSchema;

    const restApiClient = new KintoneRestAPIClient();

    renderExecutionButton(
      "alert-button",
      () => upsertAppSettingsRecords(restApiClient, event, config),
      "アプリ設定を取得",
    );
  });
})(kintone.$PLUGIN_ID);
