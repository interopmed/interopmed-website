import { randomBytes, scrypt as scryptCallback } from 'node:crypto'
import { promisify } from 'node:util'
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: '.env.local' })
dotenv.config()

const { Pool } = pg
const scrypt = promisify(scryptCallback)
const SAMPLE_PASSWORD = 'InteropTest123!'

const sampleUsers = [
  ['amara', 'amara-silva', 'Amara Silva', 'amara.silva@example.test'],
  ['ben', 'ben-carter', 'Ben Carter', 'ben.carter@example.test'],
  ['chen', 'chen-wei', 'Chen Wei', 'chen.wei@example.test'],
  ['daniela', 'daniela-ruiz', 'Daniela Ruiz', 'daniela.ruiz@example.test'],
  ['elias', 'elias-mensah', 'Elias Mensah', 'elias.mensah@example.test'],
  ['fatima', 'fatima-noor', 'Fatima Noor', 'fatima.noor@example.test'],
  ['grace', 'grace-kim', 'Grace Kim', 'grace.kim@example.test'],
  ['hugo', 'hugo-martin', 'Hugo Martin', 'hugo.martin@example.test'],
  ['iman', 'iman-hassan', 'Iman Hassan', 'iman.hassan@example.test'],
  ['jordan', 'jordan-lee', 'Jordan Lee', 'jordan.lee@example.test'],
]

const postTopics = [
  ['fhir', 'Working through a FHIR R4 patient matching workflow today. Clear identifiers and provenance make every downstream integration easier.'],
  ['hl7', 'Documented an HL7 v2 ADT mapping pattern that keeps local extensions isolated and maintainable.'],
  ['api', 'A small API contract improvement can save hours of integration support. Consistent errors and examples matter.'],
  ['implementation', 'Successful interoperability programs pair technical standards with ownership, testing, and operational feedback.'],
  ['security', 'Reviewing least-privilege access patterns for clinical data exchange and service-to-service authentication.'],
  ['general', 'Looking forward to learning from other healthcare interoperability practitioners in this community.'],
  ['fhir', 'Testing terminology bindings early helped us catch validation issues before they reached production.'],
  ['implementation', 'A concise implementation guide is one of the best tools for aligning clinical and engineering teams.'],
  ['api', 'Exploring event-driven updates alongside REST APIs for more responsive care coordination workflows.'],
  ['security', 'Privacy-aware logging should provide useful diagnostics without exposing sensitive clinical payloads.'],
]

function normalizeSslMode(connectionString) {
  return connectionString.replace(
    /([?&]sslmode=)(prefer|require|verify-ca)(?=&|$)/i,
    '$1verify-full'
  )
}

async function hashPassword(password) {
  const salt = randomBytes(16)
  const derivedKey = await scrypt(password, salt, 64)
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured')
  }

  const pool = new Pool({
    connectionString: normalizeSslMode(process.env.DATABASE_URL),
  })
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const passwordHash = await hashPassword(SAMPLE_PASSWORD)
    const users = []

    for (const [username, publicHandle, displayName, email] of sampleUsers) {
      const result = await client.query(
        `INSERT INTO "AuthUser" (
          "id", "username", "publicHandle", "email", "passwordHash", "displayName", "role",
          "isActive", "createdAt", "updatedAt"
        )
        VALUES (
          concat('sample_', md5($1)), $1, $2, $3, $4, $5, 'member',
          true, NOW(), NOW()
        )
        ON CONFLICT ("username") DO UPDATE SET
          "displayName" = EXCLUDED."displayName",
          "publicHandle" = EXCLUDED."publicHandle",
          "passwordHash" = EXCLUDED."passwordHash",
          "role" = 'member',
          "isActive" = true,
          "updatedAt" = NOW()
        RETURNING "id", "username"`,
        [username, publicHandle, email, passwordHash, displayName]
      )
      users.push(result.rows[0])
    }

    const posts = []

    for (let index = 0; index < users.length; index += 1) {
      const user = users[index]
      const [topic, content] = postTopics[index]
      const postId = `sample_post_${index + 1}`

      const result = await client.query(
        `INSERT INTO "UserPost" (
          "id", "content", "topic", "visibility", "status",
          "authorId", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, 'public', 'published', $4, NOW() - ($5 * INTERVAL '1 day'), NOW())
        ON CONFLICT ("id") DO UPDATE SET
          "content" = EXCLUDED."content",
          "topic" = EXCLUDED."topic",
          "visibility" = 'public',
          "status" = 'published',
          "authorId" = EXCLUDED."authorId",
          "updatedAt" = NOW()
        RETURNING "id"`,
        [postId, content, topic, user.id, index]
      )
      posts.push(result.rows[0])
    }

    for (let followerIndex = 0; followerIndex < users.length; followerIndex += 1) {
      for (let offset = 1; offset <= 3; offset += 1) {
        const followingIndex = (followerIndex + offset) % users.length
        await client.query(
          `INSERT INTO "UserFollow" (
            "id", "followerId", "followingId", "createdAt"
          )
          VALUES (
            concat('sample_follow_', md5($1 || ':' || $2)), $1, $2, NOW()
          )
          ON CONFLICT ("followerId", "followingId") DO NOTHING`,
          [users[followerIndex].id, users[followingIndex].id]
        )
      }
    }

    for (let postIndex = 0; postIndex < posts.length; postIndex += 1) {
      for (let offset = 1; offset <= 4; offset += 1) {
        const userIndex = (postIndex + offset) % users.length
        await client.query(
          `INSERT INTO "UserPostLike" (
            "id", "postId", "userId", "createdAt"
          )
          VALUES (
            concat('sample_like_', md5($1 || ':' || $2)), $1, $2, NOW()
          )
          ON CONFLICT ("postId", "userId") DO NOTHING`,
          [posts[postIndex].id, users[userIndex].id]
        )
      }

      const commenter = users[(postIndex + 2) % users.length]
      await client.query(
        `INSERT INTO "UserPostComment" (
          "id", "content", "status", "postId", "authorId", "createdAt", "updatedAt"
        )
        VALUES (
          $1, 'Thanks for sharing this. The practical implementation detail is especially useful.',
          'published', $2, $3, NOW(), NOW()
        )
        ON CONFLICT ("id") DO UPDATE SET
          "postId" = EXCLUDED."postId",
          "authorId" = EXCLUDED."authorId",
          "updatedAt" = NOW()`,
        [`sample_comment_${postIndex + 1}`, posts[postIndex].id, commenter.id]
      )
    }

    await client.query('COMMIT')

    const summary = await client.query(
      `SELECT
        (SELECT COUNT(*)::int FROM "AuthUser" WHERE "email" LIKE '%@example.test') AS users,
        (SELECT COUNT(*)::int FROM "UserFollow" WHERE "id" LIKE 'sample_follow_%') AS follows,
        (SELECT COUNT(*)::int FROM "UserPost" WHERE "id" LIKE 'sample_post_%') AS posts,
        (SELECT COUNT(*)::int FROM "UserPostLike" WHERE "id" LIKE 'sample_like_%') AS likes,
        (SELECT COUNT(*)::int FROM "UserPostComment" WHERE "id" LIKE 'sample_comment_%') AS comments`
    )

    console.log('Social sample data ready:', summary.rows[0])
    console.log(`Sample login password: ${SAMPLE_PASSWORD}`)
    console.log(`Example profile: /people/${sampleUsers[0][1]}`)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
