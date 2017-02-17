import debug from 'debug';
import util from 'util';

const logger = debug('api-io');

export default (...log) => {
  logger(util.format(...log));
};
