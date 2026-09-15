import { filterByPredicate, groupBy, sortBy, uniqueBy } from './utils';

describe('generic utilities', () => {
  const items = [
    { id: 1, group: 'work', value: 2 },
    { id: 2, group: 'home', value: 1 },
    { id: 3, group: 'work', value: 3 },
  ];

  it('groups values by a typed key', () => {
    expect(groupBy(items, (item) => item.group)).toEqual({ work: [items[0], items[2]], home: [items[1]] });
  });

  it('sorts without mutating its input', () => {
    expect(sortBy(items, (first, second) => first.value - second.value).map((item) => item.id)).toEqual([2, 1, 3]);
    expect(items.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it('filters and removes duplicate keys', () => {
    expect(filterByPredicate(items, (item) => item.value > 1)).toHaveLength(2);
    expect(uniqueBy([...items, items[0]], (item) => item.id)).toHaveLength(3);
  });
});