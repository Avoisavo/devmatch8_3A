Deploying RedPill proxy to Oasis ROFL

This folder contains a minimal ROFL-ready setup for your Express-based RedPill proxy (server.js).
It includes:
- compose.yaml: container definition used by ROFL.
- rofl.yaml: ROFL app manifest and resource policy.

What the service exposes
- HTTP server listening on PORT (defaults to 5000), with /health and /chat/completions endpoints.
- Requires REDPILL (or REDPILL_API_KEY) env var for the upstream RedPill API.

Prerequisites
- Docker and access to a public container registry (Docker Hub or GHCR).
- Oasis CLI (either installed natively or via the rofl-dev Docker image).
- An Oasis Sapphire Testnet account funded with TEST tokens (for app creation and deployment fees).

1) Build and push your container image
Edit compose.yaml and replace the image: with a public image you control.
Examples below use GHCR; you can use Docker Hub similarly.

# Login to GHCR (use a GitHub Personal Access Token with "write:packages")
echo "$GHCR_TOKEN" | docker login ghcr.io -u YOUR_GH_USER --password-stdin

# Build linux/amd64 image and push
# Run from repo root or adjust path; this context is packages/nextjs/redpill

docker buildx build \
  --platform linux/amd64 \
  -t ghcr.io/YOUR_ORG_OR_USER/redpill-proxy:latest \
  packages/nextjs/redpill

docker push ghcr.io/YOUR_ORG_OR_USER/redpill-proxy:latest

Optional: pin to digest for integrity
After pushing you can grab the digest and pin it in compose.yaml:

docker buildx imagetools inspect ghcr.io/YOUR_ORG_OR_USER/redpill-proxy:latest
# Then set image: ghcr.io/.../redpill-proxy:latest@sha256:<digest>

2) Install/prepare Oasis CLI
Preferred: Install Oasis CLI natively. Alternatively, use the dev image:

a) Everything Docker (CLI inside rofl-dev)
# This preserves your Oasis config so accounts are persisted.
# You can alias this to `oasis` in your shell profile.

docker run --platform linux/amd64 --rm \
  -v .:/src \
  -v ~/.config/oasis:/root/.config/oasis \
  -it ghcr.io/oasisprotocol/rofl-dev:main oasis --help

b) Native install
See: https://docs.oasis.io/build/rofl/prerequisites

Create/import an account and fund it on Sapphire Testnet

# Inside the `oasis` CLI (native or via the docker run above):
oasis wallet create           # or: oasis wallet import
# Fund the account with TEST (use faucet). You need ~110 TEST initially.

3) Register the ROFL app (assigns an App ID)
Run commands from this folder: packages/nextjs/redpill

# Initialize manifest if you didn't commit rofl.yaml already (we did):
# oasis rofl init

# Create the ROFL app on Testnet (select the account when prompted or pass --account)
oasis rofl create --network testnet
# CLI prints the new App ID and stores it in rofl.yaml deployments

4) Set your secret (RedPill API key)
Secrets are end-to-end encrypted to the ROFL app and exposed as env vars.

export REDPILL="<your_redpill_api_key>"
echo -n "$REDPILL" | oasis rofl secret set REDPILL -

# Apply secret and any policy updates on-chain
oasis rofl update --network testnet

5) Build the ROFL bundle (.orc)
Native:
  oasis rofl build

Via rofl-dev container:
  docker run --platform linux/amd64 --rm -v $PWD:/src -it ghcr.io/oasisprotocol/rofl-dev:main oasis rofl build

This updates enclave IDs in rofl.yaml based on compose + resources.

6) Deploy to a ROFL node (Marketplace)
# Optional: See available offers first
oasis rofl deploy --show-offers --network testnet

# Deploy (uses default provider/offer unless overridden)
oasis rofl deploy --network testnet

The CLI will:
- Upload your .orc bundle to an Oasis-managed OCI repo (rofl.sh/...)
- Rent a machine from a provider (unless one already exists)
- Update rofl.yaml with machine details

7) Check status and logs
# Show machine details (ID, status, offer, paid-until, etc.)
oasis rofl machine show --network testnet

# Show app instances and policy
oasis rofl show --network testnet

# Fetch logs (note: logs are not encrypted; avoid printing secrets)
oasis rofl machine logs --network testnet

8) Test the service
We mapped container port 5000 to host 8080 in compose.yaml.
Whether the port is reachable publicly depends on the provider/offer settings.
If exposed, you should be able to curl the health endpoint:

curl http://<provider-host-or-machine-address>:8080/health

If inbound networking is not exposed in your offer, consider using the service for
outbound calls only or select an offer that supports inbound ports.

Local testing (without ROFL)
# From this folder:
REDPILL=sk-... docker compose up --build
curl http://localhost:8080/health

Making changes
- If you change container images, dependencies or compose.yaml, rebuild the bundle:
  oasis rofl build
- Any policy or secret changes require:
  oasis rofl update --network testnet
- Changing resources (memory/cpus/storage) changes the enclave identity; run build + update.

Tips
- Always use a fully qualified image URL (e.g., ghcr.io/you/redpill-proxy:latest).
- Prefer pinning by digest for deterministic attestation.
- Store sensitive data only via `oasis rofl secret set` and never in plaintext logs.

Troubleshooting
- Missing REDPILL key: server will warn at startup and /chat/completions will fail.
- 5xx from upstream: check that REDPILL is valid and network egress is allowed by provider.
- Not reachable over ports: inspect offer capabilities or contact provider; not all offers expose inbound networking.
