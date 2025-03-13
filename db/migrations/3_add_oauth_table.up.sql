CREATE TABLE auth_providers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft', 'manual')),
  provider_id TEXT, -- OAuth provider's unique user ID (NULL for manual signups)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (provider, provider_id), -- Ensures no duplicate OAuth entries
  CONSTRAINT manual_requires_no_provider_id CHECK (
    (provider = 'manual' AND provider_id IS NULL) OR (provider != 'manual' AND provider_id IS NOT NULL)
  )
);