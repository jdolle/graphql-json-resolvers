/**
 * Use addResolveFunctionsToSchema to combine w/schema.
 */

import path from 'path'
import { mapObjIndexed, map } from 'ramda'
import { pipeResolvers } from 'graphql-resolvers'

import readResolversDir from './lib/readResolversDir'
import compileResolver from './lib/compileResolver'
import parseConfig from './lib/parseConfig'

const RESOLVERS_DIR = process.env.RESOLVERS_DIR || path.join(__dirname, 'resolvers')

/**
 * For every field in the fields hash, compile and combine the resolvers.
 */
type CompileFieldsFn = (fields: TypeConfig['fields']) => { [field: string]: ResolverFunction }

const compileFields: CompileFieldsFn = mapObjIndexed((resolvers: ResolverConfig[]) =>
  pipeResolvers(
    ...map(compileResolver, resolvers),
  )
)

export const compile = (dir: string = RESOLVERS_DIR) => {
  let resolvers: any = {}

  readResolversDir(dir).forEach((filePath: string) => {
    const typeConfig = parseConfig(filePath)
    const defaultTypeName = path.parse(filePath).name
    const typeName = typeConfig.type || defaultTypeName

    resolvers = {
      ...resolvers,
      [typeName]: compileFields(typeConfig.fields),
    }
  })

  console.info('%o', resolvers)

  return resolvers
}

compile()
