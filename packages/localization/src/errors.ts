import type { Locale } from "@segno/contracts";

// Draft Amharic, subject to the same native-language review as the UI dictionary.
// These are service-controlled error messages; never pass user-authored review reasons here.
const amErrors: Record<string, string> = {
  "The sign-in details could not be verified.": "የመግቢያ መረጃውን ማረጋገጥ አልተቻለም።",
  "This code is incorrect, expired or no longer available.":
    "ይህ ኮድ ትክክል አይደለም፣ ጊዜው አልፎበታል ወይም አይገኝም።",
  "The verification code is invalid or already used.":
    "የማረጋገጫ ኮዱ ትክክል አይደለም ወይም አስቀድሞ ተጠቅመውበታል።",
  "This recovery request is no longer available.":
    "ይህ የመመለሻ ጥያቄ አይገኝም። አዲስ ጥያቄ ያቅርቡ።",
  "Please wait before requesting another code.": "ሌላ ኮድ ከመጠየቅዎ በፊት ይጠብቁ።",
  "Connection unavailable. Check your network and try again.":
    "ግንኙነት አልተገኘም። አውታረ መረብዎን ያረጋግጡና እንደገና ይሞክሩ።",
  "The service response could not be read. Please try again.":
    "የአገልግሎቱን ምላሽ ማንበብ አልተቻለም። እንደገና ይሞክሩ።",
  "Could not start a secure session.": "ደህንነቱ የተጠበቀ ክፍለ ጊዜ መጀመር አልተቻለም።",
  "The session changed. Please try again.": "ክፍለ ጊዜው ተቀይሯል። እንደገና ይሞክሩ።",
  "Your session expired. Please sign in again.": "ክፍለ ጊዜዎ አብቅቷል። እንደገና ይግቡ።",
  "Unauthenticated.": "ክፍለ ጊዜዎ አብቅቷል። እንደገና ይግቡ።",
  "CSRF token mismatch.": "ክፍለ ጊዜውን ያድሱና እንደገና ይሞክሩ።",
  "Account access is not available.": "የመለያ መዳረሻ አይገኝም።",
  "Store access is not available.": "የሱቅ መዳረሻ አይገኝም። ፈቃድዎን ያድሱ።",
  "Verify your account before continuing.": "ከመቀጠልዎ በፊት መለያዎን ያረጋግጡ።",
  "Verify your account before signing in.": "ከመግባትዎ በፊት መለያዎን ያረጋግጡ።",
  "Administrative access is not available.": "የአስተዳዳሪ መዳረሻ አይገኝም።",
  "Complete administrator verification to continue.":
    "ለመቀጠል የአስተዳዳሪ ማረጋገጫውን ያጠናቅቁ።",
  "Sign in again before recording a privileged decision.":
    "ውሳኔውን ከማስቀመጥዎ በፊት እንደገና ይግቡ።",
  "Sign in again through administrator access.": "በአስተዳዳሪ መዳረሻ እንደገና ይግቡ።",
  "Confirm your password to continue.": "ለመቀጠል የይለፍ ቃልዎን ያረጋግጡ።",
  "The current password could not be verified.":
    "አሁን ያለውን የይለፍ ቃል ማረጋገጥ አልተቻለም።",
  "Continue your existing application.": "ያለዎትን ማመልከቻ ይቀጥሉ።",
  "This application cannot be edited now.": "ይህን ማመልከቻ አሁን ማስተካከል አይቻልም።",
  "This confirmation expired. Review the current application again.":
    "የማረጋገጫው ጊዜ አልፏል። ያለውን ማመልከቻ እንደገና ይገምግሙ።",
  "The confirmation could not be verified.": "ማረጋገጫውን ማረጋገጥ አልተቻለም።",
  "A maximum of five documents is supported.": "ቢበዛ አምስት ሰነዶችን ማስገባት ይችላሉ።",
  "A maximum of ten addresses is supported.": "ቢበዛ አሥር አድራሻዎችን ማስቀመጥ ይችላሉ።",
  "Use a phone number for the address.": "ለአድራሻው ስልክ ቁጥር ይጠቀሙ።",
  "Enter a valid email address.": "ትክክለኛ የኢሜይል አድራሻ ያስገቡ።",
  "Use an email address or a valid international phone number.":
    "ኢሜይል ወይም ትክክለኛ ዓለም አቀፍ ስልክ ቁጥር ይጠቀሙ።",
};

export function localizeError(locale: Locale, message: string): string {
  if (locale === "en" || /[\u1200-\u137f]/.test(message)) return message;
  const exact = amErrors[message];
  if (exact) return exact;
  if (message.startsWith("This application changed."))
    return "ማመልከቻው ተቀይሯል። ከመቀጠልዎ በፊት ያድሱ።";
  if (/ field is required\./.test(message)) return "ይህ መረጃ ያስፈልጋል።";
  if (/confirmation does not match/.test(message)) return "የማረጋገጫው መረጃ አይዛመድም።";
  if (/already been taken/.test(message)) return "ይህ መረጃ አስቀድሞ ተወስዷል። ሌላ ይምረጡ።";
  const min = message.match(/at least (\d+) characters/);
  if (min) return `ቢያንስ ${min[1]} ቁምፊዎችን ያስገቡ።`;
  const max = message.match(/greater than (\d+) characters/);
  if (max) return `ከ${max[1]} ቁምፊዎች በላይ አያስገቡ።`;
  if (/Too Many Attempts|Too Many Requests/i.test(message))
    return "ጥያቄዎች በዝተዋል። ቆይተው እንደገና ይሞክሩ።";
  return "ጥያቄውን ማጠናቀቅ አልተቻለም። ያስገቡትን መረጃ ያረጋግጡና እንደገና ይሞክሩ።";
}
