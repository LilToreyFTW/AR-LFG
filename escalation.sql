-- ============================================================
--  ARC Raiders LFG  |  Database: escalation
--  HeidiSQL / MySQL 8+ / MariaDB 10.6+
--  Stores: Discord IDs · Embark IDs · Groups · Factions
--          Trader Reputation · LFG Postings · Social
-- ============================================================

CREATE DATABASE IF NOT EXISTS `escalation`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `escalation`;

-- ============================================================
-- SECTION 1 — NEXTAUTH (Discord OAuth)
-- ============================================================

-- Core user row. Created the first time someone logs in via Discord.
CREATE TABLE IF NOT EXISTS `users` (
  `id`              VARCHAR(191)  NOT NULL,
  `name`            VARCHAR(255),
  `email`           VARCHAR(255)  UNIQUE,
  `email_verified`  DATETIME(3),
  `image`           TEXT,

  -- Discord OAuth fields (populated by NextAuth provider)
  `discord_id`      VARCHAR(64)   UNIQUE COMMENT 'Discord snowflake ID — immutable identifier',
  `discord_tag`     VARCHAR(64)   COMMENT 'e.g. username#0000 or new @username',
  `discord_avatar`  TEXT          COMMENT 'Full CDN URL of their Discord avatar',

  -- Embark / ARC Raiders fields (linked by user after sign-up)
  `embark_id`       VARCHAR(128)  UNIQUE COMMENT 'In-game Embark account ID',
  `embark_username` VARCHAR(128)  COMMENT 'Display name shown in-game',

  -- Profile extras
  `bio`             TEXT,
  `timezone`        VARCHAR(64)   DEFAULT 'UTC',
  `platform`        ENUM('PC','PS5','XSX','XSS','Crossplay') DEFAULT 'PC',

  `created_at`      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `idx_discord_id`  (`discord_id`),
  INDEX `idx_embark_id`   (`embark_id`),
  INDEX `idx_email`       (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NextAuth OAuth accounts table (supports multiple providers per user)
CREATE TABLE IF NOT EXISTS `accounts` (
  `id`                  VARCHAR(191) NOT NULL,
  `user_id`             VARCHAR(191) NOT NULL,
  `type`                VARCHAR(64)  NOT NULL,
  `provider`            VARCHAR(64)  NOT NULL  COMMENT 'e.g. discord',
  `provider_account_id` VARCHAR(191) NOT NULL  COMMENT 'Discord snowflake from OAuth',
  `refresh_token`       TEXT,
  `access_token`        TEXT,
  `expires_at`          BIGINT,
  `token_type`          VARCHAR(64),
  `scope`               TEXT,
  `id_token`            TEXT,
  `session_state`       TEXT,
  `created_at`          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_provider_account` (`provider`, `provider_account_id`),
  INDEX `idx_user_id` (`user_id`),
  CONSTRAINT `fk_accounts_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NextAuth sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `id`            VARCHAR(191) NOT NULL,
  `session_token` VARCHAR(512) NOT NULL UNIQUE,
  `user_id`       VARCHAR(191) NOT NULL,
  `expires`       DATETIME(3)  NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  CONSTRAINT `fk_sessions_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NextAuth email verification tokens
CREATE TABLE IF NOT EXISTS `verification_tokens` (
  `identifier` VARCHAR(255) NOT NULL,
  `token`      VARCHAR(512) NOT NULL UNIQUE,
  `expires`    DATETIME(3)  NOT NULL,
  UNIQUE KEY `uq_identifier_token` (`identifier`, `token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SECTION 2 — GAME PROFILE (Embark Stats)
-- ============================================================

CREATE TABLE IF NOT EXISTS `game_profiles` (
  `id`              VARCHAR(191) NOT NULL,
  `user_id`         VARCHAR(191) NOT NULL UNIQUE,
  `embark_id`       VARCHAR(128) NOT NULL UNIQUE,
  `embark_username` VARCHAR(128) NOT NULL,

  -- Progression
  `level`           INT          NOT NULL DEFAULT 1,
  `rank`            VARCHAR(64)  COMMENT 'e.g. Bronze, Silver, Gold, Platinum, Diamond',
  `prestige`        INT          NOT NULL DEFAULT 0,

  -- Match stats
  `total_kills`     INT          NOT NULL DEFAULT 0,
  `total_deaths`    INT          NOT NULL DEFAULT 0,
  `total_wins`      INT          NOT NULL DEFAULT 0,
  `total_matches`   INT          NOT NULL DEFAULT 0,
  `total_extracts`  INT          NOT NULL DEFAULT 0,
  `kd_ratio`        DECIMAL(6,3) GENERATED ALWAYS AS (
                      IF(`total_deaths` = 0, `total_kills`, `total_kills` / `total_deaths`)
                    ) STORED,

  -- Preferred playstyle
  `playstyle`       ENUM('PvP','PvE','Balanced','Stealth','Support') DEFAULT 'Balanced',
  `favorite_weapon` VARCHAR(128),
  `favorite_map`    ENUM('Dam Battlegrounds','Buried City','Spaceport','Blue Gate','Stella Montis'),

  `created_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `idx_user_id`   (`user_id`),
  INDEX `idx_embark_id` (`embark_id`),
  CONSTRAINT `fk_game_profile_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SECTION 3 — TRADER REPUTATION
--   The 5 Speranza traders. Each user has an independent rep
--   level with each one, reflecting their quest progress.
-- ============================================================

-- Seed the 5 canonical traders
CREATE TABLE IF NOT EXISTS `traders` (
  `id`          TINYINT      NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(64)  NOT NULL UNIQUE,
  `role`        VARCHAR(128) NOT NULL COMMENT 'Their role in Speranza',
  `specialty`   VARCHAR(128) NOT NULL COMMENT 'What they trade/sell',
  `description` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `traders` (`name`, `role`, `specialty`, `description`) VALUES
('Celeste',   'Leader of the Raiders & Speranza founder',
 'Crafting materials (Assorted Seeds currency)',
 'Founded Speranza after losing her home to ARC attacks. Symbol of hope for humanity underground.'),
('Lance',     'Medic android (eccentric, amnesiac)',
 'Medical supplies, shields, augments',
 'One of the most talented medics Toledo has to offer. Singing off-pitch at karaoke since before he can remember.'),
('Shani',     'Head of Security & ARC expert',
 'Security items, binoculars, hatch keys, ziplines',
 'Has contingency plans for her contingency plans. Celeste''s biggest topside resource.'),
('Tian Wen',  'Resident gun craftsmith (reclusive)',
 'Weapons, ammunition, weapon modifications',
 'Most people have only ever seen her eyes. Prefers tools to people — but has a soft spot for things in need of repair.'),
('Apollo',    'Traveling mechanic (temporary resident)',
 'Gadgets, grenades, explosives, tactical gear',
 'Runs football teams for kids and stocks the library. Cryptic about his past but always makes wherever he is better.')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Per-user reputation with each trader (unlocks items at rep 7, 12, 20)
CREATE TABLE IF NOT EXISTS `trader_reputation` (
  `id`            VARCHAR(191) NOT NULL,
  `user_id`       VARCHAR(191) NOT NULL,
  `trader_id`     TINYINT      NOT NULL,
  `rep_level`     INT          NOT NULL DEFAULT 0 COMMENT '0-20 matches in-game unlock gates',
  `quests_done`   INT          NOT NULL DEFAULT 0,
  `updated_at`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_trader` (`user_id`, `trader_id`),
  INDEX `idx_trader_id` (`trader_id`),
  CONSTRAINT `fk_trader_rep_user`
    FOREIGN KEY (`user_id`)   REFERENCES `users`(`id`)   ON DELETE CASCADE,
  CONSTRAINT `fk_trader_rep_trader`
    FOREIGN KEY (`trader_id`) REFERENCES `traders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SECTION 4 — FACTIONS
--   Both preset community factions and user-created factions.
--   Each faction can be tied to a specific playstyle & allegiance.
-- ============================================================

CREATE TABLE IF NOT EXISTS `factions` (
  `id`            VARCHAR(191)  NOT NULL,
  `name`          VARCHAR(128)  NOT NULL,
  `tag`           VARCHAR(8)    COMMENT 'Short 2-6 char tag displayed in brackets, e.g. [FMF]',
  `description`   TEXT,
  `allegiance`    ENUM('Aggressive','Neutral','Pacifist','Custom') NOT NULL DEFAULT 'Custom',
  `playstyle`     ENUM('PvP','PvE','Balanced','Support','Bounty Hunter') DEFAULT 'Balanced',

  -- Who created it (NULL = preset/official community faction)
  `creator_id`    VARCHAR(191),

  -- Cosmetic / identity
  `banner_color`  VARCHAR(7)    DEFAULT '#00d9ff' COMMENT 'Hex color for the faction banner',
  `icon_url`      TEXT,

  -- Membership cap (0 = unlimited)
  `max_members`   INT           NOT NULL DEFAULT 0,
  `is_public`     TINYINT(1)    NOT NULL DEFAULT 1 COMMENT '1 = anyone can apply, 0 = invite only',
  `is_preset`     TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '1 = seeded community faction, 0 = user-created',

  `created_at`    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_faction_name` (`name`),
  INDEX `idx_creator`     (`creator_id`),
  INDEX `idx_allegiance`  (`allegiance`),
  CONSTRAINT `fk_faction_creator`
    FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed the 5 known community/streamer-war factions
INSERT INTO `factions` (`id`,`name`,`tag`,`description`,`allegiance`,`playstyle`,`is_preset`,`banner_color`) VALUES
('preset-bungulators', 'The Bungulators',          '[BNG]',
 'TheBurntPeanut''s faction. Sparked the ARC Raiders Streamer War on Nov 22 2025. Victorious over FMF at Spaceport. Sworn enemies of FMF and The Jungle.',
 'Aggressive','PvP',1,'#f97316'),
('preset-fmf',         'FMF Raiders',              '[FMF]',
 'HutchMF''s faction. One of the two main combatants in the Streamer War. Sworn enemies of The Bungulators.',
 'Aggressive','PvP',1,'#ef4444'),
('preset-jungle',      'The Jungle',               '[JGL]',
 'Third aggressive faction active during the Streamer War. Targets Bungulators on sight.',
 'Aggressive','PvP',1,'#22c55e'),
('preset-civilians',   'Civilians of Speranza',    '[CVL]',
 'Neutral pacifist faction started by @ARCRaidersNews. Focused on destroying ARC Machines and helping fellow players rather than PvP.',
 'Pacifist','PvE',1,'#3b82f6'),
('preset-merchants',   'The Merchants',            '[MRC]',
 'Led by The Gaming Merchant. Carry a Defibrillator at all times. Focused on defeating ARC and protecting solo players. Neutral to all factions.',
 'Neutral','Support',1,'#a855f7')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- Faction membership
CREATE TABLE IF NOT EXISTS `faction_members` (
  `id`          VARCHAR(191) NOT NULL,
  `faction_id`  VARCHAR(191) NOT NULL,
  `user_id`     VARCHAR(191) NOT NULL,
  `role`        ENUM('Leader','Officer','Member','Recruit') NOT NULL DEFAULT 'Member',
  `status`      ENUM('active','pending','banned') NOT NULL DEFAULT 'active',
  `joined_at`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `invited_by`  VARCHAR(191),

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_faction_user` (`faction_id`, `user_id`),
  INDEX `idx_user_id`    (`user_id`),
  INDEX `idx_faction_id` (`faction_id`),
  CONSTRAINT `fk_fm_faction`
    FOREIGN KEY (`faction_id`) REFERENCES `factions`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fm_user`
    FOREIGN KEY (`user_id`)    REFERENCES `users`(`id`)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Faction vs faction relationships (rivalries / alliances)
CREATE TABLE IF NOT EXISTS `faction_relations` (
  `id`              VARCHAR(191) NOT NULL,
  `faction_id`      VARCHAR(191) NOT NULL,
  `target_faction_id` VARCHAR(191) NOT NULL,
  `relation_type`   ENUM('Ally','Rival','Enemy','Neutral') NOT NULL DEFAULT 'Neutral',
  `declared_at`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_relation` (`faction_id`, `target_faction_id`),
  CONSTRAINT `fk_rel_faction`  FOREIGN KEY (`faction_id`)        REFERENCES `factions`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rel_target`   FOREIGN KEY (`target_faction_id`) REFERENCES `factions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SECTION 5 — GROUPS (Squad/Party System)
--   In-game: max 3 players per squad.
--   On the site: groups can be larger for organized communities.
-- ============================================================

CREATE TABLE IF NOT EXISTS `groups` (
  `id`              VARCHAR(191) NOT NULL,
  `name`            VARCHAR(128) NOT NULL,
  `description`     TEXT,
  `leader_id`       VARCHAR(191) NOT NULL,
  `faction_id`      VARCHAR(191) COMMENT 'Optional faction affiliation',

  -- Recruitment settings
  `game_mode`       ENUM('Extraction','Solo','Duo','Trio','Any') DEFAULT 'Any',
  `skill_level`     ENUM('Beginner','Intermediate','Advanced','Veteran','Any') DEFAULT 'Any',
  `max_size`        TINYINT      NOT NULL DEFAULT 3 COMMENT 'Max 3 for in-game squads, higher for community groups',
  `is_squad`        TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '1 = in-game squad (max 3), 0 = community group',
  `is_public`       TINYINT(1)   NOT NULL DEFAULT 1,

  -- Preferred settings
  `preferred_map`   ENUM('Dam Battlegrounds','Buried City','Spaceport','Blue Gate','Stella Montis','Any') DEFAULT 'Any',
  `timezone`        VARCHAR(64)  DEFAULT 'UTC',
  `language`        VARCHAR(64)  DEFAULT 'English',
  `platform`        ENUM('PC','PS5','XSX','XSS','Crossplay') DEFAULT 'Crossplay',

  `status`          ENUM('recruiting','full','inactive') NOT NULL DEFAULT 'recruiting',
  `created_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `idx_leader`     (`leader_id`),
  INDEX `idx_faction`    (`faction_id`),
  INDEX `idx_status`     (`status`),
  CONSTRAINT `fk_group_leader`
    FOREIGN KEY (`leader_id`)  REFERENCES `users`(`id`)    ON DELETE CASCADE,
  CONSTRAINT `fk_group_faction`
    FOREIGN KEY (`faction_id`) REFERENCES `factions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `group_members` (
  `id`          VARCHAR(191) NOT NULL,
  `group_id`    VARCHAR(191) NOT NULL,
  `user_id`     VARCHAR(191) NOT NULL,
  `role`        ENUM('Leader','Co-Leader','Member') NOT NULL DEFAULT 'Member',
  `status`      ENUM('active','pending','kicked') NOT NULL DEFAULT 'active',
  `joined_at`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_group_user` (`group_id`, `user_id`),
  INDEX `idx_user_id` (`user_id`),
  CONSTRAINT `fk_gm_group`
    FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_gm_user`
    FOREIGN KEY (`user_id`)  REFERENCES `users`(`id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SECTION 6 — LFG POSTINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS `lfg_postings` (
  `id`              VARCHAR(191) NOT NULL,
  `creator_id`      VARCHAR(191) NOT NULL,
  `group_id`        VARCHAR(191) COMMENT 'Optional: tie posting to an existing group',
  `faction_id`      VARCHAR(191) COMMENT 'Optional: faction-only LFG post',

  `title`           VARCHAR(255) NOT NULL,
  `description`     TEXT,

  `game_mode`       ENUM('Extraction','Solo','Duo','Trio','Any') NOT NULL DEFAULT 'Extraction',
  `skill_level`     ENUM('Beginner','Intermediate','Advanced','Veteran','Any') DEFAULT 'Any',
  `players_needed`  TINYINT      NOT NULL DEFAULT 2,
  `min_level`       INT          NOT NULL DEFAULT 1,
  `preferred_map`   ENUM('Dam Battlegrounds','Buried City','Spaceport','Blue Gate','Stella Montis','Any') DEFAULT 'Any',

  `timezone`        VARCHAR(64)  DEFAULT 'UTC',
  `language`        VARCHAR(64)  DEFAULT 'English',
  `platform`        ENUM('PC','PS5','XSX','XSS','Crossplay') DEFAULT 'Crossplay',

  `status`          ENUM('active','filled','closed','expired') NOT NULL DEFAULT 'active',
  `created_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expires_at`      DATETIME(3),
  `updated_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `idx_creator_id`  (`creator_id`),
  INDEX `idx_status`      (`status`),
  INDEX `idx_game_mode`   (`game_mode`),
  INDEX `idx_faction`     (`faction_id`),
  CONSTRAINT `fk_lfg_creator`
    FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`)    ON DELETE CASCADE,
  CONSTRAINT `fk_lfg_group`
    FOREIGN KEY (`group_id`)   REFERENCES `groups`(`id`)   ON DELETE SET NULL,
  CONSTRAINT `fk_lfg_faction`
    FOREIGN KEY (`faction_id`) REFERENCES `factions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `lfg_participants` (
  `id`            VARCHAR(191) NOT NULL,
  `lfg_posting_id` VARCHAR(191) NOT NULL,
  `user_id`       VARCHAR(191) NOT NULL,
  `status`        ENUM('joined','left','removed') NOT NULL DEFAULT 'joined',
  `joined_at`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lfg_user` (`lfg_posting_id`, `user_id`),
  INDEX `idx_user_id` (`user_id`),
  CONSTRAINT `fk_lfgp_posting`
    FOREIGN KEY (`lfg_posting_id`) REFERENCES `lfg_postings`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lfgp_user`
    FOREIGN KEY (`user_id`)        REFERENCES `users`(`id`)         ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SECTION 7 — SOCIAL (Friends, Invites)
-- ============================================================

CREATE TABLE IF NOT EXISTS `friend_requests` (
  `id`          VARCHAR(191) NOT NULL,
  `sender_id`   VARCHAR(191) NOT NULL,
  `receiver_id` VARCHAR(191) NOT NULL,
  `status`      ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `message`     VARCHAR(255),
  `created_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_friend_request` (`sender_id`, `receiver_id`),
  INDEX `idx_receiver` (`receiver_id`),
  CONSTRAINT `fk_fr_sender`
    FOREIGN KEY (`sender_id`)   REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fr_receiver`
    FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `friends` (
  `id`          VARCHAR(191) NOT NULL,
  `user_id`     VARCHAR(191) NOT NULL,
  `friend_id`   VARCHAR(191) NOT NULL,
  `created_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_friendship` (`user_id`, `friend_id`),
  INDEX `idx_friend_id` (`friend_id`),
  CONSTRAINT `fk_friends_user`
    FOREIGN KEY (`user_id`)   REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_friends_friend`
    FOREIGN KEY (`friend_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `game_invites` (
  `id`          VARCHAR(191) NOT NULL,
  `inviter_id`  VARCHAR(191) NOT NULL,
  `invitee_id`  VARCHAR(191) NOT NULL,
  `group_id`    VARCHAR(191),
  `game_mode`   ENUM('Extraction','Solo','Duo','Trio','Any') DEFAULT 'Extraction',
  `message`     VARCHAR(255),
  `status`      ENUM('pending','accepted','declined','expired') NOT NULL DEFAULT 'pending',
  `created_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expires_at`  DATETIME(3),
  `updated_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `idx_invitee`  (`invitee_id`),
  INDEX `idx_inviter`  (`inviter_id`),
  CONSTRAINT `fk_gi_inviter`
    FOREIGN KEY (`inviter_id`) REFERENCES `users`(`id`)   ON DELETE CASCADE,
  CONSTRAINT `fk_gi_invitee`
    FOREIGN KEY (`invitee_id`) REFERENCES `users`(`id`)   ON DELETE CASCADE,
  CONSTRAINT `fk_gi_group`
    FOREIGN KEY (`group_id`)   REFERENCES `groups`(`id`)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SECTION 8 — AUDIT / SECURITY LOG
--   Track Embark ID link/unlink events per Discord user for
--   secure record-keeping.
-- ============================================================

CREATE TABLE IF NOT EXISTS `embark_link_audit` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT,
  `user_id`     VARCHAR(191) NOT NULL,
  `discord_id`  VARCHAR(64)  NOT NULL,
  `embark_id`   VARCHAR(128) NOT NULL,
  `action`      ENUM('linked','unlinked','updated') NOT NULL,
  `ip_hash`     VARCHAR(64)  COMMENT 'SHA-256 hash of IP — never store raw IPs',
  `user_agent`  VARCHAR(512),
  `created_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `idx_user_id`    (`user_id`),
  INDEX `idx_discord_id` (`discord_id`),
  INDEX `idx_embark_id`  (`embark_id`),
  CONSTRAINT `fk_audit_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DONE — import this file into HeidiSQL as database: escalation
-- ============================================================
