import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { FileTrieNode } from "./quartz/util/fileTrie"
import { QuartzPluginData } from "./quartz/plugins/vfile"
import { isFolderPath } from "./quartz/util/path"

// ページの表示順（Explorer・フォルダ一覧ページ共通）
// 注意: customSortFn 内にも同じ配列がインラインで定義されている（.toString()シリアライズのため）
// 変更時は customSortFn 内の order 配列も同期すること
export const pageOrder = [
  // 動画編集
  "動画編集",
  "報酬面の説明",
  "CSとのコミュニケーションのとり方について",
  "CapCutのインストール方法",
  "台本作成について",
  "AIから出力された台本の添削について",
  "背景素材について",
  "動画編集について",
  "ジェットカットについて",
  "フォントの色味",
  "画像位置",
  "セーフティゾーン",
  "文字数チェック",
  "強調チェック",
  "提出前のチェックリスト",
  "報酬の申請",
  // インスタ運用
  "インスタ運用",
  "Instagramアカウント作成方法",
  "プロフィール編集方法",
  "プロアカウント切り替え方法",
  "リール投稿のやりかた",
  // YouTubeについて
  "YouTubeについて",
  "YouTubeのアカウントの作成方法について",
  "プロフィール作成の仕方",
  "YouTubeの投稿の仕方",
]

// Explorer の displayName と同等の表示名を取得
// 優先順位: frontmatter.title → filePath のbasename（index時は親dir） → slug セグメント
function getDisplayName(data: QuartzPluginData): string {
  if (data.frontmatter?.title) return data.frontmatter.title

  // filePath からbasename取得（Explorer の fileSegmentHint に相当、slug化前の元名）
  const fp = (data as Record<string, unknown>).filePath as string | undefined
  if (fp) {
    const segments = fp.split("/")
    const base = segments.pop() ?? ""
    const name = base.replace(/\.(md|html)$/, "")
    // index.md の場合は親ディレクトリ名を使う（Explorer の displayName と同等）
    if (name === "index" || name === "_index") {
      return segments.pop() ?? ""
    }
    return name
  }

  // slug から取得（slug化済みなのでフォールバック）
  const slug = data.slug ?? ""
  const normalized = slug.replace(/\/index$/, "").replace(/^index$/, "")
  const parts = normalized.split("/")
  return parts[parts.length - 1] || ""
}

// slug からページ識別用セグメントを取得（pageOrder照合用）
function getSlugSegment(data: QuartzPluginData): string {
  const slug = data.slug ?? ""
  const normalized = slug.replace(/\/index$/, "").replace(/^index$/, "")
  const parts = normalized.split("/")
  return parts[parts.length - 1] || ""
}

// フォルダ一覧ページ用ソート関数（QuartzPluginData用）
export const customFolderSort = (f1: QuartzPluginData, f2: QuartzPluginData): number => {
  const f1Seg = getSlugSegment(f1)
  const f2Seg = getSlugSegment(f2)
  const f1Idx = pageOrder.indexOf(f1Seg)
  const f2Idx = pageOrder.indexOf(f2Seg)

  if (f1Idx !== -1 && f2Idx !== -1) return f1Idx - f2Idx
  if (f1Idx !== -1) return -1
  if (f2Idx !== -1) return 1

  // フォールバック: Explorer側と同じ仕様（フォルダ優先 + numeric localeCompare）
  const f1IsFolder = isFolderPath(f1.slug ?? "")
  const f2IsFolder = isFolderPath(f2.slug ?? "")
  if (f1IsFolder && !f2IsFolder) return -1
  if (!f1IsFolder && f2IsFolder) return 1

  // Explorer の displayName と同等の表示名で比較
  const f1Name = getDisplayName(f1)
  const f2Name = getDisplayName(f2)
  return f1Name.localeCompare(f2Name, undefined, {
    numeric: true,
    sensitivity: "base",
  })
}

const customSortFn = (a: FileTrieNode, b: FileTrieNode) => {
  // トップレベルのフォルダ順
  const folderOrder = ["動画編集", "インスタ運用", "YouTubeについて"]

  // フォルダ順チェック
  const aFolderIdx = folderOrder.indexOf(a.slugSegment)
  const bFolderIdx = folderOrder.indexOf(b.slugSegment)
  if (aFolderIdx !== -1 && bFolderIdx !== -1) return aFolderIdx - bFolderIdx
  if (aFolderIdx !== -1) return -1
  if (bFolderIdx !== -1) return 1

  // ページ順チェック（クライアント側で実行されるため、外部変数を参照せずインラインで定義）
  const order = [
    "動画編集",
    "報酬面の説明",
    "CSとのコミュニケーションのとり方について",
    "CapCutのインストール方法",
    "台本作成について",
    "AIから出力された台本の添削について",
    "背景素材について",
    "動画編集について",
    "ジェットカットについて",
    "フォントの色味",
    "画像位置",
    "セーフティゾーン",
    "文字数チェック",
    "強調チェック",
    "提出前のチェックリスト",
    "報酬の申請",
    "インスタ運用",
    "Instagramアカウント作成方法",
    "プロフィール編集方法",
    "プロアカウント切り替え方法",
    "リール投稿のやりかた",
    "YouTubeについて",
    "YouTubeのアカウントの作成方法について",
    "プロフィール作成の仕方",
    "YouTubeの投稿の仕方",
  ]
  const aIndex = order.indexOf(a.slugSegment)
  const bIndex = order.indexOf(b.slugSegment)
  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
  if (aIndex !== -1) return -1
  if (bIndex !== -1) return 1

  // デフォルト: フォルダ優先、アルファベット順
  if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
    return a.displayName.localeCompare(b.displayName, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  }
  if (!a.isFolder && b.isFolder) return 1
  return -1
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer({ sortFn: customSortFn, folderDefaultState: "open", useSavedState: false }),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({ sortFn: customSortFn, folderDefaultState: "open", useSavedState: false }),
  ],
  right: [],
}
