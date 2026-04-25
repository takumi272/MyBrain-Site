import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { FileTrieNode } from "./quartz/util/fileTrie"

const customSortFn = (a: FileTrieNode, b: FileTrieNode) => {
  // トップレベルのフォルダ順
  const folderOrder = ["動画編集", "インスタ運用"]

  // フォルダ内のページ順
  const pageOrder = [
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
    "Instagramアカウント作成方法",
    "プロフィール編集方法",
    "プロアカウント切り替え方法",
    "リール投稿のやりかた",
    "YouTubeのアカウントの作成方法について",
    "プロフィール作成の仕方",
    "YouTubeの投稿の仕方",
  ]

  // フォルダ順チェック
  const aFolderIdx = folderOrder.indexOf(a.slugSegment)
  const bFolderIdx = folderOrder.indexOf(b.slugSegment)
  if (aFolderIdx !== -1 && bFolderIdx !== -1) return aFolderIdx - bFolderIdx
  if (aFolderIdx !== -1) return -1
  if (bFolderIdx !== -1) return 1

  // ページ順チェック
  const aIndex = pageOrder.indexOf(a.slugSegment)
  const bIndex = pageOrder.indexOf(b.slugSegment)
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
    Component.Explorer({ sortFn: customSortFn }),
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
    Component.Explorer({ sortFn: customSortFn }),
  ],
  right: [],
}
