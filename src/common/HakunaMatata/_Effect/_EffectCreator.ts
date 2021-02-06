import { currentRef } from '../_Self'
import { effectsRef, useEffect } from '../_hooks'
import { __getEffectDestructors, Effect as EffectClass, __getEffectType } from './_EffectClass'
import { runtimeRef } from '../_runtime'
import { SharedTypeID } from '../_SharedTypeID'

Object.defineProperty(Effect, Symbol.hasInstance, {
    value: (obj: any) => {
        return __getEffectType(obj) === null
    },
})

declare const global
type EffectNotAFunction = { [k: string]: unknown } & ({ bind?: never } | { call?: never })
export function Effect<P extends any[], R extends EffectNotAFunction>(
    constructor: (...args: P) => R
): (...args: P) => R {
    if (currentRef.stack.length > 0) {
        return (EffectClass as any)(constructor)
    }

    if (runtimeRef.runtime) {
        throw new Error('Effect class in runtime')
    }

    const sharedTypeID = SharedTypeID.new(create)

    const $$type = Symbol('type')

    Object.defineProperty(create, Symbol.hasInstance, { value: (obj: any) => obj[$$type] === null })
    function create(...args: P) {
        runtimeRef.runtime = true

        const savedUseEffect = global.useEffect
        global.useEffect = useEffect
        const effect = constructor(...args) as R

        const currentEffect = currentRef.stack.pop()
        const currentEffectInterface = currentEffect.getConstructor()
        currentEffectInterface[$$type] = null
        Object.setPrototypeOf(currentEffectInterface, currentEffect.parent)
        Object.setPrototypeOf(effect, currentEffectInterface)
        global.useEffect = savedUseEffect

        effectsRef.effects.forEach(effect_ => {
            const destructor = effect_()
            if (destructor) {
                __getEffectDestructors(effect).push(destructor)
            }
        })
        effectsRef.effects = []

        return effect
    }
    return create
}