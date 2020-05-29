import { warnIfDebug } from 'utils/log';
import { create, hasOwn } from 'utils/object';
import { BaseParseOpts } from 'types/ParseOptions';
import { TemplateDefinition } from './templateElements';

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

export type Converter = (parser: Parser) => TemplateDefinition;

export interface CustomParser {
  init: (str: string, options: BaseParseOpts) => void;
  postProcess: (str: string, options?: BaseParseOpts) => any;
}

// todo add correct return types on props and methods
class Parser {
  public str: string;
  public options: any;
  public pos: number;

  public lines: string[];
  public lineEnds: number[];

  public leftover: string;
  public result: any;

  protected converters: Converter[];

  // todo maybe the following properties can be moved to standard parser?
  // if yes update also the converter function parser param type
  public relaxedNames: any[];
  public inEvent: boolean;

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

  read(converters?): any {
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

  getLinePos(char: number): [number, number, number] {
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

    const error = new ParseError(msg as string);

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
    let match: RegExpExecArray;

    if ((match = pattern.exec(this.remaining()))) {
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

    // todo restore after log converted to ts
    warnIfDebug(msg);
  }

  public static extend = function(proto) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const Parent = this;
    const Child = function(str, options) {
      Parser.call(this, str, options);
    };

    Child.prototype = create(Parent.prototype);

    for (const key in proto) {
      if (hasOwn(proto, key)) {
        Child.prototype[key] = proto[key];
      }
    }

    Child.extend = Parser.extend;
    return Child;
  };
}

export default Parser;
