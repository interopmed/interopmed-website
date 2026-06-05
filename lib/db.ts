import { prisma } from './prisma'

const INSIGHT_TYPE = 'insight'

/**
 * Database utility functions for InteropMed
 * B2B Interoperability Standards Platform
 */

export const db = {
  prisma,

  // Company queries
  company: {
    findBySlug: (slug: string) =>
      prisma.company.findUnique({
        where: { slug },
        include: {
          departments: true,
          employees: true,
          products: true,
          standards: true,
        },
      }),
    
    findById: (id: string) =>
      prisma.company.findUnique({
        where: { id },
        include: {
          departments: true,
          products: { take: 10 },
          standards: { take: 10 },
        },
      }),
  },

  // Product queries
  product: {
    findBySlug: (slug: string) =>
      prisma.product.findUnique({
        where: { slug },
        include: {
          features: true,
          useCases: true,
          company: true,
        },
      }),
    
    findById: (id: string) =>
      prisma.product.findUnique({
        where: { id },
        include: {
          features: true,
          useCases: true,
          company: true,
        },
      }),

    findByCompany: (companyId: string) =>
      prisma.product.findMany({
        where: { companyId, status: 'active' },
        include: {
          features: true,
          useCases: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
  },

  // Standard queries
  standard: {
    findBySlug: (slug: string) =>
      prisma.standard.findUnique({
        where: { slug },
        include: {
          versions: true,
          products: true,
        },
      }),
    
    findByCompany: (companyId: string) =>
      prisma.standard.findMany({
        where: { companyId },
        include: {
          versions: true,
          products: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
  },

  // Article queries
  article: {
    findBySlug: (slug: string) =>
      prisma.article.findUnique({
        where: { slug },
        include: {
          author: true,
          comments: true,
        },
      }),
    
    findPublished: () =>
      prisma.article.findMany({
        where: { status: 'published' },
        include: {
          author: true,
          accountAuthor: true,
        },
        orderBy: { publishedAt: 'desc' },
      }),
  },

  // Insight queries use the Article model with type="insight"
  insight: {
    findMany: (options?: { status?: string; take?: number }) =>
      prisma.article.findMany({
        where: {
          type: INSIGHT_TYPE,
          ...(options?.status ? { status: options.status } : {}),
        },
        include: {
          author: true,
          accountAuthor: true,
        },
        orderBy: { createdAt: 'desc' },
        ...(options?.take ? { take: options.take } : {}),
      }),

    findPublishedBySlug: (slug: string) =>
      prisma.article.findFirst({
        where: {
          slug,
          type: INSIGHT_TYPE,
          status: 'published',
        },
        include: { author: true, accountAuthor: true },
      }),

    count: (status?: string) =>
      prisma.article.count({
        where: {
          type: INSIGHT_TYPE,
          ...(status ? { status } : {}),
        },
      }),

    create: (data: {
      title: string
      slug: string
      excerpt?: string | null
      content: string
      category: string
      tags: string[]
      featuredImage?: string | null
      metaDescription?: string | null
      metaKeywords?: string[]
      status: string
      publishedAt: Date | null
      authorId?: string | null
      accountAuthorId?: string | null
    }) =>
      prisma.article.create({
        data: {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          category: data.category,
          tags: data.tags,
          featuredImage: data.featuredImage,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords,
          status: data.status,
          publishedAt: data.publishedAt,
          type: INSIGHT_TYPE,
          ...(data.authorId ? { author: { connect: { id: data.authorId } } } : {}),
          ...(data.accountAuthorId ? { accountAuthor: { connect: { id: data.accountAuthorId } } } : {}),
        },
      }),
  },

  // Documentation queries
  documentation: {
    findBySlug: (slug: string) =>
      prisma.documentation.findUnique({
        where: { slug },
        include: {
          author: true,
          childDocs: true,
        },
      }),
  },

  // Employee queries
  employee: {
    findByEmail: (email: string) =>
      prisma.employee.findUnique({
        where: { email },
        include: {
          department: true,
          company: true,
          teamMemberships: { include: { team: true } },
        },
      }),
    
    findByCompany: (companyId: string) =>
      prisma.employee.findMany({
        where: { companyId, status: 'active' },
        include: {
          department: true,
          teamMemberships: true,
        },
      }),
  },

  // Partnership queries
  partnership: {
    findBySlug: (slug: string) =>
      prisma.partnership.findUnique({
        where: { slug },
      }),
    
    findByCompany: (companyId: string) =>
      prisma.partnership.findMany({
        where: { companyId, status: 'active' },
        orderBy: { createdAt: 'desc' },
      }),
  },

  // UseCase queries
  useCase: {
    findBySlug: (slug: string) =>
      prisma.useCase.findUnique({
        where: { slug },
        include: {
          testimonials: true,
          products: true,
        },
      }),
    
    findByCompany: (companyId: string) =>
      prisma.useCase.findMany({
        where: { companyId, status: 'published' },
        include: {
          testimonials: true,
          products: true,
        },
      }),
  },
}

export { prisma }
