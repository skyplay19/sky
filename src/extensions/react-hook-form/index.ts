import * as _ from './_'
globalify(_)

declare global {
    const useForm: typeof _.useForm
}
