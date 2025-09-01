import { KintoneRestAPIClient } from "@kintone/rest-api-client";

import { renderExecutionButton } from "./components/desktopUIHelpers";
import { upsertAppSettingsRecords } from "./core/upsertAppSettingsRecords";

((PLUGIN_ID) => {
  kintone.events.on("app.record.index.show", async () => {
    const pluginConfig = kintone.plugin.app.getConfig(PLUGIN_ID).config;
    if (!pluginConfig) return;

    const restApiClient = new KintoneRestAPIClient();

    renderExecutionButton(
      "alert-button",
      () => upsertAppSettingsRecords(restApiClient),
      "アプリ設定を取得",
    );
  });
})(kintone.$PLUGIN_ID);
