type ArticleAuthorSource = {
  accountAuthor?: {
    username: string
    publicHandle?: string
    email: string
    displayName: string | null
  } | null
  author?: {
    firstName: string
    lastName: string
  } | null
}

export function getArticleAuthorName(article: ArticleAuthorSource) {
  if (article.accountAuthor) {
    return article.accountAuthor.displayName || article.accountAuthor.publicHandle || 'InteropMed member'
  }

  if (article.author) {
    return `${article.author.firstName} ${article.author.lastName}`.trim()
  }

  return 'InteropMed'
}
