import { propertyDecorator } from '@skyplay19/helpers'
import { $$native, ArgUnwrap, ArgWrap } from './__'

declare const global: any

export function applyArrayProp(name: string, prototype: any, prop: { type: string; key: string }) {
    let length = global.___NATIVE[`${name}_array_length_${prop.key}`]
    const get = global.___NATIVE[`${name}_array_get_${prop.key}`]
    const set = global.___NATIVE[`${name}_array_set_${prop.key}`]
    const add = global.___NATIVE[`${name}_array_add_${prop.key}`]
    const remove = global.___NATIVE[`${name}_array_remove_${prop.key}`]
    const clear = global.___NATIVE[`${name}_array_clear_${prop.key}`]

    const isStatic = prop.type.indexOf('[') !== -1

    let baseType
    if (!isStatic) {
        baseType = prop.type.slice(prop.type.lastIndexOf('<') + 1, prop.type.indexOf('>'))
    } else {
        baseType = prop.type.slice(0, prop.type.lastIndexOf('['))
    }
    const key = Symbol(prop.key)

    if (isStatic) {
        length = Number(prop.type.slice(prop.type.indexOf('[') + 1, prop.type.indexOf(']')))
    }

    if (baseType.indexOf('*') !== -1) {
        const wrap = ArgWrap(baseType)!
        const unwrap = ArgUnwrap(baseType)!
        const descriptor: any = {
            configurable: true,
            enumerable: true,
        }
        if (isStatic) {
            descriptor.get = function () {
                const native = this[$$native]
                const self = this
                this[key] =
                    this[key] ||
                    Object.setPrototypeOf(
                        {
                            get length() {
                                return length
                            },
                            get items() {
                                const items = []
                                for (let i = 0; i < length; i++) {
                                    const item = wrap(get(native, i))
                                    items.push(item)
                                }
                                return items
                            },
                            get(idx: number) {
                                return wrap(get(native, idx))
                            },
                        },
                        NativeArray
                    )
                return this[key]
            }
        } else {
            descriptor.get = function () {
                const native = this[$$native]
                const self = this
                this[key] =
                    this[key] ||
                    Object.setPrototypeOf(
                        {
                            get length() {
                                return length(native)
                            },
                            get items() {
                                const items = []
                                const len = length(native)
                                for (let i = 0; i < len; i++) {
                                    const item = wrap(get(native, i))
                                    items.push(item)
                                }
                                return items
                            },
                            get(idx: number) {
                                return wrap(get(native, idx))
                            },
                            add(value: HakunaMatata) {
                                ;(value as any).__attachTo(self, () =>
                                    remove(native, unwrap(value))
                                )
                                self.__childs.push(value)
                                add(native, unwrap(value))
                            },
                            remove(value: any) {
                                self.remove(value)
                                remove(native, unwrap(value))
                            },
                            clear() {
                                const len = length(native)
                                for (let i = 0; i < len; i++) {
                                    const value = wrap(get(native, i))
                                    self.remove(value)
                                }
                                clear(native)
                            },
                        },
                        NativeArray
                    )
                return this[key]
            }
        }
        propertyDecorator(() => descriptor)(prototype, prop.key)
    } else {
        const descriptor: any = {}
        if (isStatic) {
            descriptor.get = function () {
                const native = this[$$native]
                this[key] =
                    this[key] ||
                    Object.setPrototypeOf(
                        {
                            get length() {
                                return length
                            },
                            get items() {
                                const items = []
                                for (let i = 0; i < length; i++) {
                                    const item = get(native, i)
                                    items.push(item)
                                }
                                return items
                            },
                            get(idx: number) {
                                return get(native, idx)
                            },
                            set(idx: number, v: any) {
                                set(native, idx, v)
                            },
                        },
                        NativeArray
                    )
                return this[key]
            }
        } else {
            descriptor.get = function () {
                const native = this[$$native]
                this[key] =
                    this[key] ||
                    Object.setPrototypeOf(
                        {
                            get length() {
                                return length(native)
                            },
                            get items() {
                                const items = []
                                const len = length(native)
                                for (let i = 0; i < len; i++) {
                                    const item = get(native, i)
                                    items.push(item)
                                }
                                return items
                            },
                            get(idx: number) {
                                return get(native, idx)
                            },
                            set(idx: number, v: any) {
                                set(native, idx, v)
                            },
                            add(v: any) {
                                add(native, v)
                            },
                            remove(v: any) {
                                remove(native, v)
                            },
                            clear() {
                                clear(native)
                            },
                        },
                        NativeArray
                    )
                return this[key]
            }
        }
        Object.defineProperty(prototype, prop.key, descriptor)
    }
}
