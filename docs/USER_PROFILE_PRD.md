# User Profile Page - Product Requirements Document (PRD)

## Overview

This PRD outlines the development of a comprehensive user profile page for the Gnars DAO website. The profile page will serve as a social identity hub, allowing DAO members to view and evaluate each other's contributions, holdings, and governance activities within the ecosystem.

## Objectives

1. **Social Identity**: Create a comprehensive view of a user's identity and activities within the Gnars DAO
2. **Governance Transparency**: Display voting history, proposal creation, and delegation activities
3. **Community Evaluation**: Enable members to assess other users' engagement and trustworthiness
4. **Asset Display**: Showcase NFT holdings and droposal creations
5. **Navigation Hub**: Provide easy access from all user-interactive pages (proposals, auctions, votes)

## User Stories

- As a DAO member, I want to view another member's profile to understand their involvement and contributions
- As a voter, I want to see a user's voting history and reasoning to evaluate their governance participation
- As a delegator, I want to see delegation relationships and voting power distribution
- As a collector, I want to view someone's NFT collection and droposal creations
- As a proposer, I want to see what proposals a user has created or sponsored

## Technical Context & Codebase Integration

### Current Implementation Status
The project already has:
- Basic user profile routing: `/[userWalletAddress]`
- Wallet page component: `WalletPage` in `/src/components/treasure/WalletPage.tsx`
- Proposal voting data: Vote interfaces and GraphQL queries in `/src/app/services/proposal.ts`
- Delegation components: `CastDelegation` component with hooks
- Droposal system: Complete implementation with hooks, components, and utilities
- NFT display: Existing NFT sections and token management
- ENS resolution via `FormattedAddress` component
- Wagmi integration with type-safe contract hooks
- Apollo Client with caching for GraphQL operations
- Chakra UI design system with dark/light mode support

### Key Data Sources to Leverage
1. **Proposal Service** (`/src/app/services/proposal.ts`):
   - Vote history with reasons
   - Proposal creation data
   - Voting weights and support types

2. **Droposal System** (`/src/hooks/useDroposals.ts`):
   - User-created droposals
   - Metadata and media content
   - Sales configuration and performance

3. **Delegation Hooks** (`/src/hooks/wagmiGenerated.ts`):
   - `useReadTokenDelegates` - who user delegated to
   - `useReadGovernorGetVotes` - voting power at specific timestamps
   - Delegation history and relationships

4. **Treasury/Wallet Data** (`/src/hooks/useTreasure.ts`):
   - NFT holdings with metadata
   - Token balances and portfolio value
   - Asset organization and filtering

## Page Structure & Components

### 1. Profile Header Section
**Component**: `UserProfileHeader`
**Location**: `/src/components/profile/UserProfileHeader.tsx`

**Data Requirements**:
- User wallet address (from route params with validation)
- ENS name resolution (use existing `FormattedAddress` component)
- Avatar/PFP (use existing `OptimizedAvatar` component with fallback)
- Basic stats with loading states and error handling
- Real-time delegation power calculations

**Display Elements**:
- Large profile avatar (128px) with hover effects
- Username/ENS or formatted address with copy functionality
- Join date (earliest proposal vote, NFT mint, or first transaction)
- Quick stats cards with skeleton loading states
- Connection status indicator (online/offline for real-time updates)
- Profile completion percentage for new users

**Error States**:
- Invalid address format
- Address not found in DAO ecosystem
- Network connectivity issues
- Partial data loading failures

**Mobile Considerations**:
- Stack stats vertically on mobile
- Reduce avatar size to 96px on small screens
- Implement swipeable stats cards

### 2. Governance Activity Section
**Component**: `GovernanceActivity`
**Location**: `/src/components/profile/GovernanceActivity.tsx`

**Data Sources**:

#### 2.1 Voting History Subsection
**Data Source**: Extended GraphQL query with vote filtering
**Performance Strategy**:
- Implement virtual scrolling for users with 100+ votes
- Paginated loading (20 votes per page)
- Search and filter capabilities
- Cache recent votes using React Query

**Advanced Features**:
- Vote pattern analysis (tendency to vote For/Against/Abstain)
- Voting consistency scoring
- Time-based activity heatmap
- Export voting history functionality

#### 2.2 Proposal Creation Subsection  
**Data Source**: Filter proposals by proposer address with success metrics
**Analytics Display**:
- Proposal success rate calculation
- Average votes received per proposal
- Topics/categories most active in
- Collaboration indicators (co-sponsors, derivative proposals)

#### 2.3 Proposal Engagement Metrics
**New Feature**: Community engagement scoring
- Comments and reactions on proposals
- Proposal view/interaction analytics
- Cross-proposal reference tracking
- Influence network mapping

### 3. Delegation Information Section
**Component**: `DelegationProfile`
**Location**: `/src/components/profile/DelegationProfile.tsx`

**Data Requirements**:
- Real-time delegation power tracking with block number references
- Delegation event history with reasons (from transaction logs)
- Cross-reference with governance participation
- Trust network analysis (delegators' own governance activity)
- Delegation clustering (similar delegates/delegators)

**Privacy Considerations**:
- Allow users to hide delegation relationships (optional)
- Show aggregated stats without revealing individual delegators
- Respect user preferences for delegation visibility

**Display Elements**:
- **Enhanced Delegation Status Card**: 
  - Visual representation of delegation flow
  - Power distribution charts
  - Delegation efficiency metrics
  - Historical power changes graph
- **Smart Delegator Analysis**: 
  - Categorize delegators by activity level
  - Show delegation impact on voting outcomes
  - Highlight "whale" vs "active participant" delegators
- **Delegation Network Visualization**: 
  - Mini network graph showing delegation relationships
  - Connection strength indicators
  - Mutual delegation identification

**Performance Optimizations**:
- Implement delegation power caching with invalidation
- Use WebSocket for real-time delegation updates
- Lazy load delegation history on user interaction

### 4. NFT Holdings Section
**Component**: `ProfileNFTGallery`
**Location**: `/src/components/profile/ProfileNFTGallery.tsx`

**Data Source**: Extend `useTreasure` hook for specific user addresses
**Display Logic**:
- Show NFTs in 3 rows initially (similar to existing treasure page)
- "Show More" button to expand full collection
- Prioritize NFTs with images over those without
- Sort by collection type (Gnars tokens, other collections)
- Filter options: All NFTs | Gnars Tokens | Other Collections

**Integration Notes**:
- Reuse existing `NFTSection` component logic from treasure page
- Implement same loading states and skeleton components
- Maintain consistent styling with current NFT display patterns

### 5. Droposal Portfolio Section  
**Component**: `UserDroposals`
**Location**: `/src/components/profile/UserDroposals.tsx`

**Data Requirements**:
- Filter droposals by proposer address
- Include essential information only: title, image/video thumbnail, mint count, status
- Link to full droposal page for detailed view

**Display Elements**:
- Grid layout similar to main droposals page
- Show thumbnail, title, collection status (active/ended)
- Performance indicators: Total minted, ETH generated
- "View Full Droposal" link to `/droposal/[contractAddress]`

### 6. Social Identity Indicators
**Component**: `SocialMetrics`
**Location**: `/src/components/profile/SocialMetrics.tsx`

**Calculated Metrics**:
- **Governance Participation Score**: Based on voting frequency and proposal engagement
- **Community Contribution Score**: Based on proposals created, votes cast, delegation received
- **Collection Activity**: NFT trading activity, droposal creation success rate
- **Delegation Trust Score**: Amount of voting power delegated to them by others

## Navigation & Accessibility

### Entry Points
1. **Proposal Pages**: Clickable usernames in vote lists, proposal creators
2. **Auction Pages**: Bidder names in auction history
3. **Comments**: User names in proposal vote reasoning
4. **Delegation Interface**: Delegate addresses should be clickable
5. **Members Page**: Member list entries

### URL Structure
- Route: `/[userWalletAddress]`
- Support both ENS names and wallet addresses
- Redirect ENS to wallet address for consistency

## Data Flow & Performance

### Data Architecture Overview
The profile system aggregates data from multiple blockchain sources with intelligent caching and real-time updates. User profile data includes basic info, governance activities, asset holdings, delegation relationships, and social metrics.

### Data Fetching Strategy
1. **Server-Side Rendering (SSR)**: Pre-fetch critical profile data for SEO and performance
2. **Progressive Loading**: Load sections in priority order (header → governance → assets → delegation)
3. **Optimistic Updates**: Show expected states before confirmation
4. **Background Refresh**: Periodic updates without user interaction interruption
5. **Error Recovery**: Automatic retry with exponential backoff
6. **Offline Support**: Cache essential profile data for offline viewing

### Caching Strategy
Profile data uses multi-layered caching:
- Recent activity data cached for 5 minutes
- Historical governance data cached for 10 minutes
- Static NFT metadata cached for 1 hour
- Delegation relationships cached for 2 minutes (more volatile)

Apollo Client implements intelligent cache invalidation and React Query manages optimistic updates for better user experience.

### Performance Monitoring
- Core Web Vitals tracking for profile pages
- User interaction analytics (scroll depth, section engagement)
- Data loading performance metrics
- Error rate monitoring by profile section
- Cache hit/miss ratio tracking

### Existing Hooks to Extend
1. **Create `useUserProfile` hook**: Aggregate data from multiple sources
2. **Extend `useDroposals`**: Add user filtering capability  
3. **Create `useUserVotes` hook**: Filter votes by user address
4. **Create `useUserDelegation` hook**: Comprehensive delegation data
5. **Extend `useTreasure`**: Support non-treasury wallet addresses

### Component Reusability
- Maximize reuse of existing components (`FormattedAddress`, `OptimizedAvatar`, etc.)
- Extend existing card layouts and styling patterns
- Reuse loading states and skeleton components from treasure page

## Technical Implementation Notes

### GraphQL Schema Requirements
Enhanced queries needed for comprehensive user profiles:

**Core Profile Data**: User basic info, governance stats, asset holdings
**Voting History**: Detailed vote records with proposal context and reasoning
**Proposal Activity**: Created proposals with success metrics and engagement data
**Delegation Network**: Current delegations, historical changes, and power distribution
**Social Metrics**: Participation scores, trust indicators, and community engagement
**NFT Holdings**: Token ownership with metadata and transfer history

### New Utility Functions Needed
**Advanced Governance Analytics**: Calculate participation rates, voting patterns, and proposal success metrics
**Delegation Relationship Mapping**: Build comprehensive delegation networks and trust relationships  
**Enhanced Droposal Filtering**: Filter and analyze user-created droposals with performance metrics
**Community Trust Scoring**: Algorithm for calculating user reputation and community standing
**Privacy Data Sanitization**: Respect user privacy settings while maintaining profile functionality
**Real-time Data Synchronization**: Subscribe to blockchain events for live profile updates

## Security, Privacy & Compliance

### Privacy Controls
Users can control visibility of their governance activities, delegation relationships, NFT collections, and proposal history. Profile privacy settings respect user preferences while maintaining essential transparency for DAO governance.

**Privacy Features**:
- Hide voting history from public view
- Aggregate delegation data without revealing individual relationships  
- Control NFT collection visibility
- Opt-out of analytics and tracking
- Make entire profile private or public

### Security Considerations
1. **Address Validation**: Comprehensive validation for all user inputs
2. **Rate Limiting**: Prevent profile scraping and abuse
3. **Content Sanitization**: Clean user-generated content (vote reasons, proposals)
4. **Access Control**: Respect privacy settings and user preferences
5. **Data Encryption**: Sensitive delegation information protection
6. **Audit Logging**: Track access patterns for security monitoring

### Legal Compliance
- **GDPR Compliance**: Right to be forgotten, data portability
- **Data Retention**: Configurable retention policies for historical data
- **Terms of Service**: Clear guidelines on profile data usage
- **User Consent**: Explicit consent for analytics and data processing

## Testing Strategy

### Component Testing Approach
Each profile component requires comprehensive testing for loading states, error handling, data formatting, and user interactions. Focus on edge cases like missing data, network failures, and privacy restrictions.

### Integration Testing Priorities  
- End-to-end profile loading scenarios across different user types
- Cross-component data consistency and state management
- Navigation flow testing from various entry points
- Mobile responsive behavior and touch interactions
- Performance benchmarking for large datasets

## Accessibility & Responsive Design

### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 ratio for all text and UI elements
- **Focus Management**: Clear focus indicators and logical tab order
- **Alternative Text**: Descriptive alt text for all images and charts

### Responsive Breakpoints
**Mobile First Design**: Start with mobile layout and progressively enhance for larger screens
- **Mobile (320px+)**: Single column, stacked sections, simplified navigation
- **Tablet (768px+)**: Two-column grid, sidebar navigation, expanded cards  
- **Desktop (1024px+)**: Three-column layout, full feature set, hover states
- **Large Desktop (1400px+)**: Enhanced spacing, larger content areas

### Mobile-Specific Features
- **Touch Gestures**: Swipe navigation for sections
- **Progressive Disclosure**: Collapsible sections to reduce cognitive load
- **Optimized Images**: WebP format with fallbacks, responsive sizing
- **Reduced Data Usage**: Optional high-resolution content loading

## Analytics & Monitoring

### User Behavior Analytics
Track profile interactions, section engagement, and cross-navigation patterns. Monitor how users discover and interact with profile features to optimize the experience.

**Key Events**: Profile views, section interactions, delegation actions, cross-navigation to proposals/droposals

### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking for profile pages
- **Custom Metrics**: Time to interactive for each profile section
- **Error Tracking**: JavaScript errors, network failures, data inconsistencies
- **User Journey**: Complete profile viewing and interaction flows

## Future Enhancements (Out of Scope)

1. **Profile Customization**: Allow users to set bio, links, preferences
2. **Activity Feed**: Real-time feed of user activities  
3. **Social Features**: Following users, activity notifications
4. **Advanced Analytics**: Detailed governance analytics and insights
5. **Profile Verification**: ENS verification, social media links
6. **Reputation System**: Community-driven reputation scoring

## Success Metrics & KPIs

### Engagement Metrics
1. **Profile View Rate**: % of users who visit profile pages from proposals/auctions
   - Target: 25% increase in profile page visits within 3 months
   - Measurement: GA4 custom events, user flow analysis

2. **Section Engagement**: Average time spent and interaction rate per profile section
   - Target: 60%+ users interact with at least 2 profile sections
   - Measurement: Scroll depth, click tracking, session recording analysis

3. **Cross-Navigation**: Profile page as a hub for discovering other DAO activities
   - Target: 40% of profile visitors navigate to proposals/droposals from profiles
   - Measurement: Referrer tracking, user journey mapping

### Governance Impact
1. **Informed Voting**: Increased vote participation after viewing delegate profiles
   - Target: 15% increase in voting participation from profile viewers
   - Measurement: Before/after analysis of voting behavior

2. **Better Delegation**: More strategic delegation decisions using profile insights
   - Target: 20% increase in delegation changes following profile views
   - Measurement: Delegation event tracking with profile interaction correlation

3. **Proposal Quality**: Higher quality proposals from users who research other proposers
   - Target: 10% increase in proposal success rate from active profile users
   - Measurement: Proposal outcome analysis correlated with profile usage

### Technical Performance
1. **Page Load Speed**: Profile pages load within performance budgets
   - Target: LCP < 2.5s, FID < 100ms, CLS < 0.1
   - Measurement: Core Web Vitals monitoring, Lighthouse CI

2. **Data Accuracy**: Profile information reflects current blockchain state
   - Target: <1% data inconsistency rate
   - Measurement: Automated data validation, user-reported discrepancies

3. **Error Rate**: Minimal profile loading failures
   - Target: <2% error rate for profile page loads
   - Measurement: Error tracking, uptime monitoring

### User Satisfaction
1. **User Feedback**: Positive reception from DAO community
   - Target: >4.0/5.0 average rating in user surveys
   - Measurement: In-app surveys, community Discord feedback

2. **Feature Adoption**: Active use of profile features over time
   - Target: 70% of active users view at least one profile monthly
   - Measurement: Monthly active users analysis, feature usage heat maps

### Business Impact
1. **Community Trust**: Improved trust and transparency in governance
   - Target: Measurable increase in community sentiment scores
   - Measurement: Community surveys, governance participation metrics

2. **DAO Activity**: Overall increase in DAO ecosystem engagement
   - Target: 25% increase in cross-proposal interactions
   - Measurement: User journey analysis, engagement cohort studies

3. **Retention**: Profile users show higher retention rates
   - Target: 15% higher 30-day retention for profile-active users
   - Measurement: Cohort analysis, user lifecycle tracking

### Monitoring Dashboard
Profile KPIs include engagement metrics (profile views, section interactions), performance metrics (load times, error rates), and business impact metrics (cross-navigation, governance correlation, user satisfaction).

## Implementation Strategy

### Development Approach
The user profile system will be implemented through incremental, atomic commits following the detailed task list in `USER_PROFILE_TASK_LIST.md`. Each task is designed to be independently implementable while respecting dependencies between features.

### Task Categories & Flow
1. **Foundation Tasks**: Core infrastructure, TypeScript interfaces, GraphQL queries, hooks, and utilities
2. **Component Tasks**: UI components, layouts, and visual elements
3. **Integration Tasks**: Connecting components to data sources and existing systems
4. **Enhancement Tasks**: Advanced features, real-time updates, and performance optimizations
5. **Testing & Analytics**: Comprehensive testing, monitoring, and documentation

### Implementation Principles
- **Atomic Commits**: Each task results in a single, focused commit
- **Dependency Respect**: Tasks must be completed in dependency order
- **Quality First**: Each implementation includes error handling, accessibility, and mobile support
- **Progressive Enhancement**: Basic functionality first, advanced features layered on top
- **Consistent Patterns**: Follow existing codebase conventions and architecture

### Rollback Strategy
Implement feature flags for gradual rollout and easy rollback if issues arise. Provide fallback to basic wallet page view if advanced profile features fail.

**Risk Mitigation Strategies**:
1. **GraphQL Schema Updates**: Requires backend/subgraph modifications
2. **Caching Infrastructure**: Redis or similar for advanced caching
3. **Analytics Setup**: Mixpanel/Amplitude integration
4. **Design System**: Chakra UI component extensions
5. **Testing Infrastructure**: Jest, React Testing Library, Playwright setup

## Design Consistency

- Follow existing Gnars DAO design system and color palette
- Maintain consistent spacing and component sizing
- Use existing UI components and patterns from Chakra UI setup
- Ensure responsive design for mobile and desktop
- Implement proper dark/light mode support matching site theme

---

*This PRD serves as a comprehensive guide for implementing a user profile system that enhances the Gnars DAO community experience while leveraging existing codebase patterns and components.*
