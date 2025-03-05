CREATE EXTENSION IF NOT EXISTS PGCRYPTO;

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  userid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL CHECK (POSITION('@' IN email) > 1),
  password TEXT NOT NULL CHECK (LENGTH(password) >= 60), -- Ensures it's hashed
  old_passwords TEXT[] DEFAULT '{}', -- Stores previous passwords
  recovery_email TEXT CHECK (POSITION('@' IN recovery_email) > 1), -- Optional recovery email
  recovery_phone TEXT CHECK (recovery_phone ~ '^[0-9+]+$'), -- Optional recovery phone number
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE accounts (
  id BIGSERIAL PRIMARY KEY,
  userid UUID UNIQUE NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dob TIMESTAMP,
  avatar_url TEXT,

  -- MFA Enhancements
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_type TEXT CHECK (mfa_type IN ('TOTP', 'SMS', 'EMAIL', 'NONE')) DEFAULT 'NONE',
  mfa_secret TEXT CHECK (mfa_enabled = TRUE OR mfa_secret IS NULL), -- NULL unless MFA is enabled
  mfa_backup_codes TEXT[] DEFAULT '{}' CHECK (array_length(mfa_backup_codes, 1) <= 10), -- Up to 10 one-time use codes

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roles (
  id BIGSERIAL PRIMARY KEY,
  userid UUID NOT NULL UNIQUE REFERENCES users(userid) ON DELETE CASCADE,
  roles TEXT[] NOT NULL DEFAULT '{}', -- Array of roles (e.g., ['admin', 'user'])
  clearance INT NOT NULL CHECK (clearance BETWEEN 0 AND 100), -- Restricts clearance range
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX roles_idx ON roles USING GIN (roles);