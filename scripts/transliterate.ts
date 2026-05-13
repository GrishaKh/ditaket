/**
 * Deterministic transliteration of Armenian (Eastern) to Latin and Cyrillic.
 * Used to produce station-name / community-name display strings for the EN
 * and RU locales when the CEC publishes only Armenian originals.
 *
 * Latin mapping follows ISO 9985 / BGN-PCGN (Eastern Armenian) with common
 * simplifications (Շ→Sh, Չ→Ch, Ց→Ts, Ձ→Dz, Թ→T').
 * Cyrillic mapping aligns with the conventional Armenian→Russian rendering
 * (Շիրակ → Ширак, Վանաձոր → Ванадзор).
 */

// Latin (lowercase keys, mirrored for uppercase)
const TO_LATIN: Record<string, string> = {
  ա: 'a',
  բ: 'b',
  գ: 'g',
  դ: 'd',
  ե: 'e',
  զ: 'z',
  է: 'e',
  ը: 'ě',
  թ: 't',
  ժ: 'zh',
  ի: 'i',
  լ: 'l',
  խ: 'kh',
  ծ: 'ts',
  կ: 'k',
  հ: 'h',
  ձ: 'dz',
  ղ: 'gh',
  ճ: 'ch',
  մ: 'm',
  յ: 'y',
  ն: 'n',
  շ: 'sh',
  ո: 'o',
  չ: 'ch',
  պ: 'p',
  ջ: 'j',
  ռ: 'r',
  ս: 's',
  վ: 'v',
  տ: 't',
  ր: 'r',
  ց: 'ts',
  ու: 'u',
  փ: 'p',
  ք: 'k',
  և: 'ev',
  օ: 'o',
  ֆ: 'f',
};

const TO_CYRILLIC: Record<string, string> = {
  ա: 'а',
  բ: 'б',
  գ: 'г',
  դ: 'д',
  ե: 'е',
  զ: 'з',
  է: 'э',
  ը: 'ы',
  թ: 'т',
  ժ: 'ж',
  ի: 'и',
  լ: 'л',
  խ: 'х',
  ծ: 'ц',
  կ: 'к',
  հ: 'h',
  ձ: 'дз',
  ղ: 'г',
  ճ: 'ч',
  մ: 'м',
  յ: 'й',
  ն: 'н',
  շ: 'ш',
  ո: 'о',
  չ: 'ч',
  պ: 'п',
  ջ: 'дж',
  ռ: 'р',
  ս: 'с',
  վ: 'в',
  տ: 'т',
  ր: 'р',
  ց: 'ц',
  ու: 'у',
  փ: 'п',
  ք: 'к',
  և: 'ев',
  օ: 'о',
  ֆ: 'ф',
};

function transliterate(input: string, table: Record<string, string>): string {
  if (!input) return '';
  let out = '';
  let i = 0;
  while (i < input.length) {
    // Try 2-char first (e.g. "ու")
    const pair = input.slice(i, i + 2).toLowerCase();
    if (table[pair]) {
      const replacement = table[pair];
      out += matchCase(replacement, input.slice(i, i + 2));
      i += 2;
      continue;
    }
    const ch = input[i]!;
    const mapped = table[ch.toLowerCase()];
    if (mapped) {
      out += matchCase(mapped, ch);
    } else {
      out += ch;
    }
    i += 1;
  }
  return out;
}

function matchCase(mapped: string, original: string): string {
  if (!original) return mapped;
  const first = original[0]!;
  if (first === first.toUpperCase() && first !== first.toLowerCase()) {
    // Title-case the mapped output
    return mapped[0]!.toUpperCase() + mapped.slice(1);
  }
  return mapped;
}

export function armToLatin(input: string): string {
  return transliterate(input, TO_LATIN);
}

export function armToCyrillic(input: string): string {
  return transliterate(input, TO_CYRILLIC);
}

// Quick CLI smoke test:
//   tsx scripts/transliterate.ts "Շիրակ" "Վանաձոր"
if (process.argv[1]?.endsWith('transliterate.ts')) {
  for (const w of process.argv.slice(2)) {
    console.log(`${w}  →  ${armToLatin(w)}  /  ${armToCyrillic(w)}`);
  }
}
