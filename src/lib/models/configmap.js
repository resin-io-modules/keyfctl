'use strict';

const
  _     = require("lodash"),
  file  = require('../shared/file'),
  utils = require('../shared/utils')

module.exports = class Configmap {
  constructor(spec, config) {
    this.spec = spec
    this.config = config
    this.template  = _.get(this.spec, 'kubernetes.configmap', Configmap.template())
    this.availableVars = this.config.componentVars(this.spec.name)
    this.usedVars = _.get(this.spec, 'variables', [])
    this.release = undefined
  }

  writeRelease() {
    return utils.writeRelease(utils.releasePath(this.component.spec.name), this.release)
  }

  versionName() {
    return `${this.spec.name}-${this.spec.version}`
  }

  anyVars() {
    return this.usedVars.length > 0
  }

  buildRelease() {
    if (!this.anyVars()) return

    this.release = _.cloneDeep(this.template)

    _.forEach([
      ['apiVersion'    , 'v1']               ,
      ['metadata.name' , this.versionName()] ,
    ], ([key, val]) => {
      _.set(this.release, key, `${val}`)
    })

    for (let n of this.usedVars) {
      const res = _.find(this.availableVars, ['name', n])

      _.set(this.release, `data.${res.name}`, `${res.value}`)
    }

    return this.release
  }

  static template() {
    return {
      kind: 'ConfigMap',
      apiVersion: null,
      metadata: null,
      data: null
    }
  }
}

