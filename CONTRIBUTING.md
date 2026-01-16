# Contributing to LERA

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch: `git checkout -b feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit with descriptive messages
7. Push to your fork
8. Create a pull request

## Code Style Guidelines

### Backend (Python)
- Follow PEP 8 style guidelines
- Use meaningful variable names
- Add docstrings to functions
- Keep functions small and focused

### Frontend (JavaScript/React)
- Use ES6+ syntax
- Follow React best practices
- Use meaningful component names
- Add PropTypes or TypeScript

## Commit Message Format

```
type(scope): brief description

Detailed explanation if needed

- Use one of: feat, fix, docs, style, refactor, test, chore
- Keep description under 50 characters
- Use imperative mood
```

Examples:
```
feat(auth): add JWT token refresh mechanism
fix(events): resolve date parsing validation error
docs(api): update authentication endpoints documentation
```

## Testing Requirements

### Backend
- Unit tests for all new functions
- Integration tests for API endpoints
- Test error handling scenarios

### Frontend
- Component tests for new UI elements
- Integration tests for user flows
- Test error states and loading

## Pull Request Process

1. **Title**: Clear and descriptive
2. **Description**: Explain what and why
3. **Testing**: List tests performed
4. **Screenshots**: Include UI changes
5. **Checklist**: 
   - [ ] Code follows style guidelines
   - [ ] Self-reviewed code
   - [ ] Tested thoroughly
   - [ ] Documentation updated

## Branch Naming

- `feature/feature-name` - New features
- `fix/issue-description` - Bug fixes
- `docs/update-type` - Documentation
- `refactor/component-name` - Code improvements

## Code Review Guidelines

### Review Checklist
- [ ] Code is readable and maintainable
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed

### Review Feedback
- Be constructive and specific
- Suggest improvements
- Acknowledge good practices
- Ask questions if unclear

## Release Process

1. Update version numbers
2. Update CHANGELOG.md
3. Create release tag
4. Deploy to staging
5. Test deployment
6. Deploy to production

## Community Guidelines

- Be respectful and inclusive
- Help others in discussions
- Share knowledge and experience
- Follow project code of conduct
