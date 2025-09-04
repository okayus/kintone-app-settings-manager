# 関数型プログラミング パターン解説

## createRecordBuilder の高階関数パターン

### 概要
`createRecordBuilder` は「関数を返す関数」（高階関数）のパターンを使用しています。これにより依存性注入とカリー化を組み合わせた柔軟な設計を実現しています。

### コード構造の解説

```typescript
const createRecordBuilder =
  (fieldCreator: FieldDataCreator = createFieldData) =>
  (
    apps: Awaited<ReturnType<KintoneRestAPIClient["app"]["getApps"]>>["apps"],
    apiResponses: AppSettingsApiResponses,
    config: ConfigSchema,
  ) => {
    // 実際の処理
  };
```

### なぜこの書き方ができるのか？

#### 1. 関数はJavaScriptの第一級オブジェクト
JavaScriptでは関数も値として扱えるため、関数が関数を返すことができます。

```typescript
// 基本例：関数を返す関数
const makeGreeting = (prefix: string) => (name: string) => `${prefix}, ${name}!`;

const sayHello = makeGreeting("Hello");
console.log(sayHello("Alice")); // "Hello, Alice!"
```

#### 2. アロー関数の省略記法
アロー関数では、式が単一の場合 `return` と `{}` を省略できます。

```typescript
// 完全版
const createRecordBuilder = (fieldCreator: FieldDataCreator = createFieldData) => {
  return (apps, apiResponses, config) => {
    // 処理
  };
};

// 省略版（実際のコード）
const createRecordBuilder =
  (fieldCreator: FieldDataCreator = createFieldData) =>
  (apps, apiResponses, config) => {
    // 処理
  };
```

#### 3. カリー化（Currying）の応用
複数の引数を取る関数を、一つずつ引数を取る関数の連鎖に変換する技法です。

```typescript
// 通常の関数（複数引数）
function buildRecords(fieldCreator, apps, apiResponses, config) {
  // 処理
}

// カリー化した関数
const createRecordBuilder = (fieldCreator) => (apps, apiResponses, config) => {
  // 処理
};
```

### なぜこのパターンを使うのか？

#### 1. 依存性注入
デフォルトの `createFieldData` を使いつつ、テスト時にはモック関数を注入できます。

```typescript
// 本番環境
export const buildUpdateRecords = createRecordBuilder(); // createFieldDataを使用

// テスト環境
const testBuildRecords = createRecordBuilder(mockFieldCreator); // モック関数を注入
```

#### 2. 設定の固定化
一部の引数を事前に決めて、残りの引数だけを後で渡すことができます。

```typescript
// Step 1: fieldCreatorを固定
const recordBuilder = createRecordBuilder(customFieldCreator);

// Step 2: 残りの引数を渡して実行
const records = recordBuilder(apps, apiResponses, config);
```

#### 3. 関数の再利用性向上
異なる設定で複数のビルダーを作成できます。

```typescript
const defaultBuilder = createRecordBuilder();
const customBuilder = createRecordBuilder(customFieldCreator);
const testBuilder = createRecordBuilder(mockFieldCreator);
```

### 実行の流れ

```typescript
// 1. createRecordBuilder を呼び出し、recordBuilder 関数を取得
const recordBuilder = createRecordBuilder(customFieldCreator);
//    ↓ この時点で fieldCreator = customFieldCreator が固定される

// 2. recordBuilder を呼び出し、実際の処理を実行
const result = recordBuilder(apps, apiResponses, config);
//    ↓ 固定された customFieldCreator と新しい引数で処理実行
```

### 初学者向けの理解ポイント

1. **関数も値**: JavaScriptでは関数を変数に代入したり、引数として渡したりできる
2. **クロージャ**: 内側の関数は外側の関数の変数（fieldCreator）にアクセスできる
3. **段階的な実行**: 引数を段階的に渡して、最終的に処理を実行する
4. **設定と実行の分離**: 設定（fieldCreator）と実際のデータ（apps, apiResponses, config）を分けて扱える

このパターンにより、テストしやすく、拡張しやすく、再利用しやすいコードを書くことができます。