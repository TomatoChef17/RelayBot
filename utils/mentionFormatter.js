// utils/mentionFormatter.js
// Replaces user pings (<@id> / <@!id>) with the user's nickname from the source server,
// written as inline code: `@Nickname`. The relayed text stays readable in every server
// and nobody gets pinged by a relayed copy.

// Inline code and code blocks: Discord does not render pings inside them, so we leave them as they are.
const CODE_SEGMENT = /(```[\s\S]*?```|`[^`\n]*`)/;
const USER_MENTION = /<@!?(\d+)>/g;

function resolveDisplayName(userId, message) {
    const member = message?.mentions?.members?.get(userId) ?? message?.guild?.members?.cache?.get(userId);
    if (member) return member.displayName;
    const user = message?.mentions?.users?.get(userId) ?? message?.client?.users?.cache?.get(userId);
    if (user) return user.displayName ?? user.globalName ?? user.username;
    return null;
}

function formatUserMentions(content, message) {
    if (!content) return content;
    return content
        .split(CODE_SEGMENT)
        .map((part, index) => {
            // split() with a capture group puts the code segments at odd indexes.
            if (index % 2 === 1) return part;
            return part.replace(USER_MENTION, (raw, userId) => {
                const name = resolveDisplayName(userId, message) ?? 'Unknown User';
                // A backtick in a nickname would break the inline code.
                return `\`@${name.replace(/`/g, "'")}\``;
            });
        })
        .join('');
}

module.exports = { formatUserMentions };
