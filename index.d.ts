interface ResultItem {
  type: 'string' | 'boolean';
  prop: string;
  default?: string;
  enum?: string[];
}

type ParseResult = Array<ResultItem>

export function parse(input: string): ParseResult;
