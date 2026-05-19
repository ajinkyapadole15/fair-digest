# The Fair Digest — UML Diagrams

This document contains Mermaid-based UML diagrams for the Software Engineering project report.

## 1. Use Case Diagram

```mermaid
usecaseDiagram
  actor User as "User"
  actor Admin as "Admin"
  
  rectangle "The Fair Digest System" {
    usecase UC1 as "Register / Login"
    usecase UC2 as "Submit Article URL"
    usecase UC3 as "Paste Article Text"
    usecase UC4 as "View Analysis Results"
    usecase UC5 as "View Past Briefs"
    usecase UC6 as "View Today's Wire"
  }
  
  User --> UC1
  User --> UC2
  User --> UC3
  User --> UC4
  User --> UC5
  User --> UC6
```

## 2. Class Diagram

```mermaid
classDiagram
  class User {
    +ObjectId _id
    +String username
    +String email
    +String passwordHash
    +Date createdAt
    +comparePassword(password) Boolean
  }

  class Brief {
    +ObjectId _id
    +ObjectId userId
    +String url
    +String title
    +String summary
    +Object bias
    +Object sentiment
    +Array factSignals
    +Array counterpoints
    +Object sourceIntel
    +String model
    +Date createdAt
  }

  class AnalyzeController {
    +analyzeHandler(req, res)
  }

  class ClaudeService {
    +analyzeArticle(text) Object
    +assessCredibility(domain, ipInfo) Object
  }

  class ScraperService {
    +scrapeArticle(url) Object
  }

  class ThreatService {
    +analyzeThreat(domain, ipInfo) Object
  }

  User "1" -- "0..*" Brief : owns >
  AnalyzeController --> ClaudeService : uses
  AnalyzeController --> ScraperService : uses
  AnalyzeController --> ThreatService : uses
```

## 3. Sequence Diagram (Article Analysis Flow)

```mermaid
sequenceDiagram
  actor Client as Frontend
  participant API as AnalyzeController
  participant Scraper as ScraperService
  participant AI as ClaudeService
  participant IP as ipService
  participant Threat as ThreatService
  participant DB as MongoDB

  Client->>API: POST /api/analyze { url }
  activate API
  
  API->>Scraper: scrapeArticle(url)
  activate Scraper
  Scraper-->>API: { title, text }
  deactivate Scraper

  par Parallel Processing
    API->>AI: analyzeArticle(text)
    API->>IP: getSourceIntel(url)
  end
  
  activate AI
  AI-->>API: { summary, bias, ... }
  deactivate AI
  
  activate IP
  IP-->>API: { domain, ip, geoInfo }
  deactivate IP

  API->>Threat: analyzeThreat(domain, geoInfo)
  activate Threat
  Threat-->>API: { threatLevel, riskScore }
  deactivate Threat

  API->>DB: save(Brief)
  activate DB
  DB-->>API: success
  deactivate DB

  API-->>Client: 200 OK { analysis results }
  deactivate API
```

## 4. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string username
        string email
        string passwordHash
        date createdAt
    }
    
    BRIEF {
        ObjectId _id PK
        ObjectId userId FK
        string url
        string title
        string summary
        string model
        date createdAt
    }

    USER ||--o{ BRIEF : "creates"
```

## 5. Data Flow Diagram (DFD) Level 0

```mermaid
flowchart TD
    User([User])
    System((The Fair\nDigest System))
    Claude[Claude AI API]
    IPAPI[ip-api.com]
    NewsAPI[NewsAPI.org]

    User -- Article URL/Text --> System
    System -- Analysis Results --> User
    
    System -- Article Text --> Claude
    Claude -- AI Analysis --> System
    
    System -- IP Address --> IPAPI
    IPAPI -- Geolocation --> System
    
    System -- API Request --> NewsAPI
    NewsAPI -- Top Headlines --> System
```
