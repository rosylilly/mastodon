import escapeTextContentForBrowser from 'escape-html';
import emojify from '../../features/emoji/emoji';
import { unescapeHTML } from '../../utils/html';

const domParser = new DOMParser();

const makeProfileEmojiMap = (record) => (record.profile_emojis || []).reduce((obj, emoji) => {
  obj[emoji.shortcode] = emoji;
  return obj;
}, {});

const makeEmojiMap = (record,profileEmojiMap) => record.emojis.reduce((obj, emoji) => {
  obj[`:${emoji.shortcode}:`] = emoji;
  return obj;
}, profileEmojiMap);

export function normalizeAccount(account) {
  account = { ...account };

  const profileEmojiMap = makeProfileEmojiMap(account)
  const emojiMap = makeEmojiMap(account,profileEmojiMap);
  const displayName = account.display_name.length === 0 ? account.username : account.display_name;

  account.display_name_html = emojify(escapeTextContentForBrowser(displayName), emojiMap);
  account.note_emojified = emojify(account.note, emojiMap);

  if (account.fields) {
    account.fields = account.fields.map(pair => ({
      ...pair,
      name_emojified: emojify(escapeTextContentForBrowser(pair.name)),
      value_emojified: emojify(pair.value, emojiMap),
      value_plain: unescapeHTML(pair.value),
    }));
  }

  if (account.moved) {
    account.moved = account.moved.id;
  }

  return account;
}

export function normalizeStatus(status, normalOldStatus) {
  const normalStatus   = { ...status };
  normalStatus.account = status.account.id;

  if (status.reblog && status.reblog.id) {
    normalStatus.reblog = status.reblog.id;
  }

  // Only calculate these values when status first encountered
  // Otherwise keep the ones already in the reducer
  if (normalOldStatus) {
    normalStatus.search_index = normalOldStatus.get('search_index');
    normalStatus.contentHtml = normalOldStatus.get('contentHtml');
    normalStatus.spoilerHtml = normalOldStatus.get('spoilerHtml');
    normalStatus.hidden = normalOldStatus.get('hidden');
  } else {
    const searchContent = [status.spoiler_text, status.content].join('\n\n').replace(/<br\s*\/?>/g, '\n').replace(/<\/p><p>/g, '\n\n');

    const profileEmojiMap = makeProfileEmojiMap(normalStatus)
    const emojiMap = makeEmojiMap(normalStatus,profileEmojiMap);

    normalStatus.search_index = domParser.parseFromString(searchContent, 'text/html').documentElement.textContent;
    normalStatus.contentHtml  = emojify(normalStatus.content, emojiMap);
    normalStatus.spoilerHtml  = emojify(escapeTextContentForBrowser(normalStatus.spoiler_text || ''), emojiMap);
    normalStatus.hidden       = normalStatus.sensitive;
  }

  return normalStatus;
}
