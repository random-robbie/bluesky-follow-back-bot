# BlueSky Auto-Follow Script 🚀

A robust Node.js script that automatically follows back your BlueSky followers. Built with rate limiting protection and error handling to ensure reliable operation.

Run on a Clean VPS. Use this link and add a valid payment method, you immediately receive a $200, 60-day account credit.

[![DigitalOcean Referral Badge](https://web-platforms.sfo2.cdn.digitaloceanspaces.com/WWW/Badge%203.svg)](https://www.digitalocean.com/?refcode=e22bbff5f6f1&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge)

## Features ✨

- Automatically follows back all your followers
- Smart rate limit detection and handling
- Exponential backoff for failed requests
- Detailed progress logging and statistics
- Secure credential management using environment variables
- Handles pagination for large follower lists
- Skips already-followed accounts

## Prerequisites 📋

- Node.js (v14 or higher)
- npm
- A BlueSky account

## Installation 🛠️

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bluesky-auto-follow.git
cd bluesky-auto-follow
```

2. Install dependencies:
```bash
npm install @atproto/api dotenv
```

3. Create a `.env` file in the project root:
```env
BSKY_USERNAME=your.username
BSKY_PASSWORD=your_password
```

## Usage 🚀

Run the script using either:
```bash
npm start
```
or
```bash
node follow.js
```

## Configuration ⚙️

You can modify the following settings in the `CONFIG` object within `follow.js`:

```javascript
const CONFIG = {
  baseDelay: 1000,            // Base delay between operations (ms)
  maxRetries: 3,              // Maximum retry attempts
  rateLimitDelay: 15 * 60 * 1000  // Rate limit pause duration (ms)
}
```

## Error Handling 🛡️

The script includes comprehensive error handling:
- Automatic retry with exponential backoff
- Rate limit detection and automatic pausing
- Detailed error logging
- Graceful failure handling

## Example Output 📝

```
🚀 Starting BlueSky Auto-Follow Script...

🔑 Logging in to BlueSky...
✅ Login successful

📊 Fetching followers...
✅ Found 150 total followers

📊 Fetching following list...
✅ Found 100 accounts you're following

🤝 Starting follow operations...
✅ Followed user.bsky.social (1 new follows)
...

📈 Final Statistics:
✅ Successfully followed 50 new accounts
⏩ Skipped 100 already-followed accounts
📊 Total followers processed: 150
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer ⚠️

This script is for educational purposes and personal use. Please use responsibly and in accordance with BlueSky's terms of service and API guidelines.

## Support 💬

If you encounter any issues or have questions, please open an issue in the GitHub repository.

---
Remember to ⭐ this repo if you found it helpful!
