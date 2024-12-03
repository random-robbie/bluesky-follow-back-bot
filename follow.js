import { BskyAgent } from '@atproto/api'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const BSKY_USERNAME = process.env.BSKY_USERNAME
const BSKY_PASSWORD = process.env.BSKY_PASSWORD

// Configuration
const CONFIG = {
  baseDelay: 1000,  // Base delay between follows (1 second)
  maxRetries: 3,    // Maximum number of retries for rate-limited requests
  rateLimitDelay: 15 * 60 * 1000  // 15 minutes pause when rate limited
}

class RateLimitError extends Error {
  constructor(resetTime) {
    super('Rate limit exceeded')
    this.name = 'RateLimitError'
    this.resetTime = resetTime
  }
}

// Create a new agent instance
const agent = new BskyAgent({
  service: 'https://bsky.social'
})

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function handleRateLimit(error) {
  console.log('\n⚠️ Rate limit detected!')
  const waitTime = CONFIG.rateLimitDelay
  console.log(`Pausing operations for ${waitTime / 1000 / 60} minutes...`)
  await sleep(waitTime)
  console.log('Resuming operations...')
}

async function retryWithBackoff(operation, maxRetries = CONFIG.maxRetries) {
  let lastError
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Check if it's a rate limit error
      if (error.status === 429 || error.message.includes('rate limit')) {
        await handleRateLimit(error)
        continue
      }
      
      // For other errors, use exponential backoff
      const waitTime = Math.min(1000 * Math.pow(2, i), 10000)
      console.log(`Retry ${i + 1}/${maxRetries} after ${waitTime}ms...`)
      await sleep(waitTime)
    }
  }
  throw lastError
}

async function getFollowersList(myDID) {
  const followers = []
  let cursor = null

  try {
    do {
      const response = await retryWithBackoff(async () => 
        await agent.getFollowers({
          actor: myDID,
          limit: 100,
          cursor: cursor
        })
      )

      followers.push(...response.data.followers)
      cursor = response.data.cursor
      
      console.log(`Fetched ${followers.length} followers so far...`)
      await sleep(CONFIG.baseDelay)
    } while (cursor)

    return followers
  } catch (error) {
    console.error('Error fetching followers:', error)
    throw error
  }
}

async function getFollowingList(myDID) {
  const following = new Set()
  let cursor = null

  try {
    do {
      const response = await retryWithBackoff(async () =>
        await agent.getFollows({
          actor: myDID,
          limit: 100,
          cursor: cursor
        })
      )

      response.data.follows.forEach(follow => following.add(follow.did))
      cursor = response.data.cursor
      
      console.log(`Fetched ${following.size} following so far...`)
      await sleep(CONFIG.baseDelay)
    } while (cursor)

    return following
  } catch (error) {
    console.error('Error fetching following list:', error)
    throw error
  }
}

async function autoFollow() {
  try {
    console.log('🔑 Logging in to BlueSky...')
    await retryWithBackoff(async () =>
      await agent.login({
        identifier: BSKY_USERNAME,
        password: BSKY_PASSWORD,
      })
    )
    console.log('✅ Login successful')

    const profile = await retryWithBackoff(async () =>
      await agent.getProfile({
        actor: BSKY_USERNAME
      })
    )
    const myDID = profile.data.did

    console.log('\n📊 Fetching followers...')
    const followers = await getFollowersList(myDID)
    console.log(`✅ Found ${followers.length} total followers`)

    console.log('\n📊 Fetching following list...')
    const following = await getFollowingList(myDID)
    console.log(`✅ Found ${following.size} accounts you're following`)

    console.log('\n🤝 Starting follow operations...')
    let followCount = 0
    let skipCount = 0

    for (const follower of followers) {
      try {
        if (!following.has(follower.did)) {
          await retryWithBackoff(async () => 
            await agent.follow(follower.did)
          )
          followCount++
          console.log(`✅ Followed ${follower.handle} (${followCount} new follows)`)
          await sleep(CONFIG.baseDelay)
        } else {
          skipCount++
        }
      } catch (error) {
        console.error(`❌ Failed to follow ${follower.handle}:`, error.message)
      }
    }

    console.log('\n📈 Final Statistics:')
    console.log(`✅ Successfully followed ${followCount} new accounts`)
    console.log(`⏩ Skipped ${skipCount} already-followed accounts`)
    console.log(`📊 Total followers processed: ${followers.length}`)

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message)
    if (error.status) console.error('Status code:', error.status)
    if (error.stack) console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Run the script
console.log('🚀 Starting BlueSky Auto-Follow Script...\n')
autoFollow()
