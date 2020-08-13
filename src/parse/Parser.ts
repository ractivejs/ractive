import { BaseParseOpts } from 'types/Parse';
import { warnIfDebug } from 'utils/log';

const leadingWhitespace = /^\s+/;

class ParseError extends Error {
  public line: number;
  public character: number;
  public shortMessage: string;

  constructor(message: string) {
    super();
    this.name = 'ParseError';
    this.message = message;
  }
}

export type LinePosition = [number, number, number];

export type Converter = (parser: Parser) => any;

export interface CustomParser {
  init: (str: string, options: BaseParseOpts) => void;
  postProcess: (str: string, options?: BaseParseOpts) => any;
}

// todo add correct return types on props and methods
// todo need to add parser type <T> and use it in result and postProcess function
class Parser {
  public str: string;
  public options: BaseParseOpts;
  public pos: number;

  public lines: string[];
  public lineEnds: number[];

  public leftover: string;
  public result: any;

  protected converters: Converter[];

  constructor(str: string, options: BaseParseOpts) {
    this.str = str;
    this.options = options || {};
    this.pos = 0;

    this.lines = this.str.split('\n');

    let lineStart = 0;
    this.lineEnds = this.lines.map(line => {
      const lineEnd = lineStart + line.length + 1; // +1 for the newline

      lineStart = lineEnd;
      return lineEnd;
    }, 0);

    // Custom init logic
    if (this.init) this.init(str, options);

    const items = [];

    let item;
    while (this.pos < this.str.length && (item = this.read())) {
      items.push(item);
    }

    this.leftover = this.remaining();
    this.result = this.postProcess(items, options);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  init(_str, _options): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  postProcess(items, _options): any {
    return items;
  }

  read(converters?: Converter[]): any {
    let i: number;
    let item;

    if (!converters) converters = this.converters;

    const pos = this.pos;

    const len = converters.length;
    for (i = 0; i < len; i += 1) {
      this.pos = pos; // reset for each attempt

      if ((item = converters[i](this))) {
        return item;
      }
    }

    return null;
  }

  getContextMessage(pos: number, message: string): [number, number, string] {
    const [lineNum, columnNum] = this.getLinePos(pos);
    if (this.options.contextLines === -1) {
      return [lineNum, columnNum, `${message} at line ${lineNum} character ${columnNum}`];
    }

    const line = this.lines[lineNum - 1];

    let contextUp = '';
    let contextDown = '';
    if (this.options.contextLines) {
      const start =
        lineNum - 1 - this.options.contextLines < 0 ? 0 : lineNum - 1 - this.options.contextLines;
      contextUp = this.lines
        .slice(start, lineNum - 1 - start)
        .join('\n')
        .replace(/\t/g, '  ');
      contextDown = this.lines
        .slice(lineNum, lineNum + this.options.contextLines)
        .join('\n')
        .replace(/\t/g, '  ');
      if (contextUp) {
        contextUp += '\n';
      }
      if (contextDown) {
        contextDown = '\n' + contextDown;
      }
    }

    let numTabs = 0;
    const annotation =
      contextUp +
      line.replace(/\t/g, (_match, char) => {
        if (char < columnNum) {
          numTabs += 1;
        }

        return '  ';
      }) +
      '\n' +
      new Array(columnNum + numTabs).join(' ') +
      '^----' +
      contextDown;

    return [
      lineNum,
      columnNum,
      `${message} at line ${lineNum} character ${columnNum}:\n${annotation}`
    ];
  }

  getLinePos(char: number): LinePosition {
    let lineNum = 0;
    let lineStart = 0;

    while (char >= this.lineEnds[lineNum]) {
      lineStart = this.lineEnds[lineNum];
      lineNum += 1;
    }

    const columnNum = char - lineStart;
    return [lineNum + 1, columnNum + 1, char]; // line/col should be one-based, not zero-based!
  }

  error(message: string): void {
    const [lineNum, columnNum, msg] = this.getContextMessage(this.pos, message);

    const error = new ParseError(msg);

    error.line = lineNum;
    error.character = columnNum;
    error.shortMessage = message;

    throw error;
  }

  matchString(string: string): string {
    if (this.str.substr(this.pos, string.length) === string) {
      this.pos += string.length;
      return string;
    }
  }

  matchPattern(pattern: RegExp): string {
    const match = pattern.exec(this.remaining());

    if (match) {
      this.pos += match[0].length;
      return match[1] || match[0];
    }
  }

  sp(): void {
    this.matchPattern(leadingWhitespace);
  }

  remaining(): string {
    return this.str.substring(this.pos);
  }

  nextChar(): string {
    return this.str.charAt(this.pos);
  }

  warn(message: string): void {
    const msg = this.getContextMessage(this.pos, message)[2];

    warnIfDebug(msg);
  }
}

export default Parser;
