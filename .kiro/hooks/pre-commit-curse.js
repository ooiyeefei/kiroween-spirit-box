/**
 * THE HAUNTED HOOK
 * 
 * This Kiro Agent Hook enforces a "spooky" commit message tone.
 * The spirits demand somber language - no cheerful commits allowed!
 * 
 * Usage: This hook scans commit messages and rejects those that are
 * "too happy" while requiring appropriately dark vocabulary.
 */

const fs = require('fs');

// Words that anger the spirits (too cheerful)
const FORBIDDEN_WORDS = [
  'fix',
  'fixed',
  'good',
  'great',
  'love',
  'happy',
  'awesome',
  'perfect',
  'nice',
  'yay',
  'hooray',
  'excellent',
];

// Words that please the spirits (appropriately somber)
const REQUIRED_WORDS = [
  'repair',
  'patch',
  'resurrect',
  'doom',
  'curse',
  'haunt',
  'summon',
  'banish',
  'exorcise',
  'conjure',
  'invoke',
  'ritual',
  'darkness',
  'shadow',
  'spirit',
  'ghost',
  'phantom',
  'specter',
];

/**
 * Check if a commit message meets the spirits' approval
 * @param {string} message - The commit message to validate
 * @returns {{ valid: boolean, error?: string }}
 */
function checkCommitMessage(message) {
  const lowerMessage = message.toLowerCase();

  // Check for forbidden cheerful words
  const foundForbidden = FORBIDDEN_WORDS.filter(word => 
    lowerMessage.includes(word)
  );

  if (foundForbidden.length > 0) {
    return {
      valid: false,
      error: `
╔══════════════════════════════════════════════════════════════╗
║  👻 THE SPIRITS ARE ANGERED BY YOUR OPTIMISM! 👻              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Forbidden words detected: ${foundForbidden.join(', ').padEnd(30)}║
║                                                              ║
║  The spirits demand a more somber tone...                    ║
║                                                              ║
║  Try using words like:                                       ║
║  repair, patch, resurrect, doom, curse, haunt                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`,
    };
  }

  // Check for required spooky words
  const hasRequired = REQUIRED_WORDS.some(word => 
    lowerMessage.includes(word)
  );

  if (!hasRequired) {
    return {
      valid: false,
      error: `
╔══════════════════════════════════════════════════════════════╗
║  🕯️ YOUR MESSAGE LACKS THE PROPER GRAVITAS 🕯️                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  The spirits require at least one of these words:            ║
║                                                              ║
║  repair, patch, resurrect, doom, curse, haunt,               ║
║  summon, banish, exorcise, conjure, invoke, ritual,          ║
║  darkness, shadow, spirit, ghost, phantom, specter           ║
║                                                              ║
║  Example: "resurrect the audio pipeline from the void"       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`,
    };
  }

  // The spirits approve!
  return {
    valid: true,
    message: `
╔══════════════════════════════════════════════════════════════╗
║  ✨ THE SPIRITS APPROVE YOUR MESSAGE ✨                       ║
╚══════════════════════════════════════════════════════════════╝
`,
  };
}

/**
 * Main hook execution
 * Reads commit message from .git/COMMIT_EDITMSG
 */
function main() {
  const commitMsgFile = process.argv[2] || '.git/COMMIT_EDITMSG';

  try {
    const message = fs.readFileSync(commitMsgFile, 'utf8').trim();
    const result = checkCommitMessage(message);

    if (result.valid) {
      console.log(result.message);
      process.exit(0);
    } else {
      console.error(result.error);
      process.exit(1);
    }
  } catch (error) {
    // If we can't read the file, let the commit proceed
    console.warn('[Spirit Box Hook] Could not read commit message:', error.message);
    process.exit(0);
  }
}

// Export for testing
module.exports = { checkCommitMessage, FORBIDDEN_WORDS, REQUIRED_WORDS };

// Run if executed directly
if (require.main === module) {
  main();
}
