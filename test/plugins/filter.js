const Filter = require('../../lib/plugins/filter')
const HaltedError = require('../../lib/errors/halted')

const createSpy = jest.fn

describe('filter plugin', () => {
  const context = {
    event: {}
  }

  let filter

  beforeEach(() => {
    filter = new Filter()
  })

  describe('filter', () => {
    it('passes the event and context objects to the supplied function', () => {
      const fn = createSpy().mockReturnValue(true)
      filter.filter(context, fn)

      expect(fn).toHaveBeenCalledWith(context)
    })

    it('returns true if the function does', () => {
      const fn = createSpy().mockReturnValue(true)

      expect(filter.filter(context, fn)).toBe(true)
    })

    it('returns a rejected promise if the function returns false', () => {
      const fn = createSpy().mockReturnValue(false)

      return filter.filter(context, fn).catch(err => {
        expect(err).toBeInstanceOf(HaltedError)
        expect(err.message).toEqual('Filter have rejected the event')
      })
    })
  })

  describe('then', () => {
    it('passes the context object to the supplied function', () => {
      const fn = createSpy()
      filter.filter(context, fn).catch(() => {})

      expect(fn).toHaveBeenCalledWith(context)
    })

    it('returns whatever the function does', () => {
      const fn = createSpy().mockReturnValue('bazinga!')

      expect(filter.then(context, fn)).toBe('bazinga!')
    })
  })

  describe('on', () => {
    describe('matching only the event name', () => {
      it('matches on a single event', () => {
        context.name = 'issues'

        return filter.on(context, 'issues').then(result => {
          expect(result).toEqual('issues')
        })
      })

      it('fails to match on a single event', () => {
        context.name = 'issues'

        return filter.on(context, 'foo').catch(err => {
          expect(err).toBeInstanceOf(HaltedError)
          expect(err.message).toBe('Current event does not match')
        })
      })

      it('matches any of the event names', () => {
        context.name = 'foo'

        return filter.on(context, 'issues', 'foo').then(result => {
          expect(result).toEqual('foo')
        })
      })

      it('fails to match if none of the event names match', () => {
        context.name = 'bar'

        return filter.on(context, 'issues', 'foo').catch(err => {
          expect(err).toBeInstanceOf(HaltedError)
          expect(err.message).toBe('Current event does not match')
        })
      })
    })

    describe('matching the event and action', () => {
      it('matches on a single event', () => {
        context.name = 'issues'
        context.payload = {action: 'opened'}

        return filter.on(context, 'issues.opened').then(result => {
          expect(result).toBe('issues.opened')
        })
      })

      it('fails to match on a single event', () => {
        context.name = 'issues'
        context.payload = {action: 'foo'}

        return filter.on(context, 'issues.opened').catch(err => {
          expect(err).toBeInstanceOf(HaltedError)
          expect(err.message).toBe('Current event does not match')
        })
      })

      it('matches any of the event descriptors', () => {
        context.name = 'issues'
        context.payload = {action: 'closed'}

        return filter.on(context, 'issues.opened', 'issues.closed').then(result => {
          expect(result).toBe('issues.closed')
        })
      })

      it('fails to match if none of the event descriptors match', () => {
        context.name = 'issues'
        context.payload = {action: 'foo'}

        return filter.on(context, 'issues.opened', 'issues.closed').catch(err => {
          expect(err).toBeInstanceOf(HaltedError)
          expect(err.message).toBe('Current event does not match')
        })
      })
    })
  })
})
