import type * as Monaco from "monaco-editor";

export const ZBR_LANGUAGE_ID = "zbr";

export const ZBR_LANGUAGE_CONFIG: Monaco.languages.LanguageConfiguration = {
  comments: { lineComment: "//" },
  wordPattern: /Z[a-zA-Z0-9_]*|[a-zA-Z0-9_]+/,
  autoClosingPairs: [
    { open: "{", close: "}", notIn: ["string", "comment"] },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  surroundingPairs: [
    { open: "{", close: "}" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
};

export const ZBR_TOKENS_PROVIDER: Monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      [/\/\/.*$/, "comment.line.double-slash.zbr"],
      // [BRACKETLESS-START]
      [/\b(Z)(afkChannelID|afkTimeout|allMembersCount|allowRoleMentions|allowUserMentions|appEmojis|auditCount|auditEntries|auditEntryAction|auditEntryChanges|auditEntryID|auditEntryReason|auditEntryTarget|auditEntryUser|auditLatest|automodRules|boostCount|boostLevel|botCommands|botID|botOwnerID|botTyping|categoryCount|changeCooldownTime|channelCount|channelCreated|channelExists|channelID|channelInvites|channelName|channelNames|channelPosition|channelTopic|channelType|channelWebhooks|colorRandom|commandName|commandsCount|commandTrigger|creationDate|currentShard|customID|date|day|defer|displayName|dmChannelID|emoteCount|entitlements|ephemeral|error|eval|eventCount|executionTime|getAttachments|getCooldown|getMentionableSelectUserCount|getMentionableSelectUserIDs|getRoleSelectRoleCount|getRoleSelectRoleIDs|getSlowmode|getTextSplitIndex|getTextSplitLength|getTimestamp|getUserSelectUserCount|getUserSelectUserIDs|guildBanner|guildExists|guildID|highestRole|hour|httpResult|httpStatus|isAdmin|isBooster|isBot|isHoisted|isInVoice|isMentionable|isMentioned|isModerator|isNSFW|isSlash|isTimedOut|isUserDMEnabled|joinSplitText|jsonClear|jsonPretty|jsonStringify|lastMessageID|lastPinTimestamp|listVar|loopIndex|loopValue|lowestRole|memberPending|membersCount|message|messageID|minute|month|onboardingDefaultChannels|onboardingEnabled|onboardingMode|onboardingPrompts|onlyAdmin|onlyNSFW|parentID|ping|pinList|pollSend|randomCategoryID|randomChannelID|randomGuildID|randomMention|randomRoleID|randomUser|randomUserID|removeAllComponents|removeButtons|repliedMessageID|reply|roleColor|roleCount|roleExists|roleID|roleMemberCount|roleMembers|roleName|roleNames|rolePerms|rolePosition|rulesChannelID|second|serverChannels|serverCount|serverDescription|serverDiscoverySplash|serverEmojis|serverEvents|serverIcon|serverInvite|serverModify|serverName|serverNames|serverOwner|serverRoles|serverSplash|serverStickers|serverTemplates|serverVerificationLevel|skus|slashCommandsCount|slashID|soundboardDefaultSounds|soundboardSounds|stickerCount|stop|suppressErrors|systemChannelID|textSplit|threadArchived|threadLocked|threadParentID|time|timestamp|totalShards|untimeOut|update|uptime|userAvatar|userBadge|userBanner|userBannerColor|userExists|userID|userJoined|userLocale|username|userPerms|userRoles|userSelfDeafened|userSelfMuted|userServerAvatar|userServerDeafened|userServerMuted|userStatus|userStreaming|userVoiceChannel|uuid|voiceBitrate|voiceEmpty|voiceFull|voiceMemberCount|voiceMembers|voiceNew|voiceOld|voiceUserLimit|welcomeScreen|year)\b(?!\{)/, ['keyword.other.zbr', 'entity.name.function.zbr']],
      // [BRACKETLESS-END]
      [
        /\b(Z)([a-zA-Z0-9_]+)\b(?=\{)/,
        ["keyword.other.zbr", "entity.name.function.zbr"],
      ],
      [/==|!=|>=|<=|>|</, "keyword.operator.comparison.zbr"],
      [/&&|\|\|/, "keyword.operator.logical.zbr"],
      [/\\[{};\\]/, "constant.character.escape.zbr"],
      [/[{}]/, "meta.brace.curly.zbr"],
      [/;/, "keyword.other.zbr"],
    ],
  },
};

export const ZBR_THEME: Monaco.editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "keyword.other.zbr", foreground: "bd93f9" },
    { token: "entity.name.function.zbr", foreground: "f1fa8c" },
    { token: "meta.brace.curly.zbr", foreground: "ff79c6" },
  ],
  colors: {
    "editor.background": "#282c34",
  },
};
