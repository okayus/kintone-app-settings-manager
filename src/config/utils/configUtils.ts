import {
  isCurrentConfigSchema,
  isLegacyConfigV1,
  isLegacyConfigV2,
  isValidConfigObject,
  type LegacyConfig,
} from "../types/LegacyConfigTypes";

import type { ConfigSchema } from "../../shared/types/Config";

/**
 * 現在のタブインデックスを調整する純粋関数
 */
export const adjustCurrentTab = (
  currentTab: number,
  settingsLength: number,
): number => {
  if (currentTab >= settingsLength && currentTab > 0) {
    return currentTab - 1;
  }
  return currentTab;
};

/**
 * 新しいタブのインデックスを計算する純粋関数
 */
export const calculateNewTabIndex = (settingsLength: number): number =>
  settingsLength;

/**
 * 共通設定のデフォルト値を生成する純粋関数
 */
export const createDefaultCommonSetting = () => ({
  prefix: "",
});

/**
 * レガシー設定データを新形式に変換する純粋関数
 * 型ガードを使用して安全に変換を行う
 *
 * 【なぜこの実装なのか】
 */
export const convertLegacyConfig = (
  parsedConfig: LegacyConfig,
): ConfigSchema => {
  // 不正なデータの場合はデフォルト値を返す
  if (!isValidConfigObject(parsedConfig)) {
    return {
      commonSetting: createDefaultCommonSetting(),
    };
  }

  // レガシー設定 V1 形式 (config プロパティでラップされた形式)
  if (isLegacyConfigV1(parsedConfig)) {
    const config = parsedConfig.config;
    return {
      // 【重要】既存設定にensureSettingPropertiesを適用してtimestampFieldを追加
      // スプレッド演算子だけでは新しい必須プロパティが欠落してバリデーションエラーになる
      commonSetting: config.commonSetting || createDefaultCommonSetting(),
    };
  }

  // レガシー設定 V2 形式 または 現在の形式
  if (isLegacyConfigV2(parsedConfig) || isCurrentConfigSchema(parsedConfig)) {
    return {
      // 【重要】現在の形式でもensureSettingPropertiesを適用
      // 理由: 段階的なスキーマ更新により一部プロパティが欠落している可能性があるため
      commonSetting: parsedConfig.commonSetting || createDefaultCommonSetting(),
    };
  }

  // 未知の形式の場合はデフォルト値を返す
  return {
    commonSetting: createDefaultCommonSetting(),
  };
};

/**
 * 保存用の設定データを作成する純粋関数
 */
export const createSaveConfig = (formData: ConfigSchema) => ({
  config: formData,
});
