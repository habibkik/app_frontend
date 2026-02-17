

# Simplify All Verbose Titles, Labels & Descriptions

## Overview
A comprehensive pass to shorten all remaining verbose titles, subtitles, descriptions, stat labels, and button text across all 4 locale files. Only values change -- no key renames, no code changes.

## Changes (English reference)

### Competitors Section (`pages.competitors.*`)
| Key | Current | New |
|-----|---------|-----|
| `outreachTracking` | "Outreach Tracking" | "Outreach" |
| `addCompetitor` | "Add Competitor" | "Add" |
| `trackedCompetitors` | "Tracked Competitors" | "Tracked" |
| `totalInDatabase` | "total in database" | "in database" |
| `yourPricePosition` | "Your Price Position" | "Price Position" |
| `belowMarketAvg` | "Below market average" | "Below avg" |
| `priceAlerts` | "Price Alerts" | "Alerts" |
| `inLast24Hours` | "In the last 24 hours" | "Last 24h" |
| `productsMonitored` | "Products Monitored" | "Monitored" |
| `acrossAllCompetitors` | "Across all competitors" | "All competitors" |
| `priceIndexTrends` | "Price Index Trends" | "Price Trends" |
| `12MonthComparison` | "12-month competitor pricing comparison" | "12-month comparison" |
| `last12Months` | "Last 12 months" | "12 months" |
| `categoryPriceComparison` | "Category Price Comparison" | "Category Comparison" |
| `yourPricingVsCompetitor` | "Your pricing vs. competitor average by category" | "Your price vs. competitor avg" |
| `productImageAnalysis` | "Product Image Analysis" | "Product Analysis" |
| `uploadToFindSuppliers` | "Upload a product image to find suppliers and substitute products with their suppliers" | "Upload to find suppliers & substitutes" |
| `addNewCompetitor` | "Add New Competitor" | "Add Competitor" |
| `enterCompetitorUrl` | "Enter a competitor's website URL for AI-powered analysis." | "Enter competitor URL for AI analysis" |
| `analyzingCompetitor` | "Analyzing Competitor..." | "Analyzing..." |
| `aiExtractingInsights` | "AI is extracting pricing, products, and strategic insights" | "Extracting pricing & insights" |
| `aiPoweredDesc` | "Enter a URL and click Analyze to get competitive intelligence including pricing, products, strengths, and strategic recommendations." | "Enter a URL to get competitive intelligence" |
| `recentPriceAlerts` | "Recent Price Alerts" | "Recent Alerts" |
| `aiMarketInsights` | "AI Market Insights" | "Market Insights" |
| `yourCompetitiveEdge` | "Your Competitive Edge" | "Competitive Edge" |
| `dragAndDropOrBrowse` | "Drag and drop an image or click to browse. We'll find suppliers and alternatives." | "Drop an image or browse" |

### Image Upload (`pages.imageUpload.*`)
| Key | Current | New |
|-----|---------|-----|
| `sellerTitle` | "Analyze Market Opportunity" | "Market Analysis" |
| `sellerSubtitle` | "Upload a product image to get competitor insights, pricing strategy, and market data" | "Upload to get competitor & pricing insights" |
| `buyerTitle` | "Find Suppliers for Any Product" | "Find Suppliers" |
| `buyerSubtitle` | "Upload a product image and we'll find matching suppliers, pricing, and alternatives" | "Upload to find suppliers & alternatives" |
| `producerTitle` | "Reverse Engineer Any Product" | "Reverse Engineer" |
| `producerSubtitle` | "Upload a product image to generate a complete Bill of Materials with cost estimates" | "Upload to generate BOM & cost estimates" |
| `dragDropOrClick` | "Drag and drop your product image, or click to browse" | "Drop image or click to browse" |

### API Keys (`pages.apiKeys.*`)
| Key | Current | New |
|-----|---------|-----|
| `description` | "Manage your API keys for AI services and external integrations" | "AI & external service keys" |
| `addApiKey` | "Add API Key" | "Add Key" |
| `addNewApiKey` | "Add New API Key" | "New Key" |
| `addNewApiKeyDesc` | "Add a new API key for external services. Keys are stored securely." | "Keys are stored securely" |
| `securityNoteDesc` | "API keys are encrypted and stored securely. Never share your API keys publicly. Consider rotating keys periodically for enhanced security." | "Keys are encrypted. Never share publicly. Rotate periodically." |

### Social Media (`pages.socialMedia.*`)
| Key | Current | New |
|-----|---------|-----|
| `title` | "Social Media Integrations" | "Social Media" |
| `description` | "Connect your social media accounts to post content and manage messages from your own accounts" | "Connect accounts to post & manage messages" |

### Email Integration (`pages.emailIntegration.*`)
| Key | Current | New |
|-----|---------|-----|
| `description` | "Connect an email service provider to send transactional and marketing emails" | "Connect email service providers" |
| `emailSettingsDesc` | "Configure email automation and notification preferences" | "Automation & notifications" |
| `autoResponderDesc` | "Automatically reply to incoming emails when you're away" | "Auto-reply when away" |
| `emailNotificationsDesc` | "Receive email notifications for important updates" | "Get notified for updates" |
| `dailyDigestDesc` | "Get a daily summary of activity and insights" | "Daily activity summary" |

### Messaging (`pages.messaging.*`)
| Key | Current | New |
|-----|---------|-----|
| `title` | "Messaging Platforms" | "Messaging" |
| `description` | "Connect messaging platforms for WhatsApp, SMS, and team notifications" | "WhatsApp, SMS & team notifications" |
| `autoResponseSettings` | "Auto-Response Settings" | "Auto-Response" |
| `autoResponseSettingsDesc` | "Configure automatic responses for incoming messages" | "Auto-reply to messages" |
| `enableAutoResponseDesc` | "Automatically respond to incoming messages" | "Auto-reply to messages" |

### Profile (`pages.profileSection.*`)
| Key | Current | New |
|-----|---------|-----|
| `title` | "Profile Information" | "Profile" |
| `description` | "Update your personal information and preferences" | "Personal info & preferences" |

### Notifications (`pages.notifications.*`)
| Key | Current | New |
|-----|---------|-----|
| `emailNotificationsDesc` | "Choose what emails you want to receive" | "Choose which emails to receive" |
| `pushNotificationsDesc` | "Browser and desktop notifications" | "Browser & desktop alerts" |
| `smsNotificationsDesc` | "Text message alerts for critical updates" | "Text alerts for critical updates" |
| `urgentAlertsDesc` | "Critical updates that require immediate attention" | "Needs immediate attention" |
| `rfqDeadlinesDesc` | "Reminders for approaching RFQ deadlines" | "Approaching RFQ deadlines" |

### Security (`pages.security.*`)
| Key | Current | New |
|-----|---------|-----|
| `passwordDesc` | "Change your password or enable two-factor authentication" | "Password & two-factor auth" |
| `twoFactor` | "Two-Factor Authentication" | "Two-Factor Auth" |
| `twoFactorDesc` | "Add an extra layer of security to your account" | "Extra security layer" |
| `loginNotificationsDesc` | "Get notified when someone logs into your account" | "Alerts for new logins" |
| `activeSessionsDesc` | "Manage your active sessions across devices" | "Sessions across devices" |
| `dangerZoneDesc` | "Irreversible and destructive actions" | "Irreversible actions" |
| `deleteAccountDesc` | "Permanently delete your account and all data" | "Permanently delete all data" |

### Feasibility (`pages.feasibility.*`)
| Key | Current | New |
|-----|---------|-----|
| `exportReport` | "Export Report" | "Export" |
| `newAnalysis` | "New Analysis" | "New" |
| `selectProductBOM` | "Select Product / BOM" | "Product / BOM" |
| `fullAnalysis` | "Full Analysis" | "Analysis" |
| `analysisHistory` | "Analysis History" | "History" |

### GTM (`pages.gtm.*`)
| Key | Current | New |
|-----|---------|-----|
| `exportPlan` | "Export Plan" | "Export" |
| `trackProgress` | "Track progress across all go-to-market phases" | "Progress across all phases" |
| `distributionPerformance` | "Distribution and marketing channel performance" | "Channel performance" |

### Suppliers (`pages.suppliers.*`)
| Key | Current | New |
|-----|---------|-----|
| `browseAll` | "Browse All" | "Browse" |
| `aiInstantlyIdentifies` | "Our AI instantly identifies your product and activates a dedicated agent team." | "AI identifies your product & activates agents" |
| `agentsScanThousands` | "Agents scan thousands of suppliers to find the best prices, MOQs, and terms for your exact product." | "Scan thousands of suppliers for best prices & terms" |
| `getRealTimeMarketPricing` | "Get real-time market pricing data and leverage insights to negotiate better deals." | "Real-time pricing to negotiate better deals" |
| `discoverAlternativeProducts` | "Discover alternative products that match your specs at better prices or availability." | "Alternatives matching your specs at better prices" |
| `agentsContinuouslyMonitor` | "Agents continuously monitor for price drops, new suppliers, and better opportunities." | "Monitor price drops & new opportunities" |

### Sidebar labels
| Key | Current | New |
|-----|---------|-----|
| `sidebar.competitorTracking` | "Competitor Tracking" | "Competitors" |
| `sidebar.productionFeasibility` | "Production Feasibility" | "Feasibility" |
| `sidebar.sellerAnalytics` | "Seller Analytics" | "Analytics" |

## Technical Details
- Update same keys across all 4 locale files: `en.json`, `fr.json`, `es.json`, `ar.json`
- Only translation values change -- no key renames, no component code changes
- Approximately 70 key-value pairs across 4 files = ~280 line edits
- All translation keys in components remain unchanged

