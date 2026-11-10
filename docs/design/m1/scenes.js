window.SG_SCENES = [
  {
    "id": "foundations",
    "en": "Design foundations",
    "am": "የንድፍ መሠረቶች",
    "platform": "System",
    "reference": "B01",
    "section": "18",
    "fields": [],
    "states": [
      "default"
    ]
  },
  {
    "id": "register",
    "en": "Create your account",
    "am": "መለያዎን ይፍጠሩ",
    "platform": "CM",
    "reference": "B02:05",
    "section": "5.1",
    "fields": [
      "contact",
      "password",
      "terms"
    ],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "signin",
    "en": "Welcome back",
    "am": "እንኳን ደህና መጡ",
    "platform": "CM",
    "reference": "B02:06",
    "section": "5.1",
    "fields": [
      "contact",
      "password"
    ],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "verify",
    "en": "Verify your account",
    "am": "መለያዎን ያረጋግጡ",
    "platform": "CM",
    "reference": "B02:07",
    "section": "5.1",
    "fields": [
      "code"
    ],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery",
      "expired",
      "rate-limited"
    ]
  },
  {
    "id": "recover",
    "en": "Recover your account",
    "am": "መለያዎን መልሰው ያግኙ",
    "platform": "CM",
    "reference": "B02:08",
    "section": "5.1",
    "fields": [
      "contact"
    ],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "reset",
    "en": "Choose a new password",
    "am": "አዲስ የይለፍ ቃል ይምረጡ",
    "platform": "CM",
    "reference": "B02:08",
    "section": "5.1",
    "fields": [
      "password",
      "confirm"
    ],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "profile",
    "en": "Make yourself at home",
    "am": "መገለጫዎን ያዘጋጁ",
    "platform": "CM",
    "reference": "B02:09; B03:02",
    "section": "5.1",
    "fields": [
      "name",
      "username",
      "bio"
    ],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "language",
    "en": "Your language, your choice",
    "am": "የሚመርጡትን ቋንቋ ይምረጡ",
    "platform": "CM",
    "reference": "B02:11",
    "section": "5.1",
    "fields": [],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "permissions",
    "en": "A little more personal",
    "am": "ፈቃዶችዎን ያስተዳድሩ",
    "platform": "CM",
    "reference": "B02:13; B11:16",
    "section": "13.4",
    "fields": [],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "application",
    "en": "Bring your store to Segno",
    "am": "መደብርዎን ይመዝግቡ",
    "platform": "MM",
    "reference": "B02:15–16; B09:01",
    "section": "5.1",
    "fields": [
      "store",
      "business",
      "owner",
      "document",
      "declaration"
    ],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "application-status",
    "en": "Your merchant application",
    "am": "የነጋዴ ማመልከቻዎ",
    "platform": "MM",
    "reference": "B02:17",
    "section": "10.3",
    "fields": [],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "switch-mode",
    "en": "One account. Two ways to belong.",
    "am": "ሁለት አገልግሎቶች፣ አንድ መለያ",
    "platform": "CM/MM",
    "reference": "B02:18",
    "section": "3.1",
    "fields": [],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "sessions",
    "en": "Security and devices",
    "am": "ደህንነት እና መሣሪያዎች",
    "platform": "CM",
    "reference": "B03:16",
    "section": "13.1",
    "fields": [],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "account-actions",
    "en": "Your account, your control",
    "am": "መለያዎን ያስተዳድሩ",
    "platform": "CM",
    "reference": "B03:18",
    "section": "5.1",
    "fields": [],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "merchant-signin",
    "en": "Your store starts here",
    "am": "ወደ መደብርዎ ይግቡ",
    "platform": "MW",
    "reference": "New desktop; B02:06 direction",
    "section": "9.12",
    "fields": [
      "contact",
      "password"
    ],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "merchant-recover",
    "en": "Recover merchant access",
    "am": "የነጋዴ መለያዎን መልሰው ያግኙ",
    "platform": "MW",
    "reference": "New desktop",
    "section": "13.1",
    "fields": [
      "contact"
    ],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "admin-signin",
    "en": "Sign in to marketplace operations",
    "am": "ወደ አስተዳደር ይግቡ",
    "platform": "AW",
    "reference": "New desktop",
    "section": "10.13",
    "fields": [
      "contact",
      "password"
    ],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "admin-enrol",
    "en": "Set up two-step verification",
    "am": "ባለ ሁለት ደረጃ ማረጋገጫ ያዘጋጁ",
    "platform": "AW",
    "reference": "New desktop; B03:17 direction",
    "section": "13.1",
    "fields": [
      "code"
    ],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "admin-mfa",
    "en": "Verify it is you",
    "am": "ማንነትዎን ያረጋግጡ",
    "platform": "AW",
    "reference": "New desktop; B03:17 direction",
    "section": "13.1",
    "fields": [
      "code"
    ],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery",
      "expired",
      "rate-limited"
    ]
  },
  {
    "id": "admin-recovery",
    "en": "Use a recovery code",
    "am": "የመልሶ ማግኛ ኮድ ይጠቀሙ",
    "platform": "AW",
    "reference": "New desktop",
    "section": "13.1",
    "fields": [
      "recovery"
    ],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery",
      "expired",
      "rate-limited"
    ]
  },
  {
    "id": "admin-codes",
    "en": "Keep your recovery codes safe",
    "am": "የመልሶ ማግኛ ኮዶችዎን ያስቀምጡ",
    "platform": "AW",
    "reference": "New desktop",
    "section": "13.1",
    "fields": [],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery"
    ]
  },
  {
    "id": "admin-review",
    "en": "Merchant application review",
    "am": "የነጋዴ ማመልከቻ ግምገማ",
    "platform": "AW",
    "reference": "New desktop; B02:16–17 counterpart",
    "section": "10.3",
    "fields": [],
    "states": [
      "default",
      "validation",
      "loading",
      "error",
      "offline",
      "denied",
      "pending",
      "confirmation",
      "success",
      "recovery",
      "empty"
    ]
  }
];
