const expect = require('expect');
const Filter = require('../../lib/plugins/filter');
const HaltedError = require('../../lib/errors/halted');

const createSpy = expect.createSpy;

describe('plugins/Filter', () => {
  const context = {
    event: {}
  };

  let filter;

  before(() => {
    filter = new Filter();
  });

  describe('filter', () => {
    it('passes the event and context objects to the supplied function', () => {
      const fn = createSpy().andReturn(true);
      filter.filter(context, fn);

      expect(fn).toHaveBeenCalledWith(context);
    });

    it('returns true if the function does', () => {
      const fn = createSpy().andReturn(true);

      expect(filter.filter(context, fn)).toBe(true);
    });

    it('returns a rejected promise if the function returns false', () => {
      const fn = createSpy().andReturn(false);

      return filter.filter(context, fn).catch(err => {
        expect(err).toBeA(HaltedError);
      });
    });
  });

  describe('then', () => {
    it('returns whatever the function does', () => {
      const fn = createSpy().andReturn('bazinga!');

      expect(filter.then(context, fn)).toBe('bazinga!');
    });
  });

  describe('on', () => {
    describe('matching only the event name', () => {
      it('matches on a single event', () => {
        context.event = 'issues';

        return filter.on(context, 'issues').then(result => {
          expect(result).toEqual('issues');
        });
      });

      it('fails to match on a single event', () => {
        context.event = 'issues';

        return filter.on(context, 'foo').catch(err => {
          expect(err).toBeA(HaltedError);
        });
      });

      it('matches any of the event names', () => {
        context.event = 'foo';

        return filter.on(context, 'issues', 'foo').then(result => {
          expect(result).toEqual('foo');
        });
      });

      it('fails to match if none of the event names match', () => {
        context.event = 'bar';

        return filter.on(context, 'issues', 'foo').catch(err => {
          expect(err).toBeA(HaltedError);
        });
      });
    });

    describe('matching the event and action', () => {
      it('matches on a single event', () => {
        context.event = 'issues';
        context.payload = {action: 'opened'};

        return filter.on(context, 'issues.opened').then(result => {
          expect(result).toBe('issues.opened');
        });
      });

      it('fails to match on a single event', () => {
        context.event = 'issues';
        context.payload = {action: 'foo'};

        return filter.on(context, 'issues.opened').catch(err => {
          expect(err).toBeA(HaltedError);
        });
      });

      it('matches any of the event descriptors', () => {
        context.event = 'issues';
        context.payload = {action: 'closed'};

        return filter.on(context, 'issues.opened', 'issues.closed').then(result => {
          expect(result).toBe('issues.closed');
        });
      });

      it('fails to match if none of the event descriptors match', () => {
        context.event = 'issues';
        context.payload = {action: 'foo'};

        return filter.on(context, 'issues.opened', 'issues.closed').catch(err => {
          expect(err).toBeA(HaltedError);
        });
      });
    });
  });
});
