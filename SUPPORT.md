# Support for Payment-Skill

## Community Support (Free)

### GitHub Issues
**URL:** https://github.com/kraskoruk/payment-skill/issues

Use GitHub Issues for:
- Bug reports
- Feature requests
- Questions about usage
- Documentation improvements
- General discussion

**How to create an issue:**
1. Go to https://github.com/kraskoruk/payment-skill/issues
2. Click "New Issue"
3. Choose the appropriate template (Bug Report, Feature Request, Question)
4. Fill in the details
5. Submit

**Response time:** Community-driven, no guarantees

### GitHub Discussions
**URL:** https://github.com/kraskoruk/payment-skill/discussions

Use Discussions for:
- Q&A
- Ideas and proposals
- Show and tell
- General community chat

## Documentation

### Wiki (Community-Maintained)
**URL:** https://github.com/kraskoruk/payment-skill/wiki

The wiki is currently **empty** and **community-maintained**. This means:
- Anyone with a GitHub account can contribute
- Users add documentation based on their experience
- Not officially maintained by the creators
- Quality and accuracy vary

**How to contribute to the wiki:**
1. Go to https://github.com/kraskoruk/payment-skill/wiki
2. Click "New Page" or edit existing pages
3. Add your knowledge and examples
4. Save

### README (Official)
The main README.md in the repository contains:
- Installation instructions
- Basic usage examples
- CLI command reference
- Configuration options

This is the **official documentation** maintained with the code.

## Why Are Support Links Empty?

### GitHub Issues
The issues page is **functional** but may appear empty because:
- No issues have been reported yet (new project)
- Issues are resolved and closed
- It's a community resource that fills over time

**You can be the first!** If you have a question or problem, create an issue.

### Wiki
The wiki is **intentionally empty** to encourage community contribution:
- Open-source projects often rely on community docs
- Users add content based on real-world usage
- Prevents outdated official documentation
- Allows for diverse use cases and examples

**How it works:**
1. Users try the software
2. They figure things out
3. They document their findings in the wiki
4. Knowledge accumulates over time

## Getting Help

### Before Asking
1. Read the README.md thoroughly
2. Check existing GitHub Issues (open and closed)
3. Search the wiki (if content exists)
4. Try the `--help` flag on CLI commands

### When Creating an Issue
Include:
- What you were trying to do
- What you expected to happen
- What actually happened
- Error messages (if any)
- Your configuration (without API keys!)
- Steps to reproduce

### Example:
```
Title: Error when creating Wise transfer

Description:
I'm trying to create a transfer using the wise_standard_transfer template.

Command used:
payment-skill pay --template wise_standard_transfer --amount 100 --currency EUR

Expected: Transfer to be created
Actual: Error "Profile ID required"

Config:
- OS: macOS 14
- Node version: 20.x
- Payment-skill version: 1.0.0
```

## Commercial Support

There is **no official commercial support** for payment-skill.

If you need guaranteed support, consider:
- Hiring a developer familiar with the project
- Using official APIs directly with vendor support
- Commercial payment processing solutions

## Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead:
1. Check if the issue is already known
2. Contact the maintainer privately (if contact info available)
3. Or create a general "Security concern" issue without details
4. Wait for maintainer to contact you

## Contributing to Support

You can help by:
1. Answering questions in GitHub Issues
2. Adding to the wiki
3. Improving the README
4. Creating tutorials or blog posts
5. Sharing your use cases

## Disclaimer

Remember: **Payment-skill is provided as-is without warranties.**

See LICENSE file for full disclaimer.

Use at your own risk. The community can help, but ultimately you are
responsible for your financial transactions.