import type { WidgetProps } from "@rjsf/utils";

/**
 * kintone アプリ情報の型
 */
export interface KintoneApp {
  appId: string;
  name: string;
}

/**
 * kintone フィールド情報の型
 */
export interface KintoneField {
  code: string;
  label: string;
  type: string;
}

/**
 * kintone ビュー情報の型
 */
export interface KintoneView {
  id: string;
  name: string;
  type: string;
}

/**
 * カスタムウィジェットの共通プロパティ
 */
export interface CustomWidgetBaseProps extends WidgetProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * アプリセレクターのプロパティ
 */
export interface AppSelectorProps extends CustomWidgetBaseProps {
  value: string;
}

/**
 * フィールドセレクターのプロパティ
 */
export interface FieldSelectorProps extends CustomWidgetBaseProps {
  value: string;
}

/**
 * ビューセレクターのプロパティ
 */
export interface ViewSelectorProps extends CustomWidgetBaseProps {
  value: string;
}
