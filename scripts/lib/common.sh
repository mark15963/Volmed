export SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -t 1 ]; then
    C_RED=$'\033[0;31m'
    C_GREEN=$'\033[0;32m'
    C_YELLOW=$'\033[0;33m'
    C_BLUE=$'\033[0;34m'
    C_MAGENTA=$'\033[0;35m'
    C_CYAN=$'\033[0;36m'
    C_BOLD=$'\033[1m'
    C_RESET=$'\033[0m'
else
    C_RED=""; C_GREEN=""; C_YELLOW=""; C_BLUE=""
    C_MAGENTA=""; C_CYAN=""; C_BOLD=""; C_RESET=""
fi

log()  { echo "   $*"; }
err()  { echo "${C_RED}   ✗ $*${C_RESET}" >&2; }
warn() { echo "${C_YELLOW}   ⚠ $*${C_RESET}" >&2; }
ok()   { echo "${C_GREEN}   ✓ $*${C_RESET}"; }
info() { echo "${C_CYAN}   ℹ $*${C_RESET}"; }

step() { echo ""; echo "${C_BOLD}$1${C_RESET}"; }

die()  { err "$*"; exit 1; }