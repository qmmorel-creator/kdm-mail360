import React from 'react'

const base = (children, props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {children}
  </svg>
)

export const IconInbox = (p) => base(<>
  <path d="M4 12h4l2 3h4l2-3h4" />
  <path d="M5.5 5h13l2.5 7v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6l2.5-7Z" />
</>, p)

export const IconStar = (p) => base(<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5Z" />, p)

export const IconClock = (p) => base(<>
  <circle cx="12" cy="12" r="8.5" />
  <path d="M12 8v4.5l3 2" />
</>, p)

export const IconSend = (p) => base(<>
  <path d="M4 12l16-8-6.5 16-2.7-6.8L4 12Z" />
  <path d="M20 4L10.8 13.2" />
</>, p)

export const IconFile = (p) => base(<>
  <path d="M7 3.5h7L18.5 8V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
  <path d="M14 3.5V8h4.5" />
</>, p)

export const IconArchive = (p) => base(<>
  <rect x="3.5" y="4" width="17" height="4.5" rx="1" />
  <path d="M5 8.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5" />
  <path d="M10 13h4" />
</>, p)

export const IconTrash = (p) => base(<>
  <path d="M4.5 6.5h15" />
  <path d="M8.5 6.5V5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v1.5" />
  <path d="M6.5 6.5 7.3 19a1 1 0 0 0 1 1h7.4a1 1 0 0 0 1-1l.8-12.5" />
</>, p)

export const IconSettings = (p) => base(<>
  <circle cx="12" cy="12" r="3" />
  <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V19a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.6 1H20a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1Z" />
</>, p)

export const IconSearch = (p) => base(<>
  <circle cx="11" cy="11" r="7" />
  <path d="M21 21l-4.3-4.3" />
</>, p)

export const IconFilter = (p) => base(<path d="M4 5h16M7 12h10M10 19h4" />, p)

export const IconRefresh = (p) => base(<>
  <path d="M20 11a8 8 0 1 0-2.3 5.7" />
  <path d="M20 5v6h-6" />
</>, p)

export const IconPaperclip = (p) => base(<path d="M17.5 8.5 9.7 16.3a3 3 0 1 1-4.2-4.2l8.5-8.5a2 2 0 1 1 2.8 2.8l-8.1 8.1a1 1 0 1 1-1.4-1.4l7.4-7.4" />, p)

export const IconCheckSquare = (p) => base(<path d="M20 6.5 9 17.5l-5-5" />, p)

export const IconChevDown = (p) => base(<path d="M6 9l6 6 6-6" />, p)
export const IconChevLeft = (p) => base(<path d="M15 6l-6 6 6 6" />, p)
export const IconChevRight = (p) => base(<path d="M9 6l6 6-6 6" />, p)

export const IconReply = (p) => base(<path d="M9 10 4 15l5 5M4 15h10a6 6 0 0 0 6-6V6" />, p)
export const IconReplyAll = (p) => base(<>
  <path d="M12 10 7 15l5 5" />
  <path d="M7 15h10a6 6 0 0 0 6-6V6" />
  <path d="M6 10 1 15l5 5" transform="translate(0,0)" />
</>, p)
export const IconForward = (p) => base(<path d="M15 10 20 15l-5 5M20 15H10a6 6 0 0 1-6-6V6" />, p)

export const IconMoreH = (p) => base(<>
  <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
  <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
  <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
</>, p)

export const IconFlag = (p) => base(<>
  <path d="M6 3v18" />
  <path d="M6 4h11l-2.5 3.5L17 11H6" />
</>, p)

export const IconMailOpen = (p) => base(<>
  <path d="M3.5 9.5 12 4l8.5 5.5" />
  <path d="M3.5 9.5V19a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1V9.5" />
  <path d="M3.5 19l6.6-5.3M20.5 19l-6.6-5.3" />
</>, p)

export const IconMove = (p) => base(<>
  <path d="M5 12h14" />
  <path d="M13 6l6 6-6 6" />
</>, p)

export const IconTag = (p) => base(<>
  <path d="M11.5 3.5H6a1 1 0 0 0-1 1v5.5a1 1 0 0 0 .3.7l9 9a1 1 0 0 0 1.4 0l6-6a1 1 0 0 0 0-1.4l-9-9a1 1 0 0 0-.7-.3Z" />
  <circle cx="8.2" cy="8.2" r="1.2" />
</>, p)

export const IconPlus = (p) => base(<path d="M12 5v14M5 12h14" />, p)

export const IconX = (p) => base(<path d="M6 6l12 12M18 6 6 18" />, p)

export const IconSparkle = (p) => base(<>
  <path d="M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.7l-1.6-5.5L5 10.6 10.4 9 12 3.5Z" />
</>, p)

export const IconList = (p) => base(<>
  <path d="M4 6h16M4 12h16M4 18h11" />
</>, p)

export const IconUser = (p) => base(<>
  <circle cx="12" cy="8" r="3.5" />
  <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
</>, p)

export const IconMail = (p) => base(<>
  <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
  <path d="M4.5 6.5 12 12l7.5-5.5" />
</>, p)

export const IconPhone = (p) => base(<path d="M6.6 3.5 9.4 8l-2 2a12 12 0 0 0 6.6 6.6l2-2 4.5 2.8-.4 3.2a2 2 0 0 1-2 1.7C10.5 22.3 1.7 13.5 1.9 6.9a2 2 0 0 1 1.7-2l3-.4Z" />, p)

export const IconMapPin = (p) => base(<>
  <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
  <circle cx="12" cy="9.5" r="2.3" />
</>, p)

export const IconBuilding = (p) => base(<>
  <rect x="5" y="3.5" width="9" height="17" rx="0.5" />
  <path d="M14 9.5h5v11h-5" />
  <path d="M8 7.5h1M11 7.5h1M8 11h1M11 11h1M8 14.5h1M11 14.5h1" />
</>, p)

export const IconExternal = (p) => base(<>
  <path d="M14 4h6v6" />
  <path d="M20 4 10.5 13.5" />
  <path d="M18 13.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5.5" />
</>, p)

export const IconAlert = (p) => base(<>
  <path d="M12 3.5 22 20.5H2L12 3.5Z" />
  <path d="M12 10v4.5" />
  <circle cx="12" cy="17.3" r="0.15" fill="currentColor" />
</>, p)

export const IconCheckCircle = (p) => base(<>
  <circle cx="12" cy="12" r="8.5" />
  <path d="M8.5 12.3l2.3 2.3 4.7-5" />
</>, p)

export const IconSmile = (p) => base(<>
  <circle cx="12" cy="12" r="8.5" />
  <path d="M8.5 14s1.4 2 3.5 2 3.5-2 3.5-2" />
  <path d="M9 9.5h.01M15 9.5h.01" />
</>, p)

export const IconBold = (p) => base(<path d="M6.5 4.5h6a3.5 3.5 0 0 1 0 7h-6v-7Zm0 7h7a3.5 3.5 0 0 1 0 7h-7v-7Z" />, p)

export const IconLink = (p) => base(<path d="M9 15l6-6M8 13l-2.5 2.5a3.5 3.5 0 0 0 5 5L13 18M16 11l2.5-2.5a3.5 3.5 0 0 0-5-5L11 6" />, p)
