const REGEX = /^(?:([\w-]+)\/([\w-]+):)?([^#]*)(?:#(.*))?$/

/**
 * Parses paths
 *
 * @param url in the form of `owner/repo:path/to/file#ref`
 * @param source to merge
 * @returns {Object}
 */
module.exports = function (url, source) {
  const [, owner, repo, path, ref] = url.match(REGEX)
  return Object.assign({}, source, {path}, owner && {owner, repo}, ref && {ref})
}
