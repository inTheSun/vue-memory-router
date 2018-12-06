import Routes from './routes'
import {
    getKey
} from './utils'

export default (bus, store, moduleName, keyName) => {
    if (store) {
        store.registerModule(moduleName, {
            state: {
                routes: Routes
            },
            mutations: {
                'memoryRouter/FORWARD': (state, {
                    to,
                    from,
                    name
                }) => {
                    state.routes.push(name)
                },
                'memoryRouter/BACK': (state, {
                    to,
                    from,
                    count
                }) => {
                    state.routes.splice(state.routes.length - count, count)
                },
                'memoryRouter/REPLACE': (state, {
                    to,
                    from,
                    name
                }) => {
                    state.routes.splice(Routes.length - 1, 1, name)
                },
                'memoryRouter/REFRESH': (state, {
                    to,
                    from
                }) => {},
                'memoryRouter/RESET': (state) => {
                    state.routes.splice(0, state.routes.length)
                }
            }
        })
    }

    const forward = (name, toRoute, fromRoute) => {
        const to = {
            route: toRoute
        }
        const from = {
            route: fromRoute
        }
        const routes = store ? store.state[moduleName].routes : Routes
        // if from does not exist, it will be set null
        from.name = routes[routes.length - 1] || null
        to.name = name
        store ? store.commit('memoryRouter/FORWARD', {
            to,
            from,
            name
        }) : routes.push(name)
        window.sessionStorage.vueMemoryRouter = JSON.stringify(routes)
        bus.$emit('forward', to, from)
    }
    const back = (count, toRoute, fromRoute) => {
        const to = {
            route: toRoute
        }
        const from = {
            route: fromRoute
        }
        const routes = store ? store.state[moduleName].routes : Routes
        from.name = routes[routes.length - 1]
        to.name = routes[routes.length - 1 - count]
        store ? store.commit('memoryRouter/BACK', {
            to,
            from,
            count
        }) : routes.splice(Routes.length - count, count)
        window.sessionStorage.vueMemoryRouter = JSON.stringify(routes)
        bus.$emit('back', to, from)
    }
    const replace = (name, toRoute, fromRoute) => {
        const to = {
            route: toRoute
        }
        const from = {
            route: fromRoute
        }
        const routes = store ? store.state[moduleName].routes : Routes
        // if from does not exist, it will be set null
        from.name = routes[routes.length - 1] || null
        to.name = name
        store ? store.commit('memoryRouter/REPLACE', {
            to,
            from,
            name
        }) : routes.splice(Routes.length - 1, 1, name)
        window.sessionStorage.vueMemoryRouter = JSON.stringify(routes)
        bus.$emit('replace', to, from)
    }
    const refresh = (toRoute, fromRoute) => {
        const to = {
            route: toRoute
        }
        const from = {
            route: fromRoute
        }
        const routes = store ? store.state[moduleName].routes : Routes
        to.name = from.name = routes[routes.length - 1]
        store ? store.commit('memoryRouter/REFRESH', {
            to,
            from
        }) : null
        bus.$emit('refresh', to, from)
    }
    const reset = () => {
        store ? store.commit('memoryRouter/RESET') : Routes.splice(0, Routes.length)
        window.sessionStorage.vueMemoryRouter = JSON.stringify([])
        bus.$emit('reset')
    }

    const record = (toRoute, fromRoute, replaceFlag) => {
        const name = getKey(toRoute, keyName)
        if (replaceFlag) {
            replace(name, toRoute, fromRoute)
        } else {
            const toIndex = Routes.lastIndexOf(name)
            if (toIndex === -1) {
                forward(name, toRoute, fromRoute)
            } else if (toIndex === Routes.length - 1) {
                refresh(toRoute, fromRoute)
            } else {
                back(Routes.length - 1 - toIndex, toRoute, fromRoute)
            }
        }
    }

    return {
        record,
        reset
    }
}