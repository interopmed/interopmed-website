type ArticleAuthorSource = {
  accountAuthor?: {
    username: string
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
    return article.accountAuthor.displayName || article.accountAuthor.username || article.accountAuthor.email
  }

  if (article.author) {
    return `${article.author.firstName} ${article.author.lastName}`.trim()
  }

  return 'InteropMed'
}
