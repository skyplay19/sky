import { HakunaMatataClass } from './@'
import { __getHakunaMatataDestructors } from './_HakunaMatata/_HakunaMatataClass'

export const withScopeRef = { on: false }

export function withScope<T extends any[], R extends any>(
    fn: (scope: IHakunaMatata, ...args: T) => R
) {
    return (...args: [...T, (scope: IHakunaMatata, ...args: T) => void | (() => void)]) => {
        withScopeRef.on = true
        const scope: IHakunaMatata = (HakunaMatataClass as any)({})
        withScopeRef.on = false

        const getScope = FunctionEventEmitter(() => (scope.dead ? null : scope))

        const baseArgs = args.slice(0, -1) as T
        fn(scope, ...baseArgs)
        getScope.emit('change')
        getScope.emit('create')
        const destructor = (_.last(args) as (
            scope: IHakunaMatata,
            ...args: T
        ) => void | (() => void))(scope, ...baseArgs)

        if (destructor) {
            if (scope.dead) {
                destructor()
            } else {
                __getHakunaMatataDestructors(scope).push(destructor)
            }
        }

        if (scope.dead) {
            getScope.emit('change')
            getScope.emit('destroy')
        } else {
            __getHakunaMatataDestructors(scope).push(() => getScope.emit('destroy'))
        }

        return getScope
    }
}