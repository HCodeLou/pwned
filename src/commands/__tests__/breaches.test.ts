import { vi, type SpyInstance } from 'vitest';
import { server, rest } from '../../../test/server';
import {
  spinnerFns,
  loggerFns,
  FOUND,
  NOT_FOUND,
  ERROR,
  ERROR_MSG,
} from '../../../test/fixtures';
import {
  logger as mockLogger,
  spinner as mockSpinner,
  type Logger,
} from '../../utils';
import { handler as breaches } from '../breaches';

vi.mock('../../utils');

const logger = mockLogger as Logger & {
  [key: string]: SpyInstance;
};

const spinner = mockSpinner as typeof mockSpinner & {
  [key: string]: SpyInstance;
};

describe('command: breaches', () => {
  describe('normal output (default)', () => {
    it('calls spinner.start', async () => {
      expect(spinner.start).toHaveBeenCalledTimes(0);
      await breaches({ domainFilter: FOUND, raw: false });
      expect(spinner.start).toHaveBeenCalledTimes(1);
    });

    it('with data: calls spinner.stop and logger.log', async () => {
      expect(spinner.stop).toHaveBeenCalledTimes(0);
      expect(logger.log).toHaveBeenCalledTimes(0);
      await breaches({ domainFilter: FOUND, raw: false });
      expect(spinner.stop).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledTimes(1);
    });

    it('without data: only calls spinner.succeed', async () => {
      expect(spinner.succeed).toHaveBeenCalledTimes(0);
      loggerFns.forEach((fn) => expect(logger[fn]).toHaveBeenCalledTimes(0));
      await breaches({ domainFilter: NOT_FOUND, raw: false });
      expect(spinner.succeed).toHaveBeenCalledTimes(1);
      loggerFns.forEach((fn) => expect(logger[fn]).toHaveBeenCalledTimes(0));
    });

    it('on error: only calls spinner.fail', async () => {
      server.use(rest.get('*', (_, res) => res.networkError(ERROR_MSG)));

      expect(spinner.fail).toHaveBeenCalledTimes(0);
      loggerFns.forEach((fn) => expect(logger[fn]).toHaveBeenCalledTimes(0));
      await breaches({ domainFilter: ERROR, raw: false });
      expect(spinner.fail).toHaveBeenCalledTimes(1);
      loggerFns.forEach((fn) => expect(logger[fn]).toHaveBeenCalledTimes(0));
    });
  });

  describe('raw mode', () => {
    it('does not call spinner.start', async () => {
      expect(spinner.start).toHaveBeenCalledTimes(0);
      await breaches({ domainFilter: FOUND, raw: true });
      expect(spinner.start).toHaveBeenCalledTimes(0);
    });

    it('with data: only calls logger.log', async () => {
      spinnerFns.forEach((fn) => expect(spinner[fn]).toHaveBeenCalledTimes(0));
      expect(logger.log).toHaveBeenCalledTimes(0);
      await breaches({ domainFilter: FOUND, raw: true });
      spinnerFns.forEach((fn) => expect(spinner[fn]).toHaveBeenCalledTimes(0));
      expect(logger.log).toHaveBeenCalledTimes(1);
    });

    it('without data: does not call any spinner or logger methods', async () => {
      spinnerFns.forEach((fn) => expect(spinner[fn]).toHaveBeenCalledTimes(0));
      loggerFns.forEach((fn) => expect(logger[fn]).toHaveBeenCalledTimes(0));
      await breaches({ domainFilter: NOT_FOUND, raw: true });
      spinnerFns.forEach((fn) => expect(spinner[fn]).toHaveBeenCalledTimes(0));
      loggerFns.forEach((fn) => expect(logger[fn]).toHaveBeenCalledTimes(0));
    });

    it('on error: only calls logger.error', async () => {
      server.use(rest.get('*', (_, res) => res.networkError(ERROR_MSG)));

      spinnerFns.forEach((fn) => expect(spinner[fn]).toHaveBeenCalledTimes(0));
      expect(logger.error).toHaveBeenCalledTimes(0);
      await breaches({ domainFilter: ERROR, raw: true });
      spinnerFns.forEach((fn) => expect(spinner[fn]).toHaveBeenCalledTimes(0));
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });
});
