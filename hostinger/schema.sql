-- =====================================================================
-- Curvature Studio — MySQL schema for Hostinger
-- Import this file once from hPanel → Databases → phpMyAdmin → Import
-- MySQL 8.0 / MariaDB 10.4+
-- =====================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------
-- Users & roles (replaces the previous hosted auth service)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
  id         CHAR(36)             NOT NULL PRIMARY KEY,
  user_id    CHAR(36)             NOT NULL,
  role       ENUM('employee')     NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_role (user_id, role),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Portfolio projects
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT         NULL,
  category    VARCHAR(255) NULL,
  client      VARCHAR(255) NULL,
  year        VARCHAR(16)  NULL,
  cover_image TEXT         NULL,
  media_urls  JSON         NOT NULL,
  services    JSON         NOT NULL,
  tools       JSON         NOT NULL,
  published   TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order  INT          NOT NULL DEFAULT 0,
  created_by  CHAR(36)     NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_projects_pub (published, sort_order, created_at),
  CONSTRAINT fk_projects_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Studio items
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS studio_items (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT         NULL,
  cover_image TEXT         NULL,
  media_urls  JSON         NOT NULL,
  published   TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order  INT          NOT NULL DEFAULT 0,
  created_by  CHAR(36)     NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_studio_pub (published, sort_order, created_at),
  CONSTRAINT fk_studio_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Clients (logo wall)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  logo_url   TEXT         NULL,
  website    TEXT         NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  published  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_clients_pub (published, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Events + registrations
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT         NULL,
  event_date  DATE         NULL,
  cover_image TEXT         NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  published   TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_events_pub (published, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS event_registrations (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  event_id   CHAR(36)     NULL,
  event_name VARCHAR(255) NULL,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  phone      VARCHAR(64)  NULL,
  note       TEXT         NULL,
  `read`     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_reg_created (created_at),
  CONSTRAINT fk_reg_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Contact messages
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  company    VARCHAR(255) NULL,
  message    TEXT         NOT NULL,
  `read`     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_msg_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Editable background slots (home hero, home CTA, contact hero)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_media (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  slot       VARCHAR(64)  NOT NULL UNIQUE,
  label      VARCHAR(255) NOT NULL,
  media_url  TEXT         NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO site_media (id, slot, label, media_url) VALUES
  (UUID(), 'home_hero',    'Home hero background',   NULL),
  (UUID(), 'home_cta',     'Home CTA background',    NULL),
  (UUID(), 'contact_hero', 'Contact page background', NULL);
