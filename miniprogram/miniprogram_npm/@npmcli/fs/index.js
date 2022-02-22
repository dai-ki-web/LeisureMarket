module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1645518184378, function(require, module, exports) {
module.exports = {
  ...require('./fs.js'),
  copyFile: require('./copy-file.js'),
  cp: require('./cp/index.js'),
  mkdir: require('./mkdir/index.js'),
  mkdtemp: require('./mkdtemp.js'),
  rm: require('./rm/index.js'),
  withTempDir: require('./with-temp-dir.js'),
  writeFile: require('./write-file.js'),
}

}, function(modId) {var map = {"./fs.js":1645518184379,"./copy-file.js":1645518184380,"./cp/index.js":1645518184386,"./mkdir/index.js":1645518184389,"./mkdtemp.js":1645518184391,"./rm/index.js":1645518184392,"./with-temp-dir.js":1645518184394,"./write-file.js":1645518184395}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184379, function(require, module, exports) {
const fs = require('fs')
const promisify = require('@gar/promisify')

// this module returns the core fs module wrapped in a proxy that promisifies
// method calls within the getter. we keep it in a separate module so that the
// overridden methods have a consistent way to get to promisified fs methods
// without creating a circular dependency
module.exports = promisify(fs)

}, function(modId) { var map = {"fs":1645518184379}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184380, function(require, module, exports) {
const fs = require('./fs.js')
const getOptions = require('./common/get-options.js')
const owner = require('./common/owner.js')

const copyFile = async (src, dest, opts) => {
  const options = getOptions(opts, {
    copy: ['mode', 'owner'],
    wrap: 'mode',
  })

  const { uid, gid } = await owner.validate(dest, options.owner)

  // the node core method as of 16.5.0 does not support the mode being in an
  // object, so we have to pass the mode value directly
  const result = await fs.copyFile(src, dest, options.mode)

  await owner.update(dest, uid, gid)

  return result
}

module.exports = copyFile

}, function(modId) { var map = {"./fs.js":1645518184379,"./common/get-options.js":1645518184381,"./common/owner.js":1645518184382}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184381, function(require, module, exports) {
// given an input that may or may not be an object, return an object that has
// a copy of every defined property listed in 'copy'. if the input is not an
// object, assign it to the property named by 'wrap'
const getOptions = (input, { copy, wrap }) => {
  const result = {}

  if (input && typeof input === 'object') {
    for (const prop of copy) {
      if (input[prop] !== undefined) {
        result[prop] = input[prop]
      }
    }
  } else {
    result[wrap] = input
  }

  return result
}

module.exports = getOptions

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184382, function(require, module, exports) {
const { dirname, resolve } = require('path')

const fileURLToPath = require('./file-url-to-path/index.js')
const fs = require('../fs.js')

// given a path, find the owner of the nearest parent
const find = async (path) => {
  // if we have no getuid, permissions are irrelevant on this platform
  if (!process.getuid) {
    return {}
  }

  // fs methods accept URL objects with a scheme of file: so we need to unwrap
  // those into an actual path string before we can resolve it
  const resolved = path != null && path.href && path.origin
    ? resolve(fileURLToPath(path))
    : resolve(path)

  let stat

  try {
    stat = await fs.lstat(resolved)
  } finally {
    // if we got a stat, return its contents
    if (stat) {
      return { uid: stat.uid, gid: stat.gid }
    }

    // try the parent directory
    if (resolved !== dirname(resolved)) {
      return find(dirname(resolved))
    }

    // no more parents, never got a stat, just return an empty object
    return {}
  }
}

// given a path, uid, and gid update the ownership of the path if necessary
const update = async (path, uid, gid) => {
  // nothing to update, just exit
  if (uid === undefined && gid === undefined) {
    return
  }

  try {
    // see if the permissions are already the same, if they are we don't
    // need to do anything, so return early
    const stat = await fs.stat(path)
    if (uid === stat.uid && gid === stat.gid) {
      return
    }
  } catch (err) {}

  try {
    await fs.chown(path, uid, gid)
  } catch (err) {}
}

// accepts a `path` and the `owner` property of an options object and normalizes
// it into an object with numerical `uid` and `gid`
const validate = async (path, input) => {
  let uid
  let gid

  if (typeof input === 'string' || typeof input === 'number') {
    uid = input
    gid = input
  } else if (input && typeof input === 'object') {
    uid = input.uid
    gid = input.gid
  }

  if (uid === 'inherit' || gid === 'inherit') {
    const owner = await find(path)
    if (uid === 'inherit') {
      uid = owner.uid
    }

    if (gid === 'inherit') {
      gid = owner.gid
    }
  }

  return { uid, gid }
}

module.exports = {
  find,
  update,
  validate,
}

}, function(modId) { var map = {"./file-url-to-path/index.js":1645518184383,"../fs.js":1645518184379}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184383, function(require, module, exports) {
const url = require('url')

const node = require('../node.js')
const polyfill = require('./polyfill.js')

const useNative = node.satisfies('>=10.12.0')

const fileURLToPath = (path) => {
  // the polyfill is tested separately from this module, no need to hack
  // process.version to try to trigger it just for coverage
  // istanbul ignore next
  return useNative
    ? url.fileURLToPath(path)
    : polyfill(path)
}

module.exports = fileURLToPath

}, function(modId) { var map = {"../node.js":1645518184384,"./polyfill.js":1645518184385}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184384, function(require, module, exports) {
const semver = require('semver')

const satisfies = (range) => {
  return semver.satisfies(process.version, range, { includePrerelease: true })
}

module.exports = {
  satisfies,
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184385, function(require, module, exports) {
const { URL, domainToUnicode } = require('url')

const CHAR_LOWERCASE_A = 97
const CHAR_LOWERCASE_Z = 122

const isWindows = process.platform === 'win32'

class ERR_INVALID_FILE_URL_HOST extends TypeError {
  constructor (platform) {
    super(`File URL host must be "localhost" or empty on ${platform}`)
    this.code = 'ERR_INVALID_FILE_URL_HOST'
  }

  toString () {
    return `${this.name} [${this.code}]: ${this.message}`
  }
}

class ERR_INVALID_FILE_URL_PATH extends TypeError {
  constructor (msg) {
    super(`File URL path ${msg}`)
    this.code = 'ERR_INVALID_FILE_URL_PATH'
  }

  toString () {
    return `${this.name} [${this.code}]: ${this.message}`
  }
}

class ERR_INVALID_ARG_TYPE extends TypeError {
  constructor (name, actual) {
    super(`The "${name}" argument must be one of type string or an instance ` +
      `of URL. Received type ${typeof actual} ${actual}`)
    this.code = 'ERR_INVALID_ARG_TYPE'
  }

  toString () {
    return `${this.name} [${this.code}]: ${this.message}`
  }
}

class ERR_INVALID_URL_SCHEME extends TypeError {
  constructor (expected) {
    super(`The URL must be of scheme ${expected}`)
    this.code = 'ERR_INVALID_URL_SCHEME'
  }

  toString () {
    return `${this.name} [${this.code}]: ${this.message}`
  }
}

const isURLInstance = (input) => {
  return input != null && input.href && input.origin
}

const getPathFromURLWin32 = (url) => {
  const hostname = url.hostname
  let pathname = url.pathname
  for (let n = 0; n < pathname.length; n++) {
    if (pathname[n] === '%') {
      const third = pathname.codePointAt(n + 2) | 0x20
      if ((pathname[n + 1] === '2' && third === 102) ||
        (pathname[n + 1] === '5' && third === 99)) {
        throw new ERR_INVALID_FILE_URL_PATH('must not include encoded \\ or / characters')
      }
    }
  }

  pathname = pathname.replace(/\//g, '\\')
  pathname = decodeURIComponent(pathname)
  if (hostname !== '') {
    return `\\\\${domainToUnicode(hostname)}${pathname}`
  }

  const letter = pathname.codePointAt(1) | 0x20
  const sep = pathname[2]
  if (letter < CHAR_LOWERCASE_A || letter > CHAR_LOWERCASE_Z ||
    (sep !== ':')) {
    throw new ERR_INVALID_FILE_URL_PATH('must be absolute')
  }

  return pathname.slice(1)
}

const getPathFromURLPosix = (url) => {
  if (url.hostname !== '') {
    throw new ERR_INVALID_FILE_URL_HOST(process.platform)
  }

  const pathname = url.pathname

  for (let n = 0; n < pathname.length; n++) {
    if (pathname[n] === '%') {
      const third = pathname.codePointAt(n + 2) | 0x20
      if (pathname[n + 1] === '2' && third === 102) {
        throw new ERR_INVALID_FILE_URL_PATH('must not include encoded / characters')
      }
    }
  }

  return decodeURIComponent(pathname)
}

const fileURLToPath = (path) => {
  if (typeof path === 'string') {
    path = new URL(path)
  } else if (!isURLInstance(path)) {
    throw new ERR_INVALID_ARG_TYPE('path', ['string', 'URL'], path)
  }

  if (path.protocol !== 'file:') {
    throw new ERR_INVALID_URL_SCHEME('file')
  }

  return isWindows
    ? getPathFromURLWin32(path)
    : getPathFromURLPosix(path)
}

module.exports = fileURLToPath

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184386, function(require, module, exports) {
const fs = require('../fs.js')
const getOptions = require('../common/get-options.js')
const node = require('../common/node.js')
const polyfill = require('./polyfill.js')

// node 16.7.0 added fs.cp
const useNative = node.satisfies('>=16.7.0')

const cp = async (src, dest, opts) => {
  const options = getOptions(opts, {
    copy: ['dereference', 'errorOnExist', 'filter', 'force', 'preserveTimestamps', 'recursive'],
  })

  // the polyfill is tested separately from this module, no need to hack
  // process.version to try to trigger it just for coverage
  // istanbul ignore next
  return useNative
    ? fs.cp(src, dest, options)
    : polyfill(src, dest, options)
}

module.exports = cp

}, function(modId) { var map = {"../fs.js":1645518184379,"../common/get-options.js":1645518184381,"../common/node.js":1645518184384,"./polyfill.js":1645518184387}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184387, function(require, module, exports) {
// this file is a modified version of the code in node 17.2.0
// which is, in turn, a modified version of the fs-extra module on npm
// node core changes:
// - Use of the assert module has been replaced with core's error system.
// - All code related to the glob dependency has been removed.
// - Bring your own custom fs module is not currently supported.
// - Some basic code cleanup.
// changes here:
// - remove all callback related code
// - drop sync support
// - change assertions back to non-internal methods (see options.js)
// - throws ENOTDIR when rmdir gets an ENOENT for a path that exists in Windows


const {
  ERR_FS_CP_DIR_TO_NON_DIR,
  ERR_FS_CP_EEXIST,
  ERR_FS_CP_EINVAL,
  ERR_FS_CP_FIFO_PIPE,
  ERR_FS_CP_NON_DIR_TO_DIR,
  ERR_FS_CP_SOCKET,
  ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY,
  ERR_FS_CP_UNKNOWN,
  ERR_FS_EISDIR,
  ERR_INVALID_ARG_TYPE,
} = require('../errors.js')
const {
  constants: {
    errno: {
      EEXIST,
      EISDIR,
      EINVAL,
      ENOTDIR,
    },
  },
} = require('os')
const {
  chmod,
  copyFile,
  lstat,
  mkdir,
  readdir,
  readlink,
  stat,
  symlink,
  unlink,
  utimes,
} = require('../fs.js')
const {
  dirname,
  isAbsolute,
  join,
  parse,
  resolve,
  sep,
  toNamespacedPath,
} = require('path')
const { fileURLToPath } = require('url')

const defaultOptions = {
  dereference: false,
  errorOnExist: false,
  filter: undefined,
  force: true,
  preserveTimestamps: false,
  recursive: false,
}

async function cp (src, dest, opts) {
  if (opts != null && typeof opts !== 'object') {
    throw new ERR_INVALID_ARG_TYPE('options', ['Object'], opts)
  }
  return cpFn(
    toNamespacedPath(getValidatedPath(src)),
    toNamespacedPath(getValidatedPath(dest)),
    { ...defaultOptions, ...opts })
}

function getValidatedPath (fileURLOrPath) {
  const path = fileURLOrPath != null && fileURLOrPath.href
      && fileURLOrPath.origin
    ? fileURLToPath(fileURLOrPath)
    : fileURLOrPath
  return path
}

async function cpFn (src, dest, opts) {
  // Warn about using preserveTimestamps on 32-bit node
  // istanbul ignore next
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    const warning = 'Using the preserveTimestamps option in 32-bit ' +
      'node is not recommended'
    process.emitWarning(warning, 'TimestampPrecisionWarning')
  }
  const stats = await checkPaths(src, dest, opts)
  const { srcStat, destStat } = stats
  await checkParentPaths(src, srcStat, dest)
  if (opts.filter) {
    return handleFilter(checkParentDir, destStat, src, dest, opts)
  }
  return checkParentDir(destStat, src, dest, opts)
}

async function checkPaths (src, dest, opts) {
  const { 0: srcStat, 1: destStat } = await getStats(src, dest, opts)
  if (destStat) {
    if (areIdentical(srcStat, destStat)) {
      throw new ERR_FS_CP_EINVAL({
        message: 'src and dest cannot be the same',
        path: dest,
        syscall: 'cp',
        errno: EINVAL,
      })
    }
    if (srcStat.isDirectory() && !destStat.isDirectory()) {
      throw new ERR_FS_CP_DIR_TO_NON_DIR({
        message: `cannot overwrite directory ${src} ` +
            `with non-directory ${dest}`,
        path: dest,
        syscall: 'cp',
        errno: EISDIR,
      })
    }
    if (!srcStat.isDirectory() && destStat.isDirectory()) {
      throw new ERR_FS_CP_NON_DIR_TO_DIR({
        message: `cannot overwrite non-directory ${src} ` +
            `with directory ${dest}`,
        path: dest,
        syscall: 'cp',
        errno: ENOTDIR,
      })
    }
  }

  if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
    throw new ERR_FS_CP_EINVAL({
      message: `cannot copy ${src} to a subdirectory of self ${dest}`,
      path: dest,
      syscall: 'cp',
      errno: EINVAL,
    })
  }
  return { srcStat, destStat }
}

function areIdentical (srcStat, destStat) {
  return destStat.ino && destStat.dev && destStat.ino === srcStat.ino &&
    destStat.dev === srcStat.dev
}

function getStats (src, dest, opts) {
  const statFunc = opts.dereference ?
    (file) => stat(file, { bigint: true }) :
    (file) => lstat(file, { bigint: true })
  return Promise.all([
    statFunc(src),
    statFunc(dest).catch((err) => {
      // istanbul ignore next: unsure how to cover.
      if (err.code === 'ENOENT') {
        return null
      }
      // istanbul ignore next: unsure how to cover.
      throw err
    }),
  ])
}

async function checkParentDir (destStat, src, dest, opts) {
  const destParent = dirname(dest)
  const dirExists = await pathExists(destParent)
  if (dirExists) {
    return getStatsForCopy(destStat, src, dest, opts)
  }
  await mkdir(destParent, { recursive: true })
  return getStatsForCopy(destStat, src, dest, opts)
}

function pathExists (dest) {
  return stat(dest).then(
    () => true,
    // istanbul ignore next: not sure when this would occur
    (err) => (err.code === 'ENOENT' ? false : Promise.reject(err)))
}

// Recursively check if dest parent is a subdirectory of src.
// It works for all file types including symlinks since it
// checks the src and dest inodes. It starts from the deepest
// parent and stops once it reaches the src parent or the root path.
async function checkParentPaths (src, srcStat, dest) {
  const srcParent = resolve(dirname(src))
  const destParent = resolve(dirname(dest))
  if (destParent === srcParent || destParent === parse(destParent).root) {
    return
  }
  let destStat
  try {
    destStat = await stat(destParent, { bigint: true })
  } catch (err) {
    // istanbul ignore else: not sure when this would occur
    if (err.code === 'ENOENT') {
      return
    }
    // istanbul ignore next: not sure when this would occur
    throw err
  }
  if (areIdentical(srcStat, destStat)) {
    throw new ERR_FS_CP_EINVAL({
      message: `cannot copy ${src} to a subdirectory of self ${dest}`,
      path: dest,
      syscall: 'cp',
      errno: EINVAL,
    })
  }
  return checkParentPaths(src, srcStat, destParent)
}

const normalizePathToArray = (path) =>
  resolve(path).split(sep).filter(Boolean)

// Return true if dest is a subdir of src, otherwise false.
// It only checks the path strings.
function isSrcSubdir (src, dest) {
  const srcArr = normalizePathToArray(src)
  const destArr = normalizePathToArray(dest)
  return srcArr.every((cur, i) => destArr[i] === cur)
}

async function handleFilter (onInclude, destStat, src, dest, opts, cb) {
  const include = await opts.filter(src, dest)
  if (include) {
    return onInclude(destStat, src, dest, opts, cb)
  }
}

function startCopy (destStat, src, dest, opts) {
  if (opts.filter) {
    return handleFilter(getStatsForCopy, destStat, src, dest, opts)
  }
  return getStatsForCopy(destStat, src, dest, opts)
}

async function getStatsForCopy (destStat, src, dest, opts) {
  const statFn = opts.dereference ? stat : lstat
  const srcStat = await statFn(src)
  // istanbul ignore else: can't portably test FIFO
  if (srcStat.isDirectory() && opts.recursive) {
    return onDir(srcStat, destStat, src, dest, opts)
  } else if (srcStat.isDirectory()) {
    throw new ERR_FS_EISDIR({
      message: `${src} is a directory (not copied)`,
      path: src,
      syscall: 'cp',
      errno: EINVAL,
    })
  } else if (srcStat.isFile() ||
            srcStat.isCharacterDevice() ||
            srcStat.isBlockDevice()) {
    return onFile(srcStat, destStat, src, dest, opts)
  } else if (srcStat.isSymbolicLink()) {
    return onLink(destStat, src, dest)
  } else if (srcStat.isSocket()) {
    throw new ERR_FS_CP_SOCKET({
      message: `cannot copy a socket file: ${dest}`,
      path: dest,
      syscall: 'cp',
      errno: EINVAL,
    })
  } else if (srcStat.isFIFO()) {
    throw new ERR_FS_CP_FIFO_PIPE({
      message: `cannot copy a FIFO pipe: ${dest}`,
      path: dest,
      syscall: 'cp',
      errno: EINVAL,
    })
  }
  // istanbul ignore next: should be unreachable
  throw new ERR_FS_CP_UNKNOWN({
    message: `cannot copy an unknown file type: ${dest}`,
    path: dest,
    syscall: 'cp',
    errno: EINVAL,
  })
}

function onFile (srcStat, destStat, src, dest, opts) {
  if (!destStat) {
    return _copyFile(srcStat, src, dest, opts)
  }
  return mayCopyFile(srcStat, src, dest, opts)
}

async function mayCopyFile (srcStat, src, dest, opts) {
  if (opts.force) {
    await unlink(dest)
    return _copyFile(srcStat, src, dest, opts)
  } else if (opts.errorOnExist) {
    throw new ERR_FS_CP_EEXIST({
      message: `${dest} already exists`,
      path: dest,
      syscall: 'cp',
      errno: EEXIST,
    })
  }
}

async function _copyFile (srcStat, src, dest, opts) {
  await copyFile(src, dest)
  if (opts.preserveTimestamps) {
    return handleTimestampsAndMode(srcStat.mode, src, dest)
  }
  return setDestMode(dest, srcStat.mode)
}

async function handleTimestampsAndMode (srcMode, src, dest) {
  // Make sure the file is writable before setting the timestamp
  // otherwise open fails with EPERM when invoked with 'r+'
  // (through utimes call)
  if (fileIsNotWritable(srcMode)) {
    await makeFileWritable(dest, srcMode)
    return setDestTimestampsAndMode(srcMode, src, dest)
  }
  return setDestTimestampsAndMode(srcMode, src, dest)
}

function fileIsNotWritable (srcMode) {
  return (srcMode & 0o200) === 0
}

function makeFileWritable (dest, srcMode) {
  return setDestMode(dest, srcMode | 0o200)
}

async function setDestTimestampsAndMode (srcMode, src, dest) {
  await setDestTimestamps(src, dest)
  return setDestMode(dest, srcMode)
}

function setDestMode (dest, srcMode) {
  return chmod(dest, srcMode)
}

async function setDestTimestamps (src, dest) {
  // The initial srcStat.atime cannot be trusted
  // because it is modified by the read(2) system call
  // (See https://nodejs.org/api/fs.html#fs_stat_time_values)
  const updatedSrcStat = await stat(src)
  return utimes(dest, updatedSrcStat.atime, updatedSrcStat.mtime)
}

function onDir (srcStat, destStat, src, dest, opts) {
  if (!destStat) {
    return mkDirAndCopy(srcStat.mode, src, dest, opts)
  }
  return copyDir(src, dest, opts)
}

async function mkDirAndCopy (srcMode, src, dest, opts) {
  await mkdir(dest)
  await copyDir(src, dest, opts)
  return setDestMode(dest, srcMode)
}

async function copyDir (src, dest, opts) {
  const dir = await readdir(src)
  for (let i = 0; i < dir.length; i++) {
    const item = dir[i]
    const srcItem = join(src, item)
    const destItem = join(dest, item)
    const { destStat } = await checkPaths(srcItem, destItem, opts)
    await startCopy(destStat, srcItem, destItem, opts)
  }
}

async function onLink (destStat, src, dest) {
  let resolvedSrc = await readlink(src)
  if (!isAbsolute(resolvedSrc)) {
    resolvedSrc = resolve(dirname(src), resolvedSrc)
  }
  if (!destStat) {
    return symlink(resolvedSrc, dest)
  }
  let resolvedDest
  try {
    resolvedDest = await readlink(dest)
  } catch (err) {
    // Dest exists and is a regular file or directory,
    // Windows may throw UNKNOWN error. If dest already exists,
    // fs throws error anyway, so no need to guard against it here.
    // istanbul ignore next: can only test on windows
    if (err.code === 'EINVAL' || err.code === 'UNKNOWN') {
      return symlink(resolvedSrc, dest)
    }
    // istanbul ignore next: should not be possible
    throw err
  }
  if (!isAbsolute(resolvedDest)) {
    resolvedDest = resolve(dirname(dest), resolvedDest)
  }
  if (isSrcSubdir(resolvedSrc, resolvedDest)) {
    throw new ERR_FS_CP_EINVAL({
      message: `cannot copy ${resolvedSrc} to a subdirectory of self ` +
            `${resolvedDest}`,
      path: dest,
      syscall: 'cp',
      errno: EINVAL,
    })
  }
  // Do not copy if src is a subdir of dest since unlinking
  // dest in this case would result in removing src contents
  // and therefore a broken symlink would be created.
  const srcStat = await stat(src)
  if (srcStat.isDirectory() && isSrcSubdir(resolvedDest, resolvedSrc)) {
    throw new ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY({
      message: `cannot overwrite ${resolvedDest} with ${resolvedSrc}`,
      path: dest,
      syscall: 'cp',
      errno: EINVAL,
    })
  }
  return copyLink(resolvedSrc, dest)
}

async function copyLink (resolvedSrc, dest) {
  await unlink(dest)
  return symlink(resolvedSrc, dest)
}

module.exports = cp

}, function(modId) { var map = {"../errors.js":1645518184388,"../fs.js":1645518184379}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184388, function(require, module, exports) {

const { inspect } = require('util')

// adapted from node's internal/errors
// https://github.com/nodejs/node/blob/c8a04049/lib/internal/errors.js

// close copy of node's internal SystemError class.
class SystemError {
  constructor (code, prefix, context) {
    // XXX context.code is undefined in all constructors used in cp/polyfill
    // that may be a bug copied from node, maybe the constructor should use
    // `code` not `errno`?  nodejs/node#41104
    let message = `${prefix}: ${context.syscall} returned ` +
                  `${context.code} (${context.message})`

    if (context.path !== undefined) {
      message += ` ${context.path}`
    }
    if (context.dest !== undefined) {
      message += ` => ${context.dest}`
    }

    this.code = code
    Object.defineProperties(this, {
      name: {
        value: 'SystemError',
        enumerable: false,
        writable: true,
        configurable: true,
      },
      message: {
        value: message,
        enumerable: false,
        writable: true,
        configurable: true,
      },
      info: {
        value: context,
        enumerable: true,
        configurable: true,
        writable: false,
      },
      errno: {
        get () {
          return context.errno
        },
        set (value) {
          context.errno = value
        },
        enumerable: true,
        configurable: true,
      },
      syscall: {
        get () {
          return context.syscall
        },
        set (value) {
          context.syscall = value
        },
        enumerable: true,
        configurable: true,
      },
    })

    if (context.path !== undefined) {
      Object.defineProperty(this, 'path', {
        get () {
          return context.path
        },
        set (value) {
          context.path = value
        },
        enumerable: true,
        configurable: true,
      })
    }

    if (context.dest !== undefined) {
      Object.defineProperty(this, 'dest', {
        get () {
          return context.dest
        },
        set (value) {
          context.dest = value
        },
        enumerable: true,
        configurable: true,
      })
    }
  }

  toString () {
    return `${this.name} [${this.code}]: ${this.message}`
  }

  [Symbol.for('nodejs.util.inspect.custom')] (_recurseTimes, ctx) {
    return inspect(this, {
      ...ctx,
      getters: true,
      customInspect: false,
    })
  }
}

function E (code, message) {
  module.exports[code] = class NodeError extends SystemError {
    constructor (ctx) {
      super(code, message, ctx)
    }
  }
}

E('ERR_FS_CP_DIR_TO_NON_DIR', 'Cannot overwrite directory with non-directory')
E('ERR_FS_CP_EEXIST', 'Target already exists')
E('ERR_FS_CP_EINVAL', 'Invalid src or dest')
E('ERR_FS_CP_FIFO_PIPE', 'Cannot copy a FIFO pipe')
E('ERR_FS_CP_NON_DIR_TO_DIR', 'Cannot overwrite non-directory with directory')
E('ERR_FS_CP_SOCKET', 'Cannot copy a socket file')
E('ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY', 'Cannot overwrite symlink in subdirectory of self')
E('ERR_FS_CP_UNKNOWN', 'Cannot copy an unknown file type')
E('ERR_FS_EISDIR', 'Path is a directory')

module.exports.ERR_INVALID_ARG_TYPE = class ERR_INVALID_ARG_TYPE extends Error {
  constructor (name, expected, actual) {
    super()
    this.code = 'ERR_INVALID_ARG_TYPE'
    this.message = `The ${name} argument must be ${expected}. Received ${typeof actual}`
  }
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184389, function(require, module, exports) {
const fs = require('../fs.js')
const getOptions = require('../common/get-options.js')
const node = require('../common/node.js')
const owner = require('../common/owner.js')

const polyfill = require('./polyfill.js')

// node 10.12.0 added the options parameter, which allows recursive and mode
// properties to be passed
const useNative = node.satisfies('>=10.12.0')

// extends mkdir with the ability to specify an owner of the new dir
const mkdir = async (path, opts) => {
  const options = getOptions(opts, {
    copy: ['mode', 'recursive', 'owner'],
    wrap: 'mode',
  })
  const { uid, gid } = await owner.validate(path, options.owner)

  // the polyfill is tested separately from this module, no need to hack
  // process.version to try to trigger it just for coverage
  // istanbul ignore next
  const result = useNative
    ? await fs.mkdir(path, options)
    : await polyfill(path, options)

  await owner.update(path, uid, gid)

  return result
}

module.exports = mkdir

}, function(modId) { var map = {"../fs.js":1645518184379,"../common/get-options.js":1645518184381,"../common/node.js":1645518184384,"../common/owner.js":1645518184382,"./polyfill.js":1645518184390}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184390, function(require, module, exports) {
const { dirname } = require('path')

const fileURLToPath = require('../common/file-url-to-path/index.js')
const fs = require('../fs.js')

const defaultOptions = {
  mode: 0o777,
  recursive: false,
}

const mkdir = async (path, opts) => {
  const options = { ...defaultOptions, ...opts }

  // if we're not in recursive mode, just call the real mkdir with the path and
  // the mode option only
  if (!options.recursive) {
    return fs.mkdir(path, options.mode)
  }

  const makeDirectory = async (dir, mode) => {
    // we can't use dirname directly since these functions support URL
    // objects with the file: protocol as the path input, so first we get a
    // string path, then we can call dirname on that
    const parent = dir != null && dir.href && dir.origin
      ? dirname(fileURLToPath(dir))
      : dirname(dir)

    // if the parent is the dir itself, try to create it. anything but EISDIR
    // should be rethrown
    if (parent === dir) {
      try {
        await fs.mkdir(dir, opts)
      } catch (err) {
        if (err.code !== 'EISDIR') {
          throw err
        }
      }
      return undefined
    }

    try {
      await fs.mkdir(dir, mode)
      return dir
    } catch (err) {
      // ENOENT means the parent wasn't there, so create that
      if (err.code === 'ENOENT') {
        const made = await makeDirectory(parent, mode)
        await makeDirectory(dir, mode)
        // return the shallowest path we created, i.e. the result of creating
        // the parent
        return made
      }

      // an EEXIST means there's already something there
      // an EROFS means we have a read-only filesystem and can't create a dir
      // any other error is fatal and we should give up now
      if (err.code !== 'EEXIST' && err.code !== 'EROFS') {
        throw err
      }

      // stat the directory, if the result is a directory, then we successfully
      // created this one so return its path. otherwise, we reject with the
      // original error by ignoring the error in the catch
      try {
        const stat = await fs.stat(dir)
        if (stat.isDirectory()) {
          // if it already existed, we didn't create anything so return
          // undefined
          return undefined
        }
      } catch (_) {}

      // if the thing that's there isn't a directory, then just re-throw
      throw err
    }
  }

  return makeDirectory(path, options.mode)
}

module.exports = mkdir

}, function(modId) { var map = {"../common/file-url-to-path/index.js":1645518184383,"../fs.js":1645518184379}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184391, function(require, module, exports) {
const { dirname, sep } = require('path')

const fs = require('./fs.js')
const getOptions = require('./common/get-options.js')
const owner = require('./common/owner.js')

const mkdtemp = async (prefix, opts) => {
  const options = getOptions(opts, {
    copy: ['encoding', 'owner'],
    wrap: 'encoding',
  })

  // mkdtemp relies on the trailing path separator to indicate if it should
  // create a directory inside of the prefix. if that's the case then the root
  // we infer ownership from is the prefix itself, otherwise it's the dirname
  // /tmp -> /tmpABCDEF, infers from /
  // /tmp/ -> /tmp/ABCDEF, infers from /tmp
  const root = prefix.endsWith(sep) ? prefix : dirname(prefix)
  const { uid, gid } = await owner.validate(root, options.owner)

  const result = await fs.mkdtemp(prefix, options)

  await owner.update(result, uid, gid)

  return result
}

module.exports = mkdtemp

}, function(modId) { var map = {"./fs.js":1645518184379,"./common/get-options.js":1645518184381,"./common/owner.js":1645518184382}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184392, function(require, module, exports) {
const fs = require('../fs.js')
const getOptions = require('../common/get-options.js')
const node = require('../common/node.js')
const polyfill = require('./polyfill.js')

// node 14.14.0 added fs.rm, which allows both the force and recursive options
const useNative = node.satisfies('>=14.14.0')

const rm = async (path, opts) => {
  const options = getOptions(opts, {
    copy: ['retryDelay', 'maxRetries', 'recursive', 'force'],
  })

  // the polyfill is tested separately from this module, no need to hack
  // process.version to try to trigger it just for coverage
  // istanbul ignore next
  return useNative
    ? fs.rm(path, options)
    : polyfill(path, options)
}

module.exports = rm

}, function(modId) { var map = {"../fs.js":1645518184379,"../common/get-options.js":1645518184381,"../common/node.js":1645518184384,"./polyfill.js":1645518184393}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184393, function(require, module, exports) {
// this file is a modified version of the code in node core >=14.14.0
// which is, in turn, a modified version of the rimraf module on npm
// node core changes:
// - Use of the assert module has been replaced with core's error system.
// - All code related to the glob dependency has been removed.
// - Bring your own custom fs module is not currently supported.
// - Some basic code cleanup.
// changes here:
// - remove all callback related code
// - drop sync support
// - change assertions back to non-internal methods (see options.js)
// - throws ENOTDIR when rmdir gets an ENOENT for a path that exists in Windows
const errnos = require('os').constants.errno
const { join } = require('path')
const fs = require('../fs.js')

// error codes that mean we need to remove contents
const notEmptyCodes = new Set([
  'ENOTEMPTY',
  'EEXIST',
  'EPERM',
])

// error codes we can retry later
const retryCodes = new Set([
  'EBUSY',
  'EMFILE',
  'ENFILE',
  'ENOTEMPTY',
  'EPERM',
])

const isWindows = process.platform === 'win32'

const defaultOptions = {
  retryDelay: 100,
  maxRetries: 0,
  recursive: false,
  force: false,
}

// this is drastically simplified, but should be roughly equivalent to what
// node core throws
class ERR_FS_EISDIR extends Error {
  constructor (path) {
    super()
    this.info = {
      code: 'EISDIR',
      message: 'is a directory',
      path,
      syscall: 'rm',
      errno: errnos.EISDIR,
    }
    this.name = 'SystemError'
    this.code = 'ERR_FS_EISDIR'
    this.errno = errnos.EISDIR
    this.syscall = 'rm'
    this.path = path
    this.message = `Path is a directory: ${this.syscall} returned ` +
      `${this.info.code} (is a directory) ${path}`
  }

  toString () {
    return `${this.name} [${this.code}]: ${this.message}`
  }
}

class ENOTDIR extends Error {
  constructor (path) {
    super()
    this.name = 'Error'
    this.code = 'ENOTDIR'
    this.errno = errnos.ENOTDIR
    this.syscall = 'rmdir'
    this.path = path
    this.message = `not a directory, ${this.syscall} '${this.path}'`
  }

  toString () {
    return `${this.name}: ${this.code}: ${this.message}`
  }
}

// force is passed separately here because we respect it for the first entry
// into rimraf only, any further calls that are spawned as a result (i.e. to
// delete content within the target) will ignore ENOENT errors
const rimraf = async (path, options, isTop = false) => {
  const force = isTop ? options.force : true
  const stat = await fs.lstat(path)
    .catch((err) => {
      // we only ignore ENOENT if we're forcing this call
      if (err.code === 'ENOENT' && force) {
        return
      }

      if (isWindows && err.code === 'EPERM') {
        return fixEPERM(path, options, err, isTop)
      }

      throw err
    })

  // no stat object here means either lstat threw an ENOENT, or lstat threw
  // an EPERM and the fixPERM function took care of things. either way, we're
  // already done, so return early
  if (!stat) {
    return
  }

  if (stat.isDirectory()) {
    return rmdir(path, options, null, isTop)
  }

  return fs.unlink(path)
    .catch((err) => {
      if (err.code === 'ENOENT' && force) {
        return
      }

      if (err.code === 'EISDIR') {
        return rmdir(path, options, err, isTop)
      }

      if (err.code === 'EPERM') {
        // in windows, we handle this through fixEPERM which will also try to
        // delete things again. everywhere else since deleting the target as a
        // file didn't work we go ahead and try to delete it as a directory
        return isWindows
          ? fixEPERM(path, options, err, isTop)
          : rmdir(path, options, err, isTop)
      }

      throw err
    })
}

const fixEPERM = async (path, options, originalErr, isTop) => {
  const force = isTop ? options.force : true
  const targetMissing = await fs.chmod(path, 0o666)
    .catch((err) => {
      if (err.code === 'ENOENT' && force) {
        return true
      }

      throw originalErr
    })

  // got an ENOENT above, return now. no file = no problem
  if (targetMissing) {
    return
  }

  // this function does its own lstat rather than calling rimraf again to avoid
  // infinite recursion for a repeating EPERM
  const stat = await fs.lstat(path)
    .catch((err) => {
      if (err.code === 'ENOENT' && force) {
        return
      }

      throw originalErr
    })

  if (!stat) {
    return
  }

  if (stat.isDirectory()) {
    return rmdir(path, options, originalErr, isTop)
  }

  return fs.unlink(path)
}

const rmdir = async (path, options, originalErr, isTop) => {
  if (!options.recursive && isTop) {
    throw originalErr || new ERR_FS_EISDIR(path)
  }
  const force = isTop ? options.force : true

  return fs.rmdir(path)
    .catch(async (err) => {
      // in Windows, calling rmdir on a file path will fail with ENOENT rather
      // than ENOTDIR. to determine if that's what happened, we have to do
      // another lstat on the path. if the path isn't actually gone, we throw
      // away the ENOENT and replace it with our own ENOTDIR
      if (isWindows && err.code === 'ENOENT') {
        const stillExists = await fs.lstat(path).then(() => true, () => false)
        if (stillExists) {
          err = new ENOTDIR(path)
        }
      }

      // not there, not a problem
      if (err.code === 'ENOENT' && force) {
        return
      }

      // we may not have originalErr if lstat tells us our target is a
      // directory but that changes before we actually remove it, so
      // only throw it here if it's set
      if (originalErr && err.code === 'ENOTDIR') {
        throw originalErr
      }

      // the directory isn't empty, remove the contents and try again
      if (notEmptyCodes.has(err.code)) {
        const files = await fs.readdir(path)
        await Promise.all(files.map((file) => {
          const target = join(path, file)
          return rimraf(target, options)
        }))
        return fs.rmdir(path)
      }

      throw err
    })
}

const rm = async (path, opts) => {
  const options = { ...defaultOptions, ...opts }
  let retries = 0

  const errHandler = async (err) => {
    if (retryCodes.has(err.code) && ++retries < options.maxRetries) {
      const delay = retries * options.retryDelay
      await promiseTimeout(delay)
      return rimraf(path, options, true).catch(errHandler)
    }

    throw err
  }

  return rimraf(path, options, true).catch(errHandler)
}

const promiseTimeout = (ms) => new Promise((r) => setTimeout(r, ms))

module.exports = rm

}, function(modId) { var map = {"../fs.js":1645518184379}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184394, function(require, module, exports) {
const { join, sep } = require('path')

const getOptions = require('./common/get-options.js')
const mkdir = require('./mkdir/index.js')
const mkdtemp = require('./mkdtemp.js')
const rm = require('./rm/index.js')

// create a temp directory, ensure its permissions match its parent, then call
// the supplied function passing it the path to the directory. clean up after
// the function finishes, whether it throws or not
const withTempDir = async (root, fn, opts) => {
  const options = getOptions(opts, {
    copy: ['tmpPrefix'],
  })
  // create the directory, and fix its ownership
  await mkdir(root, { recursive: true, owner: 'inherit' })

  const target = await mkdtemp(join(`${root}${sep}`, options.tmpPrefix || ''), { owner: 'inherit' })
  let err
  let result

  try {
    result = await fn(target)
  } catch (_err) {
    err = _err
  }

  try {
    await rm(target, { force: true, recursive: true })
  } catch (err) {}

  if (err) {
    throw err
  }

  return result
}

module.exports = withTempDir

}, function(modId) { var map = {"./common/get-options.js":1645518184381,"./mkdir/index.js":1645518184389,"./mkdtemp.js":1645518184391,"./rm/index.js":1645518184392}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1645518184395, function(require, module, exports) {
const fs = require('./fs.js')
const getOptions = require('./common/get-options.js')
const owner = require('./common/owner.js')

const writeFile = async (file, data, opts) => {
  const options = getOptions(opts, {
    copy: ['encoding', 'mode', 'flag', 'signal', 'owner'],
    wrap: 'encoding',
  })
  const { uid, gid } = await owner.validate(file, options.owner)

  const result = await fs.writeFile(file, data, options)

  await owner.update(file, uid, gid)

  return result
}

module.exports = writeFile

}, function(modId) { var map = {"./fs.js":1645518184379,"./common/get-options.js":1645518184381,"./common/owner.js":1645518184382}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1645518184378);
})()
//miniprogram-npm-outsideDeps=["@gar/promisify","path","url","semver","os","util"]
//# sourceMappingURL=index.js.map